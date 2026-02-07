import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import LogoutModal from "../LogoutModal";
import { useUser } from "../../context/UserContextProvider";

const ManagerDashboard = () => {

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const { user } = useUser();
  const { name } = user;

  const navLinks = [
    { to: "", label: "Dashboard" },
    { to: "reports", label: "Reports" },
    { to: "guards", label: "Guards" },
    { to: "residents", label: "Residents" },
    { to: "settings", label: "Settings" },
  ];

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans flex">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      
      <aside
        className={`bg-black w-64 p-6 flex flex-col justify-between h-screen fixed top-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="text-2xl font-bold mb-8 text-white tracking-tight">APT APT</div>
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => {
                  // On mobile, close sidebar after clicking a link
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className="flex items-center py-2.5 px-3 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="border-t border-gray-800 pt-6">
          <div className="px-3 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Manager</p>
            <p className="font-bold text-white truncate">{name}</p>
          </div>
          <button
            onClick={() => {
              setSidebarOpen(false);
              setLogoutModalOpen(true);
            }}
            className="flex items-center w-full py-2.5 px-3 rounded-md hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

     
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}>
        <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Toggle Button - Now visible on all screens (Removed lg:hidden) */}
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="text-gray-400 hover:text-white mr-4 p-1 rounded-md hover:bg-gray-800 transition-colors"
                aria-label="Toggle Sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-xl md:text-2xl font-bold text-white truncate">
                Manager Dashboard
              </h2>
            </div>
            
            <div className="hidden sm:block text-xs text-gray-500 font-mono">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 pt-6">
          <Outlet />
        </main>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
};

export default ManagerDashboard;