import React, { useState } from "react";
import axios from "axios";
import { useUser } from "../../context/UserContextProvider";
const ResidentHistory = () => {
  const [phoneNo, setPhoneNo] = useState("");
 const {user}=useUser();
  const {flatNo} = user;
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
      const response = await axios.post(
        "http://localhost:8000/resident/approval-history",
        filterParameters,
        {
          withCredentials: true,
        }
      );
      console.log(response);

      if (response.status < 400) {
        setVisits(response.data.visits || []);
      } else {
        setError(response.data.message || "An unexpected error occurred.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "A network error occurred. Please try again.";
      setError(errorMessage);
      console.error("Filter request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">Visitor Reports</h1>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex md:grid-cols-6 gap-6 items-end justify-evenly">
          <div>
            <label
              htmlFor="phoneNo"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNo"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="98xxxxxxxx"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status's</option>
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Exited">Exited</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleApplyFilters}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md h-10 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-gray-300 mb-4">
          Search Results
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900">
              <tr>
                <th className="py-3 px-6">Visitor Name</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Flat No</th>
                <th className="py-3 px-6">Purpose</th>
                <th className="py-3 px-6">Entry Time</th>
                <th className="py-3 px-6">Exit Time</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Loading results...
                  </td>
                </tr>
              ) : visits.length > 0 ? (
                visits.map((visit) => (
                  <tr
                    key={visit.id}
                    className="border-b border-gray-700 hover:bg-gray-700"
                  >
                    <td className="py-4 px-6 font-medium text-white whitespace-nowrap">
                      {visit.visitor.name}
                    </td>
                    <td className="py-4 px-6">{visit.visitor.phoneNo}</td>
                    <td className="py-4 px-6">{visit.flatNo}</td>
                    <td className="py-4 px-6">{visit.purpose}</td>
                    <td className="py-4 px-6">{visit.entryTime}</td>
                    <td className="py-4 px-6">
                      {/* Refined logic for displaying exit time or status-based text */}
                      {visit.exitTime ||
                        statusConfig[visit.status]?.exitText ||
                        "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      {/* Cleaner way to apply status styles */}
                      <span
                        className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-semibold ${
                          statusConfig[visit.status]?.styles ||
                          statusConfig.Pending.styles
                        }`}
                      >
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No results to display. Please apply filters and click
                    "Search".
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
