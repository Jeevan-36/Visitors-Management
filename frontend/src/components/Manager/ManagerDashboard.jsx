import React, { useState } from "react";
import { Link } from "react-router-dom";
import LogoutModal from "../LogoutModal";
import { useUser } from "../../context/UserContextProvider";
import { Outlet } from "react-router-dom";
const ManagerDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const { user } = useUser();
   const {  name } = user;
    console.log("Manager",name);

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans flex">
      {/* Sidebar */}
      <aside
        className={`bg-black w-64 p-6 flex flex-col justify-between h-screen fixed top-0 left-0 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="text-2xl font-bold mb-8 text-white">APT APT</div>
          <nav className="space-y-3">
            {/* ✅ Replace <a> with <Link> */}
            <Link
              to=""
              className="flex items-center py-2 px-3 rounded-md hover:bg-gray-800 text-white"
            >
              Dashboard
            </Link>
            <Link
              to="reports"
              className="flex items-center py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300"
            >
              Reports
            </Link>

            <Link
              to="guards"
              className="flex items-center py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300"
            >
              Guards
            </Link>
            <Link
              to="residents"
              className="flex items-center py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300"
            >
              Residents
            </Link>
            <Link
              to="settings"
              className="flex items-center py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300"
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="border-t border-gray-700 pt-6">
          <div className="flex items-center space-x-3 text-gray-200">
           
            <div className="font-bold">{name}</div>
          </div>
          <button
            onClick={()=>{
              setLogoutModalOpen(true);
            }
            }
            className="block mt-4 py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300 text-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="text-gray-400 hover:text-white mr-4"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
            <h2 className="text-2xl font-semibold text-white">
              Manager Dashboard
            </h2>
          </div>
        </header>

        {/* Stats Section */}
        <Outlet />
      </main>
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
       
      />
    </div>
  );
};

export default ManagerDashboard;
