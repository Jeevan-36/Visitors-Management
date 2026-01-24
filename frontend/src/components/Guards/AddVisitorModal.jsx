import React, { useState, useEffect } from "react";
import api from "../../api/axios.js";
import { useUser } from "../../context/UserContextProvider";
const AddVisitorModal = ({ isOpen, onClose }) => {
  const [visitorName, setVisitorName] = useState("");
  // We initialize this as empty and set it once flatList is loaded
  const [hostResidentFlat, setHostResidentFlat] = useState("");
  const [purpose, setPurpose] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [error, setError] = useState("");
  const { user } = useUser();
  const { employeeId } = user;
  // New state for the fetched list
  const [flatList, setFlatList] = useState([]);

  // Fetch flats on component mount
  useEffect(() => {
    const getFlatList = async () => {
      try {
        const response = await api.get("/flat-numbers", {
          withCredentials: true,
        });
        const flats = response.data?.flatNumbers || [];
        setFlatList(flats);

        // Automatically select the first flat as default if available
        if (flats.length > 0) {
          setHostResidentFlat(flats[0]);
        }
      } catch (err) {
        console.error("Failed to fetch flats:", err);
      }
    };

    if (isOpen) {
      getFlatList();
    }
  }, [isOpen]);

  const handleClose = () => {
    setVisitorName("");
    setHostResidentFlat(flatList[0] || "");
    setPurpose("");
    setPhoneNumber("");
    setEmail("");
    setOtp("");
    setShowOtpScreen(false);
    setError("");
    onClose();
  };

  const triggerEmailOtp = async () => {
    try {
      await api.post(
        "/guard/send-email-otp",
        { email },
        { withCredentials: true },
      );
      setShowOtpScreen(true);
    } catch {
      setError("Failed to send OTP to email.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }

    try {
      await api.post(
        "/guard/verify-email-otp",
        { email, otp },
        { withCredentials: true },
      );
      await submitMarkEntry();
    } catch {
      setError("Invalid OTP. Try again.");
    }
  };

  const submitMarkEntry = async () => {
    const visitorData = {
      name: visitorName,
      flatNo: hostResidentFlat,
      purpose,
      phoneNo: phoneNumber,
      email,
      employeeId,
    };

    try {
      const response = await api.post("/guard/mark-entry", visitorData, {
        withCredentials: true,
      });
      if (response.status < 400) handleClose();
    } catch (error) {
      setError(error.message || "Failed to mark entry.");
    }
  };

  const handleAddVisitor = async () => {
    if (
      !visitorName ||
      !hostResidentFlat ||
      !purpose ||
      !phoneNumber ||
      !email
    ) {
      setError("All fields are mandatory.");
      return;
    }

    if (showOtpScreen) {
      await handleVerifyOtp();
      return;
    }

    try {
      const response = await api.post(
        "/guard/check-visitor",
        { email },
        { withCredentials: true },
      );

      if (response.data?.exists) {
        await submitMarkEntry();
      } else {
        await triggerEmailOtp();
      }
    } catch {
      setError("Verification failed.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            {showOtpScreen ? "Verify OTP" : "Add New Visitor"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {!showOtpScreen ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Visitor Name
              </label>
              <input
                placeholder="Full Name"
                className="shadow border-2 border-gray-700 rounded w-full py-2 px-3 bg-gray-700 text-white"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Flat No
              </label>
              <select
                className="shadow border-2 border-gray-700 rounded w-full py-2 px-3 bg-gray-700 text-white max-h-40 overflow-y-auto"
                value={hostResidentFlat}
                onChange={(e) => setHostResidentFlat(e.target.value)}
              >
                {/* Dynamically render options from flatList */}
                {flatList.length > 0 ? (
                  flatList.map((flat) => (
                    <option key={flat} value={flat}>
                      {flat}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading flats...</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Purpose
              </label>
              <input
                placeholder="Delivery, Guest, etc."
                className="shadow border-2 border-gray-700 rounded w-full py-2 px-3 bg-gray-700 text-white"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Phone Number
              </label>
              <input
                placeholder="10 digit number"
                className="shadow border-2 border-gray-700 rounded w-full py-2 px-3 bg-gray-700 text-white"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                className="shadow border-2 border-gray-700 rounded w-full py-2 px-3 bg-gray-700 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4 text-center">
            <p className="text-gray-300 text-sm">
              Enter the 6-digit OTP sent to
              <br />
              <span className="text-blue-400 font-mono">{email}</span>
            </p>
            <input
              placeholder="000000"
              maxLength="6"
              className="w-full bg-gray-700 border-2 border-blue-500 rounded-lg p-3 text-center text-2xl tracking-[0.5em] text-white"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        )}

        {error && (
          <p className="text-xs text-white text-center mt-4 bg-red-500 bg-opacity-10 p-2 rounded">
            {error}
          </p>
        )}

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={handleClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleAddVisitor}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            {showOtpScreen ? "Verify & Add" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVisitorModal;
