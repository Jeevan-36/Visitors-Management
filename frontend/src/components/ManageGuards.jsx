import React, { useState, useMemo, useEffect } from 'react';

// Modal for editing a guard
const GuardModal = ({ isOpen, onClose, onSave, guard }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(guard?.name || '');
      setPhone(guard?.phone || '');
      setEmployeeId(guard?.employeeId || '');
    }
  }, [guard, isOpen]);

  const handleSave = () => {
    onSave({ id: guard?.id, name, phone, employeeId });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-6">Edit Guard</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter full name"/>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="98xxxxxxxx"/>
          </div>
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-300 mb-1">Employee ID</label>
            <input type="text" id="employeeId" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., GUARD-007"/>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for confirming removal
const RemoveConfirmModal = ({ isOpen, onClose, onConfirm, guardName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md text-center">
        <h2 className="text-xl font-semibold text-white mb-4">Are you sure?</h2>
        <p className="text-gray-400 mb-8">Do you really want to remove the guard <span className="font-bold text-white">{guardName}</span>? This action cannot be undone.</p>
        <div className="flex justify-center space-x-4">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Confirm Remove</button>
        </div>
      </div>
    </div>
  );
};


const ManageGuards = () => {
  const [allGuards, setAllGuards] = useState([
    { id: 1, name: 'Anand Singh', phone: '9512345678', employeeId: 'GUARD-001' },
    { id: 2, name: 'Rajesh Kumar', phone: '9412345678', employeeId: 'GUARD-002' },
    { id: 3, name: 'Suresh Patil', phone: '9312345678', employeeId: 'GUARD-003' },
  ]);

  const [displayedGuards, setDisplayedGuards] = useState(allGuards);
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState(null);

  const handleSearch = () => {
    let filtered = allGuards
      .filter(guard => filterEmployeeId ? guard.employeeId === filterEmployeeId : true)
      .filter(guard => phoneFilter ? guard.phone.includes(phoneFilter) : true);
    setDisplayedGuards(filtered);
  };

  const handleReset = () => {
    setFilterEmployeeId('');
    setPhoneFilter('');
    setDisplayedGuards(allGuards);
  };
  
  const uniqueEmployeeIds = [...new Set(allGuards.map(g => g.employeeId))].sort();

  const handleOpenEditModal = (guard) => {
    setSelectedGuard(guard);
    setEditModalOpen(true);
  };

  const handleOpenRemoveModal = (guard) => {
    setSelectedGuard(guard);
    setRemoveModalOpen(true);
  };

  const handleSaveGuard = (guardData) => {
    const updatedList = allGuards.map(g => g.id === guardData.id ? { ...g, ...guardData } : g);
    setAllGuards(updatedList);
    setDisplayedGuards(updatedList);
    console.log("Editing guard:", guardData);
  };

  const handleRemoveGuard = () => {
    const updatedList = allGuards.filter(g => g.id !== selectedGuard.id);
    setAllGuards(updatedList);
    setDisplayedGuards(updatedList);
    setRemoveModalOpen(false);
    setSelectedGuard(null);
    console.log("Removing guard:", selectedGuard.id);
  };

  return (
    <>
      <div className="bg-gray-900 text-gray-200 min-h-screen font-sans p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Manage Guards</h1>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <select
              id="employeeIdFilter"
              value={filterEmployeeId}
              onChange={(e) => setFilterEmployeeId(e.target.value)}
              className="bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Filter by ID (All)</option>
              {uniqueEmployeeIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            
            <input
              type="tel"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              className="w-64 bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by Phone..."
            />
          </div>
          
          <div className="flex items-center space-x-3">
           
            <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md h-10">
              Search
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-400">
              <thead className="text-xs text-gray-500 uppercase bg-gray-900">
                <tr>
                  <th className="py-3 px-6">Employee ID</th>
                  <th className="py-3 px-6">Guard Name</th>
                  <th className="py-3 px-6">Phone Number</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedGuards.map((guard) => (
                  <tr key={guard.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-4 px-6 font-medium text-white">{guard.employeeId}</td>
                    <td className="py-4 px-6">{guard.name}</td>
                    <td className="py-4 px-6">{guard.phone}</td>
                    <td className="py-4 px-6 text-right space-x-4">
                      <button onClick={() => handleOpenEditModal(guard)} className="font-medium text-blue-500 hover:underline">Edit</button>
                      <button onClick={() => handleOpenRemoveModal(guard)} className="font-medium text-red-500 hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayedGuards.length === 0 && <p className="text-center py-4 text-gray-500">No guards found for this filter.</p>}
          </div>
        </div>
      </div>

      <GuardModal 
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveGuard}
        guard={selectedGuard}
      />
      
      <RemoveConfirmModal 
        isOpen={isRemoveModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        onConfirm={handleRemoveGuard}
        guardName={selectedGuard?.name}
      />
    </>
  );
};

export default ManageGuards;