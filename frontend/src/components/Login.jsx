import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/UserContextProvider";

const Login = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

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

    try {
      const requestObj = {
        phoneNo: phone,
        password,
        role,
      };

      const response = await axios.post(
        `http://localhost:8000/${role}/login`,
        requestObj,
        { withCredentials: true }
      );

      if (response.status < 400) {
        setUser(response.data?.user);
        navigate(`../${role}`);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-70 p-4 font-sans">
      <div className="w-full max-w-sm p-8 space-y-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to continue.
          </p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 rounded text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Select Your Role
            </label>
            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 outline-none focus:border-blue-500"
            >
              <option value="">Select a role</option>
              <option value="manager">Manager</option>
              <option value="resident">Resident</option>
              <option value="guard">Guard</option>
            </select>
          </div>

          <div className="text-right text-xs">
            <a href="#" className="font-medium text-blue-400 hover:underline">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition"
          >
            Login
          </button>

          <div className="text-center text-xs text-gray-400">
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
