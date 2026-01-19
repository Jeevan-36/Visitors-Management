import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Visit } from "../models/visit.model.js";

const loginResident = asyncHandler(async (req, res) => {
  try {
   
    const { phoneNo, password, role } = req.body;
    if (!phoneNo || !password || !role) {
      throw new ApiError(400, "Please provide all fields");
    }
    const user = await User.findOne({ phoneNo, role }).select("+password");
    if (!user) {
      throw new ApiError(404, "Resident not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid password");
    }
    
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    console.log(accessToken);
    user.refreshToken=refreshToken;
    await user.save();
   const userDetails = await User.findOne({ phoneNo, role: "resident" }).select("-refreshToken");
   const options={
    httpOnly:true,
    secure:false,
      sameSite: "lax"    
   }
    res.
    cookie("accessToken",accessToken).
    cookie("refreshToken",refreshToken).
    status(200).json({ user: userDetails });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Error while logging in Resident" });
  }
});

const getPendingApprovals=asyncHandler(async(req,res)=>{
  try {
    const {flatNo}=req.body;
    if(!flatNo){
      throw new ApiError(400,"Please provide all fields");
      }
      const visitDetails=await Visit.find(
        {
          status:"Pending"
          }
      ).populate('visitor').populate('resident')
      if(!visitDetails){
        throw new ApiError(404,"No pending visits found");
        }
        const filteredVisits=visitDetails.filter(visit=>visit.resident.flatNo===flatNo)
        res.status(200).json(
          {
            pendingVisits:filteredVisits
            }
        )
  } catch (error) {
    res.status(error.statuscode || 500).json({ message: error.message || "Error while fetching pending approvals by Resident"});
  }
}
);

const approveVisitor=asyncHandler(async(req,res)=>{
  try {
     const {_id}=req.body;
     console.log(_id);
     if(!_id){
      throw new ApiError(500,"some error occurred while approving visitor");
      }
      const visitDetails=await Visit.findById(
        {
          _id
          }
      )
      if(!visitDetails){
        throw new ApiError(404,"Visit not found");
        }
      if(visitDetails.status==='Exited' ){
        throw new ApiError(400,"Visitor has already exited ");
      }
      if(visitDetails.status==='Approved'){
        throw new ApiError(400,"Visitor has already been approved");
      }
        visitDetails.status="Approved"
        await visitDetails.save()
        res.status(200).json(
          {
            visitDetails
            }
        )
  } catch (error) {
    res.status(error.statuscode || 500).json({ message: error.message || "Error while approving visitor by Resident"});
  }
})

const denyVisitor=asyncHandler(async(req,res)=>{
  try {
     const {_id}=req.body;
     if(!_id){
      throw new ApiError(500,"some error occurred while Denying visitor");
      }
      const visitDetails=await Visit.findById(
        {
          _id
          }
      )
      if(!visitDetails){
        throw new ApiError(404,"Visit not found");
        }
      if(visitDetails.status==='Exited' ){
        throw new ApiError(400,"Visitor has already exited ");
      }
      if(visitDetails.status==='Denied'){
        throw new ApiError(400,"Visitor has already been approved");
      }
        visitDetails.status="Denied"
        await visitDetails.save()
        res.status(200).json(
          {
            visitDetails
            }
        )
  } catch (error) {
    res.status(error.statuscode || 500).json({ message: error.message || "Error while approving visitor by Resident"});
  }
})


const getResidentVisitorsCount = async (req, res) => {
  try {
    const { flatNo } = req.body;

    const matchStage = [];
    if (flatNo) {
      const residentLookup = [
        {
          $lookup: {
            from: "users",
            localField: "resident",
            foreignField: "_id",
            as: "residentDetails"
          }
        },
        { $unwind: "$residentDetails" },
        { $match: { "residentDetails.flatNo": flatNo } }
      ];
      matchStage.push(...residentLookup);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const pipeline = [
      ...matchStage,
      {
        $facet: {
          statusCounts: [
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ],
          todayCount: [
            { $match: { createdAt: { $gte: todayStart, $lt: todayEnd } } },
            { $count: "count" }
          ]
        }
      }
    ];

    const results = await Visit.aggregate(pipeline);

    const summary = {
      activeVisitors: 0,      // 👈 matches frontend state
      pendingVisitors: 0,
      exitedVisitors: 0
    };

    if (results[0]) {
      results[0].statusCounts.forEach(item => {
        if (item._id === "Active" || item._id === "Approved")
          summary.activeVisitors += item.count;
        if (item._id === "Pending") summary.pendingVisitors = item.count;
        if (item._id === "Exited") summary.exitedVisitors = item.count;
      });
    }

    res.status(200).json(summary);
  } catch (error) {
    console.error("Error in getVisitorCounts:", error);
    res.status(500).json({ message: "Error fetching visitor counts", error: error.message });
  }
};
//get latest modified details
const getResidentRecentActivity = async (req, res) => {
  try {
    const { flatNo } = req.body;
    if (!flatNo) {
      return res.status(400).json({ message: "flatNo is required" });
    }

    const recentActivity = await Visit.aggregate([
      // 1. Filter by flatNo directly (much faster)
      { $match: { flatNo: flatNo } },

      // 2. Sort by newest entries
      { $sort: { createdAt: -1 } },

      // 3. Limit to the latest 5
      { $limit: 5 },

      // 4. Join with the Visitor collection
      {
        $lookup: {
          from: "visitors",
          localField: "visitor",
          foreignField: "_id",
          as: "visitorData"
        }
      },

      // 5. Flatten the visitor array
      { $unwind: "$visitorData" },

      // 6. Project specific paths to avoid "name" collision
      {
        $project: {
          _id: 0,
          name: "$visitorData.name", // Force extraction from Visitor collection
          purpose: 1,
          status: 1,
          time: "$createdAt"
        }
      }
    ]);

    const formattedActivity = recentActivity.map(visit => ({
      ...visit,
      time: visit.time 
        ? new Date(visit.time).toLocaleString("en-IN", {
            dateStyle: "short",
            timeStyle: "short",
          }) 
        : "N/A"
    }));

    res.status(200).json(formattedActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { loginResident ,getPendingApprovals,approveVisitor,denyVisitor,getResidentRecentActivity,getResidentVisitorsCount};