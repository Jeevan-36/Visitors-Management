import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';

const StatsSection = ({ isAddModalOpen, isExitModalOpen }) => {
  const [onSiteVisitorsCount, setOnSiteVisitorsCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [todayCheckoutCount, setTodayCheckoutCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusConfig = {
    Approved: { styles: 'bg-green-800 text-green-200' },
    Exited: { styles: 'bg-gray-700 text-gray-300' },
    Pending: { styles: 'bg-yellow-800 text-yellow-200' },
    Denied: { styles: 'bg-red-800 text-red-200' },
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [summaryRes, activityRes] = await Promise.all([
          api.get("/visitors-summary", { withCredentials: true }),
          api.get("/recent-activity", { withCredentials: true })
        ]);

        if (summaryRes.status < 400) {
          const { activeVisitors, pendingVisitors, exitedVisitors } = summaryRes.data;
          setOnSiteVisitorsCount(activeVisitors);
          setPendingApprovalsCount(pendingVisitors);
          setTodayCheckoutCount(exitedVisitors);
        }

        if (activityRes.status < 400) {
          setRecentActivity(activityRes.data);
        }
      } catch (err) {
        setError("Failed to sync dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAddModalOpen, isExitModalOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-md mb-6">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-gray-800 rounded-md p-5 shadow-lg">
          <h3 className="text-base md:text-lg font-semibold text-gray-400 mb-2">Visitors On-site</h3>
          <p className="text-2xl md:text-3xl font-bold text-blue-400">{onSiteVisitorsCount}</p>
        </div>
        <div className="bg-gray-800 rounded-md p-5 shadow-lg">
          <h3 className="text-base md:text-lg font-semibold text-gray-400 mb-2">Pending Approvals</h3>
          <p className="text-2xl md:text-3xl font-bold text-green-400">{pendingApprovalsCount}</p>
        </div>
        <div className="bg-gray-800 rounded-md p-5 shadow-lg sm:col-span-2 lg:col-span-1">
          <h3 className="text-base md:text-lg font-semibold text-gray-400 mb-2">Exited Today</h3>
          <p className="text-2xl md:text-3xl font-bold text-yellow-400">{todayCheckoutCount}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-md p-4 shadow-xl">
        <h2 className="text-lg md:text-xl font-semibold text-gray-300 mb-4">Recent Visitor Activity</h2>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="min-w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900">
              <tr>
                <th className="py-3 px-3 md:px-6">Visitor Name</th>
                <th className="py-3 px-3 md:px-6">Time In/Out</th>
                <th className="py-3 px-3 md:px-6 hidden sm:table-cell">Host Resident</th>
                <th className="py-3 px-3 md:px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length > 0 ? (
                recentActivity.map((visitor, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-3 md:px-6 font-medium text-white whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{visitor.name}</span>
                        <span className="sm:hidden text-[10px] text-gray-500 font-normal">{visitor.resident}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 md:px-6 whitespace-nowrap">{visitor.time}</td>
                    <td className="py-4 px-3 md:px-6 hidden sm:table-cell">{visitor.resident}</td>
                    <td className="py-4 px-3 md:px-6">
                      <span className={`inline-flex items-center justify-center w-16 md:w-20 py-1 rounded-full text-[9px] md:text-[10px] font-bold ${
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