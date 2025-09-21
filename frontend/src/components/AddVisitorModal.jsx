import React, { useState } from 'react';
import axios from 'axios'
import { io } from "socket.io-client";
import { useEffect } from 'react';
const AddVisitorModal = ({ isOpen, onClose, flats = [] }) => {
  const [visitorName, setVisitorName] = useState('');
  const [hostResidentFlat, setHostResidentFlat] = useState(flats[0] || '');
  const [purpose, setPurpose] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');


  useEffect(()=>{
    const socket = io("http://localhost:8000");
    console.log("in react app");
  },[])
  const handleAddVisitor = async () => {
  if (!visitorName || !hostResidentFlat || !purpose || !phoneNumber) {
    setError('All fields are mandatory.');
    return;
  }
  if (!/^\d{10}$/.test(phoneNumber)) {
    setError('Phone number must be exactly 10 digits.');
    return;
  }
  setError('');

  const visitorData = { 
    name: visitorName, 
    flatNo: hostResidentFlat, 
    purpose: purpose, 
    phoneNo: phoneNumber 
  };
  console.log('Adding visitor:', visitorData);

  try {
    const response = await axios.post('http://localhost:8000/guard/mark-entry', visitorData, {
      withCredentials: true 
    });

    if (response.status <400) {
      console.log('Successfully added visitor:', response.data);
      setVisitorName('');
      setHostResidentFlat(flats[0] || '');
      setPurpose('');
      setPhoneNumber('');
      onClose();
    } else {
      setError(response.data.message || 'An unknown error occurred.');
    }

  } catch (error) {
    const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
    setError(errorMessage);
    console.error("Failed to add visitor:", error);
  }
};

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Add New Visitor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white focus:outline-none">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="visitorName" className="block text-gray-300 text-sm font-bold mb-2">
              Visitor Name
            </label>
            <input
              type="text"
              id="visitorName"
              required
              className="shadow appearance-none border-2 border-gray-700 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white focus:border-blue-500"
              placeholder="Enter visitor's full name"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="hostResidentFlat" className="block text-gray-300 text-sm font-bold mb-2">
              Host Resident (Flat No)
            </label>
            <select
              id="hostResidentFlat"
              required
              className="shadow appearance-none border-2 border-gray-700 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white focus:border-blue-500"
              value={hostResidentFlat}
              onChange={(e) => setHostResidentFlat(e.target.value)}
            >
              {flats.map((flat) => (
                <option key={flat} value={flat}>
                  {flat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="purpose" className="block text-gray-300 text-sm font-bold mb-2">
              Purpose of Visit
            </label>
            <input
              type="text"
              id="purpose"
              required
              className="shadow appearance-none border-2 border-gray-700 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white focus:border-blue-500"
              placeholder="e.g., Delivery, Maintenance, Guest"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-gray-300 text-sm font-bold mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              required
              className="shadow appearance-none border-2 border-gray-700 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white focus:border-blue-500"
              placeholder="98xxxxxxxx"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 text-center mt-4">{error}</p>}

        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={()=>{
            setError('');
            setHostResidentFlat('');
            setPhoneNumber('');
            setVisitorName('');
            setPurpose('');
            onClose();
          }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline">
            Cancel
          </button>
          <button onClick={handleAddVisitor} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline">
            Add Visitor
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVisitorModal;