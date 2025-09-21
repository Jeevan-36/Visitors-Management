import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Visitor } from "../models/visitors.model.js";
import { Visit } from "../models/visit.model.js";
export const logoutUser=asyncHandler(async (req,res) => {
    console.log("Logging out user",req.user);
    const userId=req.user._id;
    const user=await User.findByIdAndUpdate(userId,
        { $set: { refreshToken: undefined } },
    );
    res.status(200)
    .
    clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json({ message: "User logged out successfully" });
})

export const getVisitorsSummary = asyncHandler(async (req, res) => {
   try {
      const { flatNo } = req.query;
      console.log("Fetching visitors summary for flatNo:", flatNo);
      if (!flatNo) {
     const activeVisitors= await Visit.countDocuments({ status: 'Approved' });
     const pendingVisitors= await Visit.countDocuments({ status: 'Pending' });
     const deniedVisitors= await Visit.countDocuments({ status: 'Denied' });
     const exitedVisitors= await Visit.countDocuments({ status: 'Exited' });
     const todayVisitors = await Visit.countDocuments({
         entryTime: {
             $gte: new Date(new Date().setHours(0, 0, 0, 0)),
             $lt: new Date(new Date().setHours(23, 59, 59, 999))
         }
     });
     res.status(200).json({
         activeVisitors,
         pendingVisitors,
         deniedVisitors,
         exitedVisitors,
         todayVisitors
     });}
    }catch (error) {

     res.status(500).json({ message: "Error fetching visitors summary" });

   }});

export const getRecentVisitorActivity = asyncHandler(async (req, res) => {
    try {
        const recentActivity = await Visit.find()
        .sort({ entryTime: -1 })
        .limit(5)
        .populate('visitor', 'name')
        .populate('resident', 'flatNo name')
        .select('visitor resident entryTime status');
    
        const formattedActivity = recentActivity.map((visit) => ({
        name: visit.visitor.name,
        resident: visit.resident.flatNo+ " -"+ visit.resident.name,
        time: visit.entryTime.toLocaleString(),
        status: visit.status
        }));
    
        res.status(200).json(formattedActivity);
    } catch (error) {
        res.status(500).json({ message: "Error fetching recent visitor activity" });
    }
    }
);
export const getVisitsOnFilter = asyncHandler(async (req, res) => {
  try {
   
    let { phoneNo, flatNo, status, startDate, endDate } = req.body;

    if (!phoneNo && !flatNo && !status && !startDate && !endDate) {
      throw new ApiError(400, "Please provide at least one filter parameter");
    }

    if (!startDate) {
      let d = new Date();
      d.setMonth(d.getMonth() - 1);
      startDate = d;
    } else {
      startDate = new Date(startDate);
    }

    if (!endDate) endDate = new Date();
    else endDate = new Date(endDate);

    const matchStage = {
      entryTime: { $gte: startDate, $lt: endDate }
    };
    if (status) matchStage.status = status;

    const pipeline = [
      { $match: matchStage },

      {
        $lookup: {
          from: "visitors",
          localField: "visitor",
          foreignField: "_id",
          as: "visitor"
        }
      },
      { $unwind: "$visitor" },

      {
        $lookup: {
          from: "users", 
          localField: "resident",
          foreignField: "_id",
          as: "resident"
        }
      },
      { $unwind: "$resident" }
    ];

    if (phoneNo) {
      pipeline.push({ $match: { "visitor.phoneNo": phoneNo } });
    }

    if (flatNo) {
      pipeline.push({ $match: { "resident.flatNo": flatNo } });
    }

    pipeline.push({ $sort: { entryTime: -1 } });

    const visits = await Visit.aggregate(pipeline);

    if (!visits.length) {
      throw new ApiError(404, "No visits found");
    }

    res.status(200).json({ visits });
  } catch (error) {
    console.error(error.message);
    res
      .status(error.statuscode || 500)
      .json({ message: error.message || "Error while getting visits" });
  }
});

