import React, { useState, useMemo, useEffect } from 'react';

// You can move these modals to their own files if you prefer
const ResidentModal = ({ isOpen, onClose, onSave, resident }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [flatNo, setFlatNo] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setName(resident?.name || '');
      setPhone(resident?.phone || '');
      setFlatNo(resident?.flatNo || '');
    }
  }, [resident, isOpen]);

  const handleSave = () => {
    onSave({ id: resident?.id, name, phone, flatNo });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-6">{resident ? 'Edit Resident' : 'Add New Resident'}</h2>
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
            <label htmlFor="flatNo" className="block text-sm font-medium text-gray-300 mb-1">Flat Number</label>
            <input type="text" id="flatNo" value={flatNo} onChange={(e) => setFlatNo(e.target.value)} className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., A-101"/>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
            {resident ? 'Save Changes' : 'Add Resident'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RemoveConfirmModal = ({ isOpen, onClose, onConfirm, residentName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md text-center">
        <h2 className="text-xl font-semibold text-white mb-4">Are you sure?</h2>
        <p className="text-gray-400 mb-8">Do you really want to remove the resident <span className="font-bold text-white">{residentName}</span>? This action cannot be undone.</p>
        <div className="flex justify-center space-x-4">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">Confirm Remove</button>
        </div>
      </div>
    </div>
  );
};


const ManageResidents = () => {
  const [allResidents, setAllResidents] = useState([
    { id: 1, name: 'Priya Sharma', phone: '9812345678', flatNo: 'A-101' },
    { id: 2, name: 'Vikram Singh', phone: '9712345678', flatNo: 'A-102' },
    { id: 3, name: 'Anjali Mehta', phone: '9612345678', flatNo: 'B-205' },
    { id: 4, name: 'Amit Patel', phone: '9512345678', flatNo: 'A-101' },
  ]);

  const [displayedResidents, setDisplayedResidents] = useState(allResidents);
  const [filterFlat, setFilterFlat] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
  const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);

  const handleSearch = () => {
    let filtered = allResidents
      .filter(resident => filterFlat ? resident.flatNo === filterFlat : true)
      .filter(resident => phoneFilter ? resident.phone.includes(phoneFilter) : true);
    setDisplayedResidents(filtered);
  };

  const handleReset = () => {
    setFilterFlat('');
    setPhoneFilter('');
    setDisplayedResidents(allResidents);
  };

  const uniqueFlats = useMemo(() => {
    return [...new Set(allResidents.map(r => r.flatNo))].sort();
  }, [allResidents]);

  // Other handlers (handleOpenAddModal, etc.) remain the same
  const handleOpenAddModal = () => {
    setSelectedResident(null);
    setAddEditModalOpen(true);
  };
  const handleOpenEditModal = (resident) => {
    setSelectedResident(resident);
    setAddEditModalOpen(true);
  };
  const handleOpenRemoveModal = (resident) => {
    setSelectedResident(resident);
    setRemoveModalOpen(true);
  };
  const handleSaveResident = (residentData) => {
    if (residentData.id) {
      const updatedList = allResidents.map(r => r.id === residentData.id ? residentData : r);
      setAllResidents(updatedList);
      setDisplayedResidents(updatedList);
    } else {
      const updatedList = [...allResidents, { ...residentData, id: Date.now() }];
      setAllResidents(updatedList);
      setDisplayedResidents(updatedList);
    }
  };
  const handleRemoveResident = () => {
    const updatedList = allResidents.filter(r => r.id !== selectedResident.id);
    setAllResidents(updatedList);
    setDisplayedResidents(updatedList);
    setRemoveModalOpen(false);
    setSelectedResident(null);
  };


  return (
    <>
      <div className="bg-gray-900 text-gray-200 min-h-screen font-sans p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Manage Residents</h1>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <select
              id="flatFilter"
              value={filterFlat}
              onChange={(e) => setFilterFlat(e.target.value)}
              className="bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Filter by Flat (All)</option>
              {uniqueFlats.map(flat => (
                <option key={flat} value={flat}>{flat}</option>
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
                  <th className="py-3 px-6">Flat No</th>
                  <th className="py-3 px-6">Resident Name</th>
                  <th className="py-3 px-6">Phone Number</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedResidents.map((resident) => (
                  <tr key={resident.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-4 px-6 font-medium text-white">{resident.flatNo}</td>
                    <td className="py-4 px-6">{resident.name}</td>
                    <td className="py-4 px-6">{resident.phone}</td>
                    <td className="py-4 px-6 text-right space-x-4">
                      <button onClick={() => handleOpenEditModal(resident)} className="font-medium text-blue-500 hover:underline">Edit</button>
                      <button onClick={() => handleOpenRemoveModal(resident)} className="font-medium text-red-500 hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayedResidents.length === 0 && <p className="text-center py-4 text-gray-500">No residents found for this filter.</p>}
          </div>
        </div>
      </div>

      <ResidentModal 
        isOpen={isAddEditModalOpen}
        onClose={() => setAddEditModalOpen(false)}
        onSave={handleSaveResident}
        resident={selectedResident}
      />
      <RemoveConfirmModal 
        isOpen={isRemoveModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        onConfirm={handleRemoveResident}
        residentName={selectedResident?.name}
      />
    </>
  );
};

export default ManageResidents;