import React, { useState } from "react";

const ManagerSettings = () => {
  // State for profile information
  const [name, setName] = useState("Current Manager Name"); // Pre-fill with user's data
  const [phone, setPhone] = useState("9999999999"); // Pre-fill with user's data
  
  // State for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // API call logic to update name and phone
    console.log("Updating profile with:", { name, phone });
    alert("Profile updated successfully!"); // Placeholder for success message
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    // API call logic to change password
    console.log("Changing password...");
    alert("Password changed successfully!"); // Placeholder for success message
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Update Profile Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Update Profile
          </h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                aclassName="block text-sm font-medium text-gray-300 mb-1"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                aclassName="block text-sm font-medium text-gray-300 mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.g.target.value)}
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                aclassName="block text-sm font-medium text-gray-300 mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagerSettings;
