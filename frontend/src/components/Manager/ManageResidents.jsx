import React, { useState, useEffect } from "react";
import api from '../../api/axios.js'

/* =========================
   Add Resident Modal
========================= */
const ResidentModal = ({ isOpen, onClose, onSave, flatList }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("resident");
  const [flatNo, setFlatNo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(""); setPhone(""); setEmail(""); setPassword("");
      setRole("resident"); setFlatNo(""); setError("");
    }
  }, [isOpen]);

  const isDisabled = !name || !phone || !flatNo;

  const handleAddNewResident = async () => {
    setError("");
    try {
      const response = await api.post(
        "/manager/register",
        { name, phoneNo: phone, email, password, role, flatNo },
        { withCredentials: true }
      );

      if (response.status < 400) {
        onSave(response.data?.user); // Backend now includes isActive: true
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add resident");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-2xl border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Add New Resident</h2>
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 rounded mb-4 text-sm text-center">{error}</div>}
        <div className="space-y-4">
          <input className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <select className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none" value={flatNo} onChange={(e) => setFlatNo(e.target.value)}>
            <option value="">Select Flat</option>
            {flatList.map((flat) => <option key={flat} value={flat}>{flat}</option>)}
          </select>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Cancel</button>
          <button disabled={isDisabled} onClick={handleAddNewResident} className={`px-4 py-2 rounded font-semibold ${isDisabled ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>Add Resident</button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   Manage Residents
========================= */
const ManageResidents = () => {
  const [allResidents, setAllResidents] = useState([]);
  const [displayedResidents, setDisplayedResidents] = useState([]);
  const [flatList, setFlatList] = useState([]);

  // Filters
  const [filterFlat, setFilterFlat] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" (All), "true", "false"

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resDetails, resFlats] = await Promise.all([
          api.get("/manager/residents-details", { withCredentials: true }),
          api.get("/flat-numbers", { withCredentials: true })
        ]);
        setAllResidents(resDetails.data?.residents || []);
        setDisplayedResidents(resDetails.data?.residents || []);
        setFlatList(resFlats.data?.flatNumbers || []);
      } catch (err) {
        setError("Failed to load resident data");
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

      // Update local state to reflect deactivation
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

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen p-6 font-sans">
      <h1 className="text-3xl font-bold text-white mb-6">Manage Residents</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <select value={filterFlat} onChange={(e) => setFilterFlat(e.target.value)} className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 outline-none">
            <option value="">All Flats</option>
            {flatList.map((flat) => <option key={flat} value={flat}>{flat}</option>)}
          </select>

          {/* STATUS FILTER */}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 outline-none">
            <option value="">All Status's</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <input value={phoneFilter} onChange={(e) => setPhoneFilter(e.target.value)} className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 outline-none focus:border-blue-500" placeholder="Search Phone..." />
        </div>

        <div className="flex space-x-3">
          <button onClick={() => setAddModalOpen(true)} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold transition shadow-md">+ Add Resident</button>
          <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold transition shadow-md">Search</button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
        <table className="min-w-full text-left text-gray-400">
          <thead className="bg-gray-900 text-xs uppercase tracking-widest text-gray-500 border-b border-gray-700">
            <tr>
              <th className="py-3 px-6">Flat</th>
              <th className="py-3 px-6">Name</th>
              <th className="py-3 px-6">Phone</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedResidents.map((res) => (
              <tr key={res._id} className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors">
                <td className="py-4 px-6 text-white font-medium">{res.flatNo}</td>
                <td className="py-4 px-6">{res.name}</td>
                <td className="py-4 px-6">{res.phoneNo}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${res.isActive ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-red-500/20 text-red-400 border border-red-500/50"}`}>
                    {res.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  {res.isActive && (
                    <button onClick={() => { setSelectedResident(res); setRemoveModalOpen(true); }} className="text-red-500 hover:text-red-400 font-medium transition-colors">
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayedResidents.length === 0 && <p className="text-center py-10 text-gray-500 italic">No residents found.</p>}
      </div>

      <ResidentModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleSaveResident} flatList={flatList} />

      {isRemoveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-xl text-center max-w-sm w-full shadow-2xl border border-gray-700">
            <h2 className="text-xl text-white font-bold mb-4">Confirm Deactivation</h2>
            <p className="text-gray-400 mb-8">Deactivate <span className="text-white font-bold">{selectedResident?.name}</span> (Flat {selectedResident?.flatNo})?</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setRemoveModalOpen(false)} className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded font-semibold text-white transition">Cancel</button>
              <button onClick={handleRemoveResident} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold text-white transition">Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageResidents;