import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';

const GuardReports = () => {
  const [phoneNo, setPhoneNo] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [status, setStatus] = useState('');
  const [visits, setVisits] = useState([]);
  const [flatList, setFlatList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const statusConfig = {
    Approved: { styles: 'bg-green-800 text-green-200', exitText: 'Not Exited' },
    Exited: { styles: 'bg-gray-700 text-gray-300', exitText: 'N/A' },
    Pending: { styles: 'bg-yellow-800 text-yellow-200', exitText: 'Pending Approval' },
    Denied: { styles: 'bg-red-800 text-red-200', exitText: 'Entry Denied' },
  };

  useEffect(() => {
    const getFlatList = async () => {
      try {
        const response = await api.get("/flat-numbers", { withCredentials: true });
        setFlatList(response.data?.flatNumbers || []);
      } catch (err) {
        // Error suppressed for clean UI
      }
    };
    getFlatList();
  }, []);

  const handleApplyFilters = async () => {
    setLoading(true);
    setError('');
    setVisits([]);
    setHasSearched(true);

    const filterParameters = { phoneNo, flatNo, status };

    try {
      const response = await api.post('/guard/search-log', filterParameters, {
        withCredentials: true
      });

      if (response.status < 400) {
        setVisits(response.data.visits || []);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setVisits([]);
      } else {
        setError(err.response?.data?.message || "A network error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 md:p-6 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Visitor Logbook</h1>

      <div className="bg-gray-800 rounded-md p-4 md:p-6 mb-6 border border-gray-700 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-400">Phone Number</label>
            <input
              type="tel"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              disabled={loading}
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="98xxxxxxxx"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-400">Flat Number</label>
            <select
              value={flatNo}
              onChange={(e) => setFlatNo(e.target.value)}
              disabled={loading}
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">All Flats</option>
              {flatList.map((flat) => (<option key={flat} value={flat}>{flat}</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-400">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Exited">Exited</option>
              <option value="Denied">Denied</option>
            </select>
          </div>
          <button
            onClick={handleApplyFilters}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md h-[38px] transition-all disabled:bg-gray-600 flex justify-center items-center shadow-lg shadow-blue-900/20"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-md overflow-hidden border border-gray-700 shadow-2xl">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="min-w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="py-3 px-4 md:px-6">Visitor</th>
                <th className="py-3 px-4 md:px-6 hidden md:table-cell">Phone</th>
                <th className="py-3 px-4 md:px-6">Flat</th>
                <th className="py-3 px-4 md:px-6 hidden sm:table-cell">Purpose</th>
                <th className="py-3 px-4 md:px-6">Entry</th>
                <th className="py-3 px-4 md:px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10 italic text-gray-500">Loading results...</td></tr>
              ) : visits.length > 0 ? (
                visits.map((visit) => (
                  <tr key={visit._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-4 md:px-6 font-medium text-white whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{visit.visitor?.name}</span>
                        <span className="md:hidden text-[10px] text-gray-500 font-normal">{visit.visitor?.phoneNo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 md:px-6 hidden md:table-cell">{visit.visitor?.phoneNo}</td>
                    <td className="py-4 px-4 md:px-6 font-mono text-blue-400">{visit.flatNo}</td>
                    <td className="py-4 px-4 md:px-6 hidden sm:table-cell truncate max-w-[150px]">{visit.purpose}</td>
                    <td className="py-4 px-4 md:px-6 text-[10px] md:text-xs">
                      {new Date(visit.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-4 md:px-6 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[80px] md:w-24 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase ${
                        statusConfig[visit.status]?.styles || 'bg-gray-800 text-gray-400'
                      }`}>
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500 italic text-sm">
                    {hasSearched ? "No visits found for today." : "Apply filters to view visitor logs."}
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

export default GuardReports;