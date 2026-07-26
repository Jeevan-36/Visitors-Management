import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddVisitorModal from "./AddVisitorModal";
import MarkExitModal from "./MarkExitModal";
import { useUser } from "../../context/UserContextProvider";
import { io } from "socket.io-client";
import LogoutModal from "../LogoutModal";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const socket = io(SOCKET_URL, {
  autoConnect: false,
});

const GuardDashboard = () => {
  const [visitorNotifications, setVisitorNotifications] = useState(0);
  
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isExitModalOpen, setExitModalOpen] = useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const { user } = useUser();
  const { name, employeeId } = user;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_room", employeeId);

    const handleResidentResponse = ({ updatedVisit }) => {
      const { status, flatNo, purpose } = updatedVisit;

      if (status === "Approved") {
        toast.success(
          `Visitor approved for Flat ${flatNo}\nPurpose: ${purpose}`,
          { autoClose: false, closeButton: true }
        );
      }

      if (status === "Denied") {
        toast.error(`Visitor denied for Flat ${flatNo}\nPurpose: ${purpose}`, {
          autoClose: false,
          closeButton: true,
        });
      }
      setVisitorNotifications((cnt) => cnt + 1);
    };

    socket.on("resident-response", handleResidentResponse);

    return () => {
      socket.off("resident-response", handleResidentResponse);
    };
  }, [employeeId]);

  return (
    <>
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
            <div className="text-2xl font-bold mb-8 text-white">APT APT</div>
            <nav className="space-y-2">
              {[
                { to: "", label: "Dashboard" },
                { to: "visits", label: "Visits", notify: true },
                { to: "reports", label: "Reports" },
                { to: "settings", label: "Settings" },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => {
                    if (link.notify) setVisitorNotifications(0);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  <span>{link.label}</span>
                  {link.notify && visitorNotifications > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {visitorNotifications}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <div className="px-3 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Guard</p>
              <p className="font-bold text-white truncate">{name}</p>
            </div>
            <button
              onClick={() => setLogoutModalOpen(true)}
              className="flex items-center w-full py-2.5 px-3 rounded-md hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}>
          <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-4 md:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!isSidebarOpen)}
                  className="text-gray-400 hover:text-white mr-4 p-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h2 className="text-xl md:text-2xl font-bold text-white truncate">
                  Guard Dashboard
                </h2>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold py-2 px-3 md:px-4 rounded-md shadow-lg shadow-blue-900/20 transition-all"
                >
                  Add Visitor
                </button>
                <button
                  onClick={() => setExitModalOpen(true)}
                  className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 text-white text-xs md:text-sm font-semibold py-2 px-3 md:px-4 rounded-md transition-all"
                >
                  Mark Exit
                </button>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <AddVisitorModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} />
      <MarkExitModal isOpen={isExitModalOpen} onClose={() => setExitModalOpen(false)} />
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setLogoutModalOpen(false)} />

      <ToastContainer position="bottom-right" theme="dark" closeOnClick={false} pauseOnHover={true} />
    </>
  );
};

export default GuardDashboard;