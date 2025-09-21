import React, { useState } from 'react';
import axios from 'axios';
const MarkExitModal = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleMarkExit = async () => {
  if (!/^\d{10}$/.test(phoneNumber)) {
    setError('Phone number must be exactly 10 digits.');
    return;
  }
  setError('');

  

  try {
    const exitData = { phoneNo: phoneNumber };
    console.log('Marking exit for:', exitData);
     const response = await axios.post('http://localhost:8000/guard/mark-exit', exitData, {
      withCredentials: true
    });
    if (response.status < 400) {
      console.log('Successfully marked exit:', response.data);
      setPhoneNumber('');
      onClose();
    } else {
      setError(response.data.message || 'An unknown error occurred.');
    }

  } catch (error) {
  
    const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
    setError(errorMessage);
    console.error("Failed to mark exit:", error);
  }
};

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Mark Visitor Exit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white focus:outline-none">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div>
          <label htmlFor="phoneNumberExit" className="block text-gray-300 text-sm font-bold mb-2">
            Visitor Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumberExit"
            required
            minLength="10"
            maxLength="10"
            pattern="[0-9]{10}"
            title="Phone number must be exactly 10 digits."
            className="shadow appearance-none border-2 border-gray-700 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white focus:border-blue-500"
            placeholder="Enter 10-digit phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        {error && <p className="text-xs text-red-500 text-center mt-4">{error}</p>}

        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={()=>{
            setPhoneNumber('');
            setError('');
            onClose();
          }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline">
            Cancel
          </button>
          <button onClick={handleMarkExit} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline">
            Mark Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkExitModal;