import React, { useState } from "react";
import api from '../api/axios.js';
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!name && !phone && !email) {
      setError("Please update at least one profile field.");
      return;
    }

    const updatedDetails = {
      ...(name && { name }),
      ...(phone && { phoneNo: phone }),
      ...(email && { email }),
    };

    setIsLoading(true);
    try {
      const response = await api.put(
        "/update-profile",
        updatedDetails,
        { withCredentials: true },
      );

      if (response.status < 400) {
        setSuccessMessage("Profile updated successfully! Logging out...");
        setTimeout(async () => {
          await api.get("/logout", { withCredentials: true });
          navigate("/login", { replace: true });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put(
        "/change-password",
        { currentPassword, newPassword },
        { withCredentials: true },
      );

      if (response.status < 400) {
        setSuccessMessage("Password updated successfully! Logging out...");
        setTimeout(async () => {
          await api.get("/logout", { withCredentials: true });
          navigate("/login", { replace: true });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center md:text-left">Settings</h1>
        
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 p-3 rounded-md mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-900/20 border border-green-800 text-green-400 p-3 rounded-md mb-6 text-sm text-center">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-gray-800 rounded-lg p-5 md:p-6 shadow-lg border border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Update Profile</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                disabled={isLoading}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                disabled={isLoading}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed py-2 rounded-md font-semibold transition-colors flex justify-center items-center"
              >
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="bg-gray-800 rounded-lg p-5 md:p-6 shadow-lg border border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed py-2 rounded-md font-semibold transition-colors flex justify-center items-center"
              >
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;