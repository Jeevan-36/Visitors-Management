import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Settings = () => {
  // Profile
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");

    if (!name && !phone && !email) {
      setError("Please update at least one profile field.");
      return;
    }

    const updatedDetails = {
      ...(name && { name }),
      ...(phone && { phoneNo: phone }),
      ...(email && { email }),
    };

    try {
      const response = await axios.put(
        "http://localhost:8000/update-profile",
        updatedDetails,
        { withCredentials: true },
      );

      if (response.status < 400) {
        alert("Profile updated successfully!");

        await axios.get("http://localhost:8000/logout", {
          withCredentials: true,
        });

        setName("");
        setPhone("");
        setEmail("");

        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");

    const filled = currentPassword || newPassword || confirmPassword;

    if (!filled) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const updatedDetails = {
      currentPassword,
      newPassword,
    };

    try {
      const response = await axios.put(
        "http://localhost:8000/change-password",
        updatedDetails,
        { withCredentials: true },
      );

      if (response.status < 400) {
        alert("Password updated successfully!");

        await axios.get("http://localhost:8000/logout", {
          withCredentials: true,
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to update password. Please try again.",
      );
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      {error && (
        <p className="text-red-400 text-center text-sm mb-4">{error}</p>
      )}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT - PROFILE */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Update Profile
          </h2>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2"
            />

            <input
              type="email"
              placeholder="Email Address"
              minLength="8"
              title="Password must be at least 8 characters."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-semibold"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* RIGHT - PASSWORD */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Change Password
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2"
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-semibold"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
