import React, { useState } from "react";
import api from '../api/axios.js';
import { useNavigate } from "react-router-dom";

const LogoutModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    setError("");
    setIsLoading(true);
    try {
      await api.get("/logout", {
        withCredentials: true,
      });
      localStorage.removeItem("accessToken");
      onClose();
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to logout. Try again."
      );
      if (err.response?.status === 401) {
        onClose();
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 md:p-8 w-full max-w-sm text-center shadow-2xl">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
          Confirm Logout
        </h2>

        <p className="text-gray-400 mb-6 text-sm md:text-base">
          Are you sure you want to log out of your account?
        </p>

        {error && (
          <p className="bg-red-900/20 border border-red-800 text-red-400 text-xs p-2 rounded mb-4">
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="order-2 sm:order-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm md:text-base"
          >
            Cancel
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="order-1 sm:order-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex justify-center items-center min-w-[100px] text-sm md:text-base"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Logout"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;