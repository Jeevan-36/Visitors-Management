import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddVisitorModal from "./AddVisitorModal";
import MarkExitModal from "./MarkExitModal";
import { useUser } from "../../context/UserContextProvider";
import { io } from "socket.io-client";
import LogoutModal from "../LogoutModal";
const socket = io("http://localhost:8000");
const GuardDashboard = () => {
  const [visitorNotifications, setVisitorNotifications] = useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isExitModalOpen, setExitModalOpen] = useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const { user } = useUser();
  const { name, employeeId } = user;
  useEffect(() => {
    socket.emit("join_room", employeeId);

    const handleResidentResponse = ({ updatedVisit }) => {
      const { status, flatNo, purpose } = updatedVisit;

      if (status === "Approved") {
        toast.success(
          `Visitor approved for Flat ${flatNo}\nPurpose: ${purpose}`,
          {
            autoClose: false, // ⏸️ wait for user
            closeButton: true, // ❎ show cross
          },
        );
      }

      if (status === "Denied") {
        toast.error(`Visitor denied for Flat ${flatNo}\nPurpose: ${purpose}`, {
          autoClose: false, // ⏸️ wait for user
          closeButton: true, // ❎ show cross
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
        {/* Sidebar */}
        <aside
          className={`bg-black w-64 p-6 flex flex-col justify-between h-screen fixed top-0 left-0 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div>
            <div className="text-2xl font-bold mb-8 text-white">APT APT</div>
            <nav className="space-y-3">
              <Link
                to=""
                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-800 text-white"
              >
                Dashboard
              </Link>

              <Link
                to="visits"
                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300"
                onClick={() => {
                  setVisitorNotifications(0);
                }}
              >
                <span>Visits</span>
                {visitorNotifications > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {visitorNotifications}
                  </span>
                )}
              </Link>

              <Link
                to="reports"
                className="flex items-center py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300"
              >
                Reports
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
              onClick={() => setLogoutModalOpen(true)}
              className="block mt-4 py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300 text-sm text-left w-full"
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
                Guard Dashboard
              </h2>
            </div>
            <div className="space-x-3">
              <button
                onClick={() => setAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
              >
                Add New Visitor
              </button>
              <button
                onClick={() => setExitModalOpen(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md"
              >
                Mark Visitor Exit
              </button>
            </div>
          </header>

          {/* Stats Section */}

          <Outlet />
        </main>
      </div>

      {/* Modals */}
      <AddVisitorModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
      <MarkExitModal
        isOpen={isExitModalOpen}
        onClose={() => setExitModalOpen(false)}
      />
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
      <ToastContainer
        position="top-right"
        theme="dark"
        closeOnClick={false}
        pauseOnHover={true}
      />
    </>
  );
};

export default GuardDashboard;
