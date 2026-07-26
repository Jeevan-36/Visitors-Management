import React, { useState, useEffect } from "react";
import api from '../../api/axios.js';
import { useOutletContext } from "react-router-dom";
import { useUser } from "../../context/UserContextProvider";

const statusConfig = {
  Approved: { styles: "bg-green-800 text-green-200" },
  Active: { styles: "bg-green-800 text-green-200" },
  Exited: { styles: "bg-gray-700 text-gray-300" },
  Pending: { styles: "bg-yellow-800 text-yellow-200" },
  Denied: { styles: "bg-red-800 text-red-200" },
};

const ResidentStatsSection = () => {
  const { user } = useUser();
  const { flatNo } = user;
  const { newApprovalData } = useOutletContext();

  const [onSiteVisitorsCount, setOnSiteVisitorsCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [todayCheckoutCount, setTodayCheckoutCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, activityRes] = await Promise.all([
        api.post("/resident/visitors-summary", { flatNo }, { withCredentials: true }),
        api.post("/resident/recent-activity", { flatNo }, { withCredentials: true })
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
      setError(err.response?.data?.message || "Unable to load resident statistics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (newApprovalData) {
      fetchData();
    }
  }, [newApprovalData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 p-3 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
          <h3 className="text-sm md:text-lg font-semibold text-gray-400 mb-2">Visitors On-site</h3>
          <p className="text-2xl md:text-3xl font-bold text-green-400">{onSiteVisitorsCount}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
          <h3 className="text-sm md:text-lg font-semibold text-gray-400 mb-2">Pending Approvals</h3>
          <p className="text-2xl md:text-3xl font-bold text-yellow-400">{pendingApprovalsCount}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-5 shadow-lg sm:col-span-2 lg:col-span-1">
          <h3 className="text-sm md:text-lg font-semibold text-gray-400 mb-2">Exited Today</h3>
          <p className="text-2xl md:text-3xl font-bold text-gray-400">{todayCheckoutCount}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 shadow-xl overflow-hidden">
        <h2 className="text-lg md:text-xl font-semibold text-gray-300 mb-4">Recent Visitor Activity</h2>

        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="min-w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900">
              <tr>
                <th className="py-3 px-4 md:px-6">Visitor Name</th>
                <th className="py-3 px-4 md:px-6 hidden sm:table-cell">Purpose</th>
                <th className="py-3 px-4 md:px-6">Time</th>
                <th className="py-3 px-4 md:px-6">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentActivity.map((visit, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                  <td className="py-4 px-4 md:px-6 font-medium text-white whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{visit.name}</span>
                      <span className="sm:hidden text-[10px] text-gray-500 font-normal">{visit.purpose}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 md:px-6 hidden sm:table-cell">{visit.purpose}</td>
                  <td className="py-4 px-4 md:px-6 whitespace-nowrap">{visit.time}</td>
                  <td className="py-4 px-4 md:px-6">
                    <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-[10px] font-bold uppercase ${
                      statusConfig[visit.status]?.styles || "bg-gray-600 text-gray-300"
                    }`}>
                      {visit.status}
                    </span>
                  </td>
                </tr>
              ))}

              {recentActivity.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-500 italic">
                    No recent visitor activity
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

export default ResidentStatsSection;