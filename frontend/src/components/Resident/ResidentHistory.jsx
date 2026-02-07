import React, { useState } from "react";
import api from '../../api/axios.js'
import { useUser } from "../../context/UserContextProvider";

const ResidentHistory = () => {
  const [phoneNo, setPhoneNo] = useState("");
  const { user } = useUser();
  const { flatNo } = user;
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const statusConfig = {
    Approved: {
      styles: "bg-green-800 text-green-200",
      exitText: "Not Exited",
    },
    Active: {
      styles: "bg-green-800 text-green-200",
      exitText: "Not Exited",
    },
    Exited: {
      styles: "bg-gray-700 text-gray-300",
      exitText: "N/A",
    },
    Pending: {
      styles: "bg-yellow-800 text-yellow-200",
      exitText: "Pending Approval",
    },
    Denied: {
      styles: "bg-red-800 text-red-200",
      exitText: "Entry Denied",
    },
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    setError("");
    setVisits([]);

    const filterParameters = { phoneNo, flatNo, status, startDate, endDate };

    try {
      const response = await api.post(
        "/resident/approval-history",
        filterParameters,
        { withCredentials: true }
      );

      if (response.status < 400) {
        setVisits(response.data.visits || []);
      } else {
        setError(response.data.message || "An unexpected error occurred.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 md:p-6 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Visitor Reports</h1>

      <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-6 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-1">
            <label htmlFor="phoneNo" className="block text-xs font-medium text-gray-400">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNo"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="98xxxxxxxx"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="status" className="block text-xs font-medium text-gray-400">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Exited">Exited</option>
              <option value="Denied">Denied</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="startDate" className="block text-xs font-medium text-gray-400">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="endDate" className="block text-xs font-medium text-gray-400">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <button
            onClick={handleApplyFilters}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed text-sm flex justify-center items-center h-[38px]"
          >
            {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Search"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
         {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4 shadow-xl overflow-hidden">
        <h2 className="text-lg md:text-xl font-semibold text-gray-300 mb-4">Search Results</h2>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="min-w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
              <tr>
                <th className="py-3 px-4 md:px-6">Visitor Name</th>
                <th className="py-3 px-4 md:px-6 hidden md:table-cell">Phone</th>
                <th className="py-3 px-4 md:px-6 hidden sm:table-cell">Purpose</th>
                <th className="py-3 px-4 md:px-6">Entry</th>
                <th className="py-3 px-4 md:px-6">Exit</th>
                <th className="py-3 px-4 md:px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 italic text-gray-500">
                    Fetching records...
                  </td>
                </tr>
              ) : visits.length > 0 ? (
                visits.map((visit) => (
                  <tr key={visit.id} className="border-b border-gray-700/50 hover:bg-gray-700 transition-colors">
                    <td className="py-4 px-4 md:px-6 font-medium text-white whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{visit.visitor.name}</span>
                        <span className="md:hidden text-[10px] text-gray-500 font-normal">{visit.visitor.phoneNo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 md:px-6 hidden md:table-cell">{visit.visitor.phoneNo}</td>
                    <td className="py-4 px-4 md:px-6 hidden sm:table-cell">{visit.purpose}</td>
                    <td className="py-4 px-4 md:px-6 whitespace-nowrap">{visit.entryTime}</td>
                    <td className="py-4 px-4 md:px-6 whitespace-nowrap text-xs">
                      {visit.exitTime || statusConfig[visit.status]?.exitText || "N/A"}
                    </td>
                    <td className="py-4 px-4 md:px-6 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[80px] py-1 px-2.5 rounded-full text-[10px] font-bold uppercase ${
                        statusConfig[visit.status]?.styles || "bg-gray-600 text-gray-300"
                      }`}>
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500 italic">
                    No results found. Adjust filters to search again.
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

export default ResidentHistory;