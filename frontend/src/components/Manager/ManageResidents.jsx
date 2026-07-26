import React, { useState, useEffect } from "react";
import api from '../../api/axios.js';

const ResidentModal = ({ isOpen, onClose, onSave, flatList }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("resident");
  const [flatNo, setFlatNo] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(""); setPhone(""); setEmail(""); setPassword("");
      setFlatNo(""); setError("");
    }
  }, [isOpen]);

  const isDisabled = !name || !phone || !flatNo || isLoading;

  const handleAddNewResident = async () => {
    setError("");
    setIsLoading(true);
    try {
      const response = await api.post(
        "/manager/register",
        { name, phoneNo: phone, email, password, role, flatNo },
        { withCredentials: true }
      );

      if (response.status < 400) {
        onSave(response.data?.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add resident");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Add New Resident</h2>
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 rounded mb-4 text-xs text-center">{error}</div>}
        <div className="space-y-4">
          <input className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <select className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none text-sm" value={flatNo} onChange={(e) => setFlatNo(e.target.value)}>
            <option value="">Select Flat</option>
            {flatList.map((flat) => <option key={flat} value={flat}>{flat}</option>)}
          </select>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition-colors">Cancel</button>
          <button disabled={isDisabled} onClick={handleAddNewResident} className={`px-4 py-2 rounded font-semibold text-sm transition-all flex items-center justify-center min-w-[120px] ${isDisabled ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"}`}>
            {isLoading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Add Resident"}
          </button>
        </div>
      </div>
    </div>
  );
};


const ManageResidents = () => {
  const [allResidents, setAllResidents] = useState([]);
  const [displayedResidents, setDisplayedResidents] = useState([]);
  const [flatList, setFlatList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterFlat, setFilterFlat] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [resDetails, resFlats] = await Promise.all([
          api.get("/manager/residents-details", { withCredentials: true }),
          api.get("/flat-numbers", { withCredentials: true })
        ]);
        setAllResidents(resDetails.data?.residents || []);
        setDisplayedResidents(resDetails.data?.residents || []);
        setFlatList(resFlats.data?.flatNumbers || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load resident data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    const filtered = allResidents
      .filter((r) => (filterFlat ? r.flatNo === filterFlat : true))
      .filter((r) => (phoneFilter ? r.phoneNo?.includes(phoneFilter) : true))
      .filter((r) => {
        if (statusFilter === "") return true;
        return String(r.isActive) === statusFilter;
      });
    setDisplayedResidents(filtered);
  };

  const handleSaveResident = (resident) => {
    const updated = [...allResidents, resident];
    setAllResidents(updated);
    setDisplayedResidents(updated);
  };

  const handleRemoveResident = async () => {
    try {
      await api.put(
        "/manager/deactivate-resident",
        { flatNo: selectedResident.flatNo },
        { withCredentials: true }
      );
      const updated = allResidents.map((r) => 
        r._id === selectedResident._id ? { ...r, isActive: false } : r
      );
      setAllResidents(updated);
      setDisplayedResidents(updated);
      setRemoveModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove resident");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="h-10 w-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen p-4 md:p-6 font-sans">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Manage Residents</h1>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 p-3 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">Flat Filter</label>
            <select value={filterFlat} onChange={(e) => setFilterFlat(e.target.value)} className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 outline-none text-sm">
              <option value="">All Flats</option>
              {flatList.map((flat) => <option key={flat} value={flat}>{flat}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 outline-none text-sm">
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">Phone Search</label>
            <input value={phoneFilter} onChange={(e) => setPhoneFilter(e.target.value)} className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="Search phone..." />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={handleSearch} className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold transition-all text-sm shadow-lg shadow-blue-900/20">Search</button>
          <button onClick={() => setAddModalOpen(true)} className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold transition-all text-sm shadow-lg shadow-green-900/20">+ Add</button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="min-w-full text-left text-gray-400">
            <thead className="bg-gray-900 text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-700">
              <tr>
                <th className="py-4 px-6">Flat</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6 hidden sm:table-cell">Phone</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {displayedResidents.map((res) => (
                <tr key={res._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="py-4 px-6 text-blue-400 font-mono font-bold">{res.flatNo}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{res.name}</span>
                      <span className="sm:hidden text-xs text-gray-500">{res.phoneNo}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 hidden sm:table-cell">{res.phoneNo}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${res.isActive ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
                      {res.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {res.isActive && (
                      <button onClick={() => { setSelectedResident(res); setRemoveModalOpen(true); }} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase transition-colors">
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {displayedResidents.length === 0 && <div className="text-center py-12 text-gray-500 italic text-sm">No residents found.</div>}
      </div>

      <ResidentModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleSaveResident} flatList={flatList} />

      {isRemoveModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 md:p-8 rounded-xl text-center max-w-sm w-full shadow-2xl border border-gray-700">
            <h2 className="text-lg text-white font-bold mb-3">Confirm Deactivation</h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              Are you sure you want to deactivate <span className="text-white font-bold">{selectedResident?.name}</span>? They will no longer be able to log in.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button onClick={() => setRemoveModalOpen(false)} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded font-semibold text-white transition text-sm order-2 sm:order-1">Cancel</button>
              <button onClick={handleRemoveResident} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold text-white transition text-sm order-1 sm:order-2 shadow-lg shadow-red-900/20">Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageResidents;