import React, { useState } from 'react';
import api from '../../api/axios.js';

const MarkExitModal = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleMarkExit = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const exitData = { phoneNo: phoneNumber };
      const response = await api.post('/guard/mark-exit', exitData, {
        withCredentials: true
      });
      if (response.status < 400) {
        setPhoneNumber('');
        onClose();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 md:p-8 w-full max-w-sm shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Mark Visitor Exit</h2>
          <button onClick={handleClose} disabled={isLoading} className="text-gray-400 hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          <label htmlFor="phoneNumberExit" className="block text-gray-400 text-xs font-bold uppercase tracking-wider">
            Visitor Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumberExit"
            disabled={isLoading}
            className="w-full bg-gray-700 text-white rounded-md border-2 border-gray-600 px-3 py-2 outline-none focus:border-blue-500 transition-all text-sm"
            placeholder="Enter 10-digit phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-[11px] p-2 rounded mt-4 text-center">
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-end space-x-3">
          <button 
            onClick={handleClose} 
            disabled={isLoading}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleMarkExit} 
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all shadow-lg shadow-red-900/20 disabled:bg-red-800 flex items-center justify-center min-w-[100px]"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Mark Exit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkExitModal;