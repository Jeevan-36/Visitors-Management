import api from '../../api/axios.js'
import React, { useEffect, useState } from 'react';

const GuardVisits = () => {
  const statusStyles = {
    Pending: { styles: "bg-yellow-800 text-yellow-200" },
    Approved: { styles: "bg-green-800 text-green-200" },
    Exited: { styles: "bg-gray-700 text-gray-300" },
    Denied: { styles: "bg-red-800 text-red-200" },
  };

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const response = await api.get(
          "/guard/get-todays-visits",
          { withCredentials: true }
        );
        console.log(response.data);
        setRecentActivity(response.data); 
      } catch (error) {
        console.error("Error fetching visits", error);
      }
    };
    fetchRecentActivity();
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen p-6 font-sans">
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-gray-300 mb-4">
          Recent Visitor Activity
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900">
              <tr>
                <th className="py-3 px-6">Visitor Name - PhoneNo</th>
                <th className="py-3 px-6">Time</th>
                <th className="py-3 px-6">Host Resident</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((visit, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-700 hover:bg-gray-700"
                >
                  <td className="py-4 px-6 font-medium text-white whitespace-nowrap">
                    {visit.name} - {visit.phoneNo}
                  </td>
                  <td className="py-4 px-6">{visit.time}</td>
                  <td className="py-4 px-6">{visit.resident}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-semibold ${
                        statusStyles[visit.status]?.styles ||
                        "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {visit.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GuardVisits;
