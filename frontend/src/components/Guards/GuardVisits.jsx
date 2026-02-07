import api from '../../api/axios.js';
import React, { useEffect, useState } from 'react';

const GuardVisits = () => {
  const statusStyles = {
    Pending: { styles: "bg-yellow-800 text-yellow-200" },
    Approved: { styles: "bg-green-800 text-green-200" },
    Exited: { styles: "bg-gray-700 text-gray-300" },
    Denied: { styles: "bg-red-800 text-red-200" },
  };

  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(
          "/guard/get-todays-visits",
          { withCredentials: true }
        );
        setRecentActivity(response.data || []);
      } catch (error) {
        setError("Failed to fetch today's visits. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentActivity();
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen p-4 md:p-6 font-sans">
      <div className="bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-700">
        <h2 className="text-lg md:text-xl font-semibold text-gray-300 mb-4">
          Today's Visitor Activity
        </h2>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="min-w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900">
              <tr>
                <th className="py-3 px-4 md:px-6">Visitor Details</th>
                <th className="py-3 px-4 md:px-6">Time</th>
                <th className="py-3 px-4 md:px-6 hidden sm:table-cell">Host Resident</th>
                <th className="py-3 px-4 md:px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  </td>
                </tr>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((visit, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-4 px-4 md:px-6 font-medium text-white whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{visit.name}</span>
                        <span className="text-[10px] text-gray-500 font-normal">{visit.phoneNo}</span>
                        <span className="sm:hidden text-[10px] text-blue-400 font-normal mt-1">{visit.resident}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 md:px-6 whitespace-nowrap text-xs md:text-sm">
                      {visit.time}
                    </td>
                    <td className="py-4 px-4 md:px-6 hidden sm:table-cell">
                      {visit.resident}
                    </td>
                    <td className="py-4 px-4 md:px-6">
                      <span
                        className={`inline-flex items-center justify-center min-w-[75px] py-1 px-2.5 rounded-full text-[10px] font-bold uppercase ${
                          statusStyles[visit.status]?.styles || "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-500 italic">
                    No visitor activity recorded for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GuardVisits;