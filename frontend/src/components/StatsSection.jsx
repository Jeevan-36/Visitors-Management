import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatsSection = ({ isAddModalOpen, isExitModalOpen }) => {
  const [onSiteVisitorsCount, setOnSiteVisitorsCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [todayCheckoutCount, setTodayCheckoutCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  const statusConfig = {
    Approved: { styles: 'bg-green-800 text-green-200' },
    Exited: { styles: 'bg-gray-700 text-gray-300' },
    Pending: { styles: 'bg-yellow-800 text-yellow-200' },
    Denied: { styles: 'bg-red-800 text-red-200' },
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get("http://localhost:8000/visitors-summary", {
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

    const fetchRecentActivity = async () => {
      try {
        const response = await axios.get("http://localhost:8000/recent-activity", {
          withCredentials: true,
        });
        if (response.status < 400) {
          console.log(response.data+"thereitis");
          setRecentActivity(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch recent activity:", err);
      }
    };

    fetchSummary();
    fetchRecentActivity();
  }, [isAddModalOpen, isExitModalOpen]);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-md p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Visitors On-site</h3>
          <p className="text-3xl font-bold text-blue-400">{onSiteVisitorsCount}</p>
        </div>
        <div className="bg-gray-800 rounded-md p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Pending Approvals</h3>
          <p className="text-3xl font-bold text-green-400">{pendingApprovalsCount}</p>
        </div>
        <div className="bg-gray-800 rounded-md p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Exited Today</h3>
          <p className="text-3xl font-bold text-yellow-400">{todayCheckoutCount}</p>
        </div>
      </div>

      {/* Recent Visitor Activity Table */}
      <div className="bg-gray-800 rounded-md p-4 shadow-xl">
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
              {recentActivity.length > 0 ? (
                recentActivity.map((visitor, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-white whitespace-nowrap">{visitor.name}</td>
                    <td className="py-4 px-6">{visitor.time}</td>
                    <td className="py-4 px-6">{visitor.resident}</td>
                    <td className="py-4 px-6">
                      {/* Fixed width 'w-20' and 'justify-center' added here */}
                      <span className={`inline-flex items-center justify-center w-20 py-1 rounded-full text-[10px] font-bold ${
                        statusConfig[visitor.status]?.styles || 'bg-gray-700 text-gray-300'
                      }`}>
                        {visitor.status ? visitor.status.toUpperCase() : 'UNKNOWN'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-500 italic">
                    No recent activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default StatsSection;