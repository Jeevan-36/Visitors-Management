import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  // --- FETCH FLAT LIST (Same as Manager) ---
  useEffect(() => {
    const getFlatList = async () => {
      try {
        const response = await axios.get("http://localhost:8000/flat-numbers", { withCredentials: true });
        setFlatList(response.data?.flatNumbers || []);
      } catch (err) {
        console.error("Failed to fetch flats:", err);
      }
    };
    getFlatList();
  }, []);

  const handleApplyFilters = async () => {
    setLoading(true);
    setError('');
    setVisits([]);
    setHasSearched(true);

    // Date filters removed - Backend should default to "Today"
    const filterParameters = { phoneNo, flatNo, status };
    
    try {
      const response = await axios.post('http://localhost:8000/guard/search-log', filterParameters, {
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
    <div className="bg-gray-900 min-h-screen text-white p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">Visitor Logbook</h1>
      
      {/* --- Filter Bar (Identical UI, 4 columns) --- */}
      <div className="bg-gray-800 rounded-md p-4 mb-6 border border-gray-700 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
            <input 
              type="tel" 
              value={phoneNo} 
              onChange={(e) => setPhoneNo(e.target.value)} 
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 outline-none focus:border-blue-500" 
              placeholder="Search Phone..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Flat Number</label>
            <select 
              value={flatNo} 
              onChange={(e) => setFlatNo(e.target.value)} 
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="">All Flats</option>
              {flatList.map((flat) => (<option key={flat} value={flat}>{flat}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 outline-none focus:border-blue-500"
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md h-10 transition-colors disabled:bg-gray-600"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* --- Results Table (Identical UI) --- */}
      <div className="bg-gray-800 rounded-md overflow-hidden border border-gray-700 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="py-3 px-6">Visitor Name</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Flat No</th>
                <th className="py-3 px-6">Purpose</th>
                <th className="py-3 px-6">Entry Time</th>
                <th className="py-3 px-6">Exit Time</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10 italic">Loading results...</td></tr>
              ) : visits.length > 0 ? (
                visits.map((visit) => (
                  <tr key={visit._id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{visit.visitor?.name}</td>
                    <td className="py-4 px-6">{visit.visitor?.phoneNo}</td>
                    <td className="py-4 px-6 font-mono text-blue-400">{visit.flatNo}</td>
                    <td className="py-4 px-6">{visit.purpose}</td>
                    <td className="py-4 px-6 text-xs">{new Date(visit.entryTime).toLocaleString()}</td>
                    <td className="py-4 px-6 text-xs">
                      {visit.exitTime ? new Date(visit.exitTime).toLocaleString() : (statusConfig[visit.status]?.exitText || 'N/A')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center justify-center w-24 py-1 rounded-full text-[10px] font-bold border ${
                        statusConfig[visit.status]?.styles || 'bg-gray-800 text-gray-400 border-gray-600'
                      }`}>
                        {visit.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500 italic">
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