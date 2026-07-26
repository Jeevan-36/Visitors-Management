import React, { useState, useEffect } from "react";
import api from "../../api/axios.js";
import { useUser } from "../../context/UserContextProvider";

const AddVisitorModal = ({ isOpen, onClose }) => {
  const [visitorName, setVisitorName] = useState("");
  const [hostResidentFlat, setHostResidentFlat] = useState("");
  const [purpose, setPurpose] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [flatList, setFlatList] = useState([]);

  const { user } = useUser();
  const { employeeId } = user;

  useEffect(() => {
    const getFlatList = async () => {
      try {
        const response = await api.get("/flat-numbers", {
          withCredentials: true,
        });
        const flats = response.data?.flatNumbers || [];
        setFlatList(flats);
        if (flats.length > 0) setHostResidentFlat(flats[0]);
      } catch (err) {
        // Error handled silently
      }
    };

    if (isOpen) getFlatList();
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
    setIsLoading(true);
    try {
      await api.post(
        "/guard/send-email-otp",
        { email },
        { withCredentials: true },
      );
      setShowOtpScreen(true);
      setError("");
    } catch {
      setError("Failed to send OTP to email.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitMarkEntry = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post(
        "/guard/verify-email-otp",
        { email, otp },
        { withCredentials: true },
      );
      await submitMarkEntry();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Try again.");
      setIsLoading(false);
    }
  };

  const handleAddVisitor = async () => {
    if (!visitorName || !hostResidentFlat || !purpose || !phoneNumber || !email) {
      setError("All fields are mandatory.");
      return;
    }

    if (showOtpScreen) {
      await handleVerifyOtp();
      return;
    }

    setIsLoading(true);
    setError("");
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
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            {showOtpScreen ? "Verify OTP" : "Add New Visitor"}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {!showOtpScreen ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Visitor Name</label>
                <input
                  disabled={isLoading}
                  placeholder="Full Name"
                  className="w-full bg-gray-700 border-2 border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-all"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Flat No</label>
                <select
                  disabled={isLoading}
                  className="w-full bg-gray-700 border-2 border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-all"
                  value={hostResidentFlat}
                  onChange={(e) => setHostResidentFlat(e.target.value)}
                >
                  {flatList.map((flat) => (
                    <option key={flat} value={flat}>{flat}</option>
                  ))}
                  {flatList.length === 0 && <option disabled>Loading...</option>}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Purpose</label>
              <input
                disabled={isLoading}
                placeholder="Delivery, Guest, etc."
                className="w-full bg-gray-700 border-2 border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Phone Number</label>
              <input
                disabled={isLoading}
                placeholder="10 digit number"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Email</label>
              <input
                type="email"
                disabled={isLoading}
                placeholder="example@email.com"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
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
              <span className="text-blue-400 font-mono text-xs">{email}</span>
            </p>
            <input
              disabled={isLoading}
              placeholder="000000"
              maxLength="6"
              className="w-full bg-gray-700 border-2 border-blue-500 rounded-lg p-3 text-center text-2xl tracking-[0.5em] text-white outline-none"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500 text-red-500 text-[11px] p-2 rounded text-center">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="order-2 sm:order-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddVisitor}
            disabled={isLoading}
            className="order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all shadow-lg shadow-blue-900/20 disabled:bg-blue-800 flex justify-center items-center min-w-[120px]"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              showOtpScreen ? "Verify & Add" : "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVisitorModal;