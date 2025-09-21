import React from 'react';
import axios from 'axios';
const LogoutModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }
  const handleLogout=async ()=>{
    const response=await axios.get('http://localhost:8000/logout',{withCredentials:true});
    console.log(response);
  }

  return (
    // The backdrop now has a blur effect
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      
      {/* The modal card now has a semi-transparent background and a border */}
      <div className="bg-white/10 border border-gray-700 rounded-xl p-8 w-full max-w-md text-center">
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Confirm Logout
        </h2>
        <p className="text-gray-300 mb-8">
          Are you sure you want to log out of your account?
        </p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={onClose} 
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button 
            onClick={handleLogout} 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;