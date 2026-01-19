import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LogoutModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLogout = async () => {
    setError("");
    try {
      await axios.get("http://localhost:8000/logout", {
        withCredentials: true,
      });

      onClose(); // ✅ close modal first

      setTimeout(() => {
        navigate("/login"); // ✅ navigate after state update
      }, 0);
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message || "Failed to logout. Try again."
      );
      if(err.response?.status===401){
         navigate("/login");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white/10 border border-gray-700 rounded-xl p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Confirm Logout
        </h2>

        <p className="text-gray-300 mb-6">
          Are you sure you want to log out of your account?
        </p>

        {error && (
          <p className="text-red-400 text-sm mb-4">
            {error}
          </p>
        )}

        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
