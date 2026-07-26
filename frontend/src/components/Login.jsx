import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useUser } from "../context/UserContextProvider";

const Login = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!/^\d{10}$/.test(phone)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!role) {
      setError("Please select a role to Login");
      return;
    }

    setIsLoading(true);
    try {
      const requestObj = {
        phoneNo: phone,
        password,
        role,
      };

      const response = await api.post(`/${role}/login`, requestObj, {
        withCredentials: true,
      });

      if (response.status < 400) {
        setUser(response.data?.user);
        localStorage.setItem("accessToken", response.data?.accessToken);
        navigate(`../${role}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    if (!role) {
      setError("Please select a role to continue as guest.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(
        "/login-guest",
        { role },
        { withCredentials: true },
      );

      if (response.status < 400) {
        setUser(response.data?.user);
        localStorage.setItem("accessToken", response.data?.accessToken);
        navigate(`../${role}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login as guest.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/80 p-4 font-sans">
      <div className="w-full max-w-sm p-6 md:p-8 space-y-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-white">Welcome Back!</h1>
          <p className="mt-2 text-xs md:text-sm text-gray-400">Sign in to continue.</p>
        </div>

        <form className="mt-6 space-y-5 md:space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-3 py-2 rounded text-xs md:text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs md:text-sm font-medium text-gray-300">
              Phone Number
            </label>
            <input
              type="tel"
              disabled={isLoading}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500 text-sm transition-all disabled:opacity-50"
              placeholder="Enter 10 digit number"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs md:text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500 text-sm transition-all disabled:opacity-50"
              placeholder="Enter your password"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs md:text-sm font-medium text-gray-300">
              Select Your Role
            </label>
            <select
              disabled={isLoading}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500 text-sm transition-all disabled:opacity-50"
            >
              <option value="">Select a role</option>
              <option value="manager">Manager</option>
              <option value="resident">Resident</option>
              <option value="guard">Guard</option>
            </select>
          </div>

          <div className="text-right">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGuestLogin}
              className="text-[11px] md:text-xs font-medium text-blue-400 hover:text-blue-300 underline underline-offset-4 disabled:opacity-50"
            >
              Explore as Guest
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all flex justify-center items-center disabled:bg-blue-800 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Login"
            )}
          </button>

          <div className="text-center text-[11px] md:text-xs text-gray-400">
            Not registered?{" "}
            <span className="font-medium text-blue-400">
              Contact your manager
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;