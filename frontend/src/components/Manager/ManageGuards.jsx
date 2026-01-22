import React, { useState, useEffect } from "react";
import axios from "axios";

/* =========================
   Add Guard Modal
========================= */
const AddGuardModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(""); setPhone(""); setEmail(""); setPassword("");
      setError("");
    }
  }, [isOpen]);

  const isDisabled = !name || !phone || !password || !email;

  const handleAddNewGuard = async () => {
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:8000/manager/register",
        { name, phoneNo: phone, email, password, role: "guard" },
        { withCredentials: true }
      );

      if (response.status < 400) {
        onSave(response.data?.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add guard");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Add New Guard</h2>
          <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">ID Auto-generated</span>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 rounded mb-4 text-sm text-center">{error}</div>}
        <div className="space-y-4">
          <input className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="flex justify-end space-x-4 mt-8">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition">Cancel</button>
          <button disabled={isDisabled} onClick={handleAddNewGuard} className={`px-4 py-2 rounded font-semibold transition ${isDisabled ? "bg-gray-600 cursor-not-allowed text-gray-400" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"}`}>Register Guard</button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   Manage Guards
========================= */
const ManageGuards = () => {
  const [allGuards, setAllGuards] = useState([]);
  const [displayedGuards, setDisplayedGuards] = useState([]);
  const [guardIdList, setGuardIdList] = useState([]);

  // Filter States
  const [filterId, setFilterId] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" (All), "true", "false"

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuards = async () => {
      try {
        const response = await axios.get("http://localhost:8000/manager/guards-details", { withCredentials: true });
        const guards = response.data?.guards || [];
        setAllGuards(guards);
        setDisplayedGuards(guards);
        const ids = guards.map(g => g.employeeId).filter(Boolean);
        setGuardIdList([...new Set(ids)]);
       
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch guards");
      }
    };
    fetchGuards();
  }, []);

  const handleSearch = () => {
    const filtered = allGuards
      .filter((g) => (filterId ? g.employeeId === filterId : true))
      .filter((g) => (phoneFilter ? g.phoneNo?.includes(phoneFilter) : true))
      .filter((g) => {
        if (statusFilter === "") return true;
        const isActive = statusFilter === "true";
        return g.isActive === isActive;
      });
    setDisplayedGuards(filtered);
  };

  const handleSaveGuard = (newGuard) => {
    const updated = [...allGuards, newGuard];
    setAllGuards(updated);
    setDisplayedGuards(updated);
    if (newGuard.employeeId && !guardIdList.includes(newGuard.employeeId)) {
      setGuardIdList(prev => [...prev, newGuard.employeeId].sort());
    }
  };

  const handleRemoveGuard = async () => {
    try {
      await axios.put(
        "http://localhost:8000/manager/deactivate-guard",
        { employeeId: selectedGuard.employeeId },
        { withCredentials: true }
      );
      
      // Update local state to reflect deactivation instead of just filtering out
      const updated = allGuards.map(g => 
        g._id === selectedGuard._id ? { ...g, isActive: false } : g
      );
      setAllGuards(updated);
      setDisplayedGuards(updated);
      setRemoveModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove guard");
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen p-6 font-sans">
      <h1 className="text-3xl font-bold text-white mb-6">Manage Guards</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          {/* Employee ID Filter */}
          <select
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
            className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 outline-none focus:border-blue-500"
          >
            <option value="">All Guard IDs</option>
            {guardIdList.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 outline-none focus:border-blue-500"
          >
            <option value="">All Status's</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <input
            value={phoneFilter}
            onChange={(e) => setPhoneFilter(e.target.value)}
            className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 outline-none focus:border-blue-500 w-64"
            placeholder="Search Phone..."
          />
        </div>

        <div className="flex space-x-3">
          <button onClick={() => setAddModalOpen(true)} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold transition shadow-md">+ Add Guard</button>
          <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold transition shadow-md">Search</button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
        <table className="min-w-full text-left text-gray-400">
          <thead className="bg-gray-900 text-xs uppercase tracking-widest text-gray-500 border-b border-gray-700">
            <tr>
              <th className="py-3 px-6">ID</th>
              <th className="py-3 px-6">Name</th>
              <th className="py-3 px-6">Phone</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedGuards.map((guard) => (
              <tr key={guard._id} className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors">
                <td className="py-4 px-6 text-blue-400 font-mono text-sm">{guard.employeeId}</td>
                <td className="py-4 px-6 text-white font-medium">{guard.name}</td>
                <td className="py-4 px-6">{guard.phoneNo}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${guard.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {guard.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  {guard.isActive && (
                    <button
                      onClick={() => { setSelectedGuard(guard); setRemoveModalOpen(true); }}
                      className="text-red-500 hover:text-red-400 font-medium transition-colors"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayedGuards.length === 0 && (
          <p className="text-center py-10 text-gray-500 italic">No guards found matching your criteria.</p>
        )}
      </div>

      <AddGuardModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleSaveGuard} />

      {isRemoveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-xl text-center max-w-sm w-full shadow-2xl border border-gray-700">
            <h2 className="text-xl text-white font-bold mb-4">Confirm Deactivation</h2>
            <p className="text-gray-400 mb-8">Deactivate guard <span className="text-white font-bold">{selectedGuard?.name}</span>? They will no longer be able to log in.</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setRemoveModalOpen(false)} className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded font-semibold text-white transition">Cancel</button>
              <button onClick={handleRemoveGuard} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold text-white transition">Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGuards;