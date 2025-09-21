import React, { useState } from 'react';
import axios from 'axios';
const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    email: '',
    role: '',
    flatNo:'',
    employeeId:''
  });
  const [error, setError] = useState('');
 const flats = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (event) => {
  event.preventDefault();
  setError('');

  if (!/^\d{10}$/.test(formData.phone)) {
    setError('Phone number must be exactly 10 digits.');
    return;
  }
  if (formData.password.length < 8) {
    setError('Password must be at least 8 characters long.');
    return;
  }

  const requestObj = {
    name: formData.fullName,
    phoneNo: formData.phone,
    email: formData.email,
    password: formData.password,
    role: formData.role,
    flatNo: formData.flatNo,
    employeeId: formData.employeeId,
  };

  try {
    const response = await axios.post(
      `http://localhost:8000/manager/register`, 
      requestObj,
      { withCredentials: true }
    );

    console.log(response.data);
    alert("Registered successfully!");
  } catch (err) {
    console.error(err);

    if (err.response?.data?.message) {
      setError(err.response.data.message);
    } else {
      setError("Something went wrong. Please try again.");
    }
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Your Account
          </h1>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSignUp}>
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Create a password"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Select Your Role
            </label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" className='font-semibold'>Select a role</option>
             <option value="manager">Manager</option>
              <option value="resident">Resident</option>
              <option value="guard">Guard</option>
             
            </select>
          </div>
          {
            formData.role==='guard' && 
            <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
             Employee Id:
            </label>
            <input
              id="employeeId"
              name="employeeId"
              type="employeeId"
              required
              value={formData.employeeId}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your EmployeeId "
            />
          </div>
          }
         {
            formData.role==='resident' && 
            <div>
            <label htmlFor="flatNo" className="block text-sm font-medium text-gray-700">
             FlatNo:
            </label>
           <select
              id="flatNo"
              name="flatNo"
              required
              value={formData.flatNo}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" className='font-semibold'>Select Flat No</option>
            {
              flats.map((flatNo)=>{
                return <option value={flatNo} key={flatNo}>{flatNo}</option>
              })
            }
             
            </select>
          </div>
          }
          {error && <p className="text-xs text-red-600 text-center">{error}</p>}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Up
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-blue-600 hover:underline">
            Login
          </a>
        </p>

      </div>
    </div>
  );
};

export default Register;