import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
 import axios from 'axios';
 import { useUser } from '../context/UserContextProvider';
const LoginPage = () => {
  const {setUser}=useUser();
  const navigate=useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); 
  const [error, setError] = useState('');
  const handleLogin = async (event) => {
  event.preventDefault();
  setError('');


  if (!/^\d{10}$/.test(phone)) {
    setError('Phone number must be exactly 10 digits.');
    return;
  }
  if (password.length < 8) {
    setError('Password must be at least 8 characters long.');
    return;
  }

  try {
    console.log('Logging in with:', { phone, password, role });
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
      console.log('Logged in successfully');
      console.log(response.data.user);
      setUser(response.data?.user);
      navigate(`../${role}`);
    }
  } catch (err) {
    console.error(err);

    // If server sent a message, show it
    if (err.response && err.response.data && err.response.data.message) {
      setError(err.response.data.message);
    } else {
      setError('Something went wrong. Please try again.');
    }
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome Back!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue.
          </p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleLogin}>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                minLength="10"
                maxLength="10"
                pattern="[0-9]{10}"
                title="Phone number must be exactly 10 digits."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength="8"
                title="Password must be at least 8 characters."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Select Your Role
            </label>
            <div className="mt-1">
              <select
                id="role"
                name="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" className='font-semibold'>Select a role</option>
                 <option value="manager">Manager</option>
                <option value="resident">Resident</option>
                <option value="guard">Guard</option>
               
              </select>
            </div>
          </div>
          
          {error && <p className="text-xs text-red-600 text-center">{error}</p>}

          <div className="text-right text-xs">
            <a href="#" className="font-medium text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="font-medium text-blue-600 hover:underline">
            Register
          </a>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;