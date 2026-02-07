import React, { useState, useEffect } from "react";
import api from '../../api/axios.js';


const AddGuardModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(""); setPhone(""); setEmail(""); setPassword("");
      setError("");
    }
  }, [isOpen]);

  const isDisabled = !name || !phone || !password || !email || isLoading;

  const handleAddNewGuard = async () => {
    setError("");
    setIsLoading(true);
    try {
      const response = await api.post(
        "/manager/register",
        { name, phoneNo: phone, email, password, role: "guard" },
        { withCredentials: true }
      );

      if (response.status < 400) {
        onSave(response.data?.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add guard");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Add New Guard</h2>
          <span className="text-[10px] text-blue-400 bg-blue-400/10 px-2 py-1 rounded uppercase font-bold">Auto-ID</span>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 rounded mb-4 text-xs text-center">{error}</div>}
        <div className="space-y-4">
          <input className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="flex justify-end space-x-3 mt-8">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm transition-colors">Cancel</button>
          <button disabled={isDisabled} onClick={handleAddNewGuard} className={`px-4 py-2 rounded font-semibold text-sm transition-all flex items-center justify-center min-w-[130px] ${isDisabled ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"}`}>
            {isLoading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Register Guard"}
          </button>
        </div>
      </div>
    </div>
  );
};


const ManageGuards = () => {
  const [allGuards, setAllGuards] = useState([]);
  const [displayedGuards, setDisplayedGuards] = useState([]);
  const [guardIdList, setGuardIdList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterId, setFilterId] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuards = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/manager/guards-details", { withCredentials: true });
        const guards = response.data?.guards || [];
        setAllGuards(guards);
        setDisplayedGuards(guards);
        const ids = guards.map(g => g.employeeId).filter(Boolean);
        setGuardIdList([...new Set(ids)]);
      } catch (err) {
        setError("Failed to fetch guards");
      } finally {
        setIsLoading(false);
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
        return String(g.isActive) === statusFilter;
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
      await api.put(
        "/manager/deactivate-guard",
        { employeeId: selectedGuard.employeeId },
        { withCredentials: true }
      );
      const updated = allGuards.map(g => 
        g._id === selectedGuard._id ? { ...g, isActive: false } : g
      );
      setAllGuards(updated);
      setDisplayedGuards(updated);
      setRemoveModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate guard");
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
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Manage Guards</h1>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">Employee ID</label>
            <select value={filterId} onChange={(e) => setFilterId(e.target.value)} className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 outline-none text-sm focus:ring-1 focus:ring-blue-500">
              <option value="">All Guard IDs</option>
              {guardIdList.map((id) => <option key={id} value={id}>{id}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 outline-none text-sm focus:ring-1 focus:ring-blue-500">
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
          <button onClick={() => setAddModalOpen(true)} className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold transition-all text-sm shadow-lg shadow-green-900/20">+ Add Guard</button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <table className="min-w-full text-left text-gray-400">
            <thead className="bg-gray-900 text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-700">
              <tr>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6 hidden sm:table-cell">Phone</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {displayedGuards.map((guard) => (
                <tr key={guard._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="py-4 px-6 text-blue-400 font-mono font-bold uppercase">{guard.employeeId}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{guard.name}</span>
                      <span className="sm:hidden text-xs text-gray-500">{guard.phoneNo}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 hidden sm:table-cell">{guard.phoneNo}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${guard.isActive ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
                      {guard.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {guard.isActive && (
                      <button onClick={() => { setSelectedGuard(guard); setRemoveModalOpen(true); }} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase transition-colors">
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {displayedGuards.length === 0 && <div className="text-center py-12 text-gray-500 italic text-sm">No guards found.</div>}
      </div>

      <AddGuardModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleSaveGuard} />

      {isRemoveModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 md:p-8 rounded-xl text-center max-w-sm w-full shadow-2xl border border-gray-700">
            <h2 className="text-lg text-white font-bold mb-3">Confirm Deactivation</h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              Deactivate guard <span className="text-white font-bold">{selectedGuard?.name}</span>? They will no longer be able to access the guard portal.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button onClick={() => setRemoveModalOpen(false)} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded font-semibold text-white transition text-sm order-2 sm:order-1">Cancel</button>
              <button onClick={handleRemoveGuard} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold text-white transition text-sm order-1 sm:order-2 shadow-lg shadow-red-900/20">Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGuards;