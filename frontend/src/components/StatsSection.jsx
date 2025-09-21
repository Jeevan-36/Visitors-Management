import React, { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
const StatsSection = ({isAddModalOpen,isExitModalOpen}) => {
    const [onSiteVisitorsCount,setOnSiteVisitorsCount]=useState(0);
      const [pendingApprovalsCount,setPendingApprovalsCount]=useState(0);
      const [todayCheckoutCount,setTodayCheckoutCount]=useState(0);
      const [recentActivity,setRecentActivity]=useState([]);
        useEffect(() => {
    const fetchSummary = async () => {
      try {

        const response = await axios.get("http://localhost:8000/visitors-summary",{
          withCredentials: true,
        });

        if (response.status < 400) {
          const { activeVisitors, pendingVisitors, exitedVisitors } = response.data;

          setOnSiteVisitorsCount(activeVisitors);
          setPendingApprovalsCount(pendingVisitors);
          setTodayCheckoutCount(exitedVisitors);
        }
      } catch (err) {
        console.error("Failed to fetch visitor summary:", err);
      }
    };
    const fetchRecentActivity=async()=>{
      try {
        const response = await axios.get("http://localhost:8000/recent-activity", {
          withCredentials: true,
        });

        if (response.status < 400) {
         setRecentActivity(response.data)
        }
      } catch (err) {
        console.error("Failed to fetch visitor summary:", err);
      }
    }
    

    fetchSummary();
    fetchRecentActivity();
  }, [isAddModalOpen,isExitModalOpen]);

  
  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Visitors On-site</h3>
              <p className="text-3xl font-bold text-blue-400">{onSiteVisitorsCount}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Pending Approvals</h3>
              <p className="text-3xl font-bold text-green-400">{pendingApprovalsCount}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Excited Today</h3>
              <p className="text-3xl font-bold text-yellow-400">{todayCheckoutCount}</p>
            </div>
          </div>

          {/* Recent Visitor Activity Table */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">Recent Visitor Activity</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-500 uppercase bg-gray-900">
                  <tr>
                    <th className="py-3 px-6">Visitor Name</th>
                    <th className="py-3 px-6">Time In/Out</th>
                    <th className="py-3 px-6">Host Resident</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((visitor, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-4 px-6 font-medium text-white whitespace-nowrap">{visitor.name}</td>
                      <td className="py-4 px-6">{visitor.time}</td>
                      <td className="py-4 px-6">{visitor.resident}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-semibold ${
                          visitor.status === 'Approved' ? 'bg-green-800 text-green-200' :
                          visitor.status === 'Exited' ? 'bg-gray-700 text-gray-300' :
                          visitor.status === 'Pending' ? 'bg-yellow-800 text-yellow-200' : ''
                        }`}>
                          {visitor.status}
                        </span>
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        
      
      </>

  )
}

export default StatsSection;