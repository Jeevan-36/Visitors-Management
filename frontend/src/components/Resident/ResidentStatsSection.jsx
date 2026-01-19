import React, { useState, useEffect, Children } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { useUser } from '../../context/UserContextProvider';
const ResidentStatsSection = () => {
  const {user}=useUser();
  const {flatNo} = user;
  const [onSiteVisitorsCount, setOnSiteVisitorsCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [todayCheckoutCount, setTodayCheckoutCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const { newApprovalData } = useOutletContext();
  

  const fetchData = async () => {
    try {
      const summaryRes = await axios.post("http://localhost:8000/resident/visitors-summary", { flatNo }, { withCredentials: true });
      if (summaryRes.status < 400) {
        const { activeVisitors, pendingVisitors, exitedVisitors } = summaryRes.data;
        setOnSiteVisitorsCount(activeVisitors);
        setPendingApprovalsCount(pendingVisitors);
        setTodayCheckoutCount(exitedVisitors);
      }
      
      const activityRes = await axios.post("http://localhost:8000/resident/recent-activity", { flatNo }, { withCredentials: true });
      if (activityRes.status < 400) {
        console.log(activityRes.data);
        setRecentActivity(activityRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch resident data:", err);
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Visitors On-site</h3>
          <p className="text-3xl font-bold text-blue-400">{onSiteVisitorsCount}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Pending Approvals</h3>
          <p className="text-3xl font-bold text-yellow-400">{pendingApprovalsCount}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Exited Today</h3>
          <p className="text-3xl font-bold text-gray-500">{todayCheckoutCount}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-gray-300 mb-4">Recent Visitor Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900">
              <tr>
                <th className="py-3 px-6">Visitor Name</th>
                <th className="py-3 px-6">Purpose</th>
                <th className="py-3 px-6">Time</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((visit, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-4 px-6 font-medium text-white whitespace-nowrap">{visit.name}</td>
                  <td className="py-4 px-6">{visit.purpose}</td>
                  <td className="py-4 px-6">{visit.time}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-semibold ${
                      visit.status === 'Active' || visit.status === 'Approved' ? 'bg-green-800 text-green-200' :
                      visit.status === 'Exited' ? 'bg-gray-700 text-gray-300' :
                      'bg-yellow-800 text-yellow-200'
                    }`}>
                      {visit.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ResidentStatsSection;