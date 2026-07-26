import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import LogoutModal from "../LogoutModal";
import { ToastContainer, toast } from "react-toastify";
import { io } from "socket.io-client";
import api from '../../api/axios.js';
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../../context/UserContextProvider";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const socket = io(SOCKET_URL, {
  autoConnect: false,
});

const ResidentDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [approvalNotifications, setApprovalNotifications] = useState(0);

  const { user } = useUser();
  const { flatNo, name } = user;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_room", flatNo);

    const fetchApprovals = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.post(
          `/resident/pending-approvals`,
          { flatNo },
          { withCredentials: true },
        );
        setApprovals(response.data?.pendingVisits || []);
      } catch (err) {
        setError("Error fetching Pending Approvals.");
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();

    const handleNewVisitor = (newVisitData) => {
      toast.info(`New approval request from: ${newVisitData.visitor.name}`, {
        autoClose: false,
        closeButton: true,
        pauseOnHover: true,
      });

      setApprovals((currentApprovals) => [newVisitData, ...currentApprovals]);
      setApprovalNotifications((count) => count + 1);
    };

    socket.on("new-visitor", handleNewVisitor);

    return () => {
      socket.off("new-visitor", handleNewVisitor);
    };
  }, [flatNo]);

  const handleApprove = async (visitId) => {
    try {
      const response = await api.put(
        "/resident/approve-visit",
        { _id: visitId },
        { withCredentials: true },
      );

      if (response.status === 200) {
        setApprovals((prev) => prev.filter((visit) => visit._id !== visitId));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve visitor.");
    }
  };

  const handleDeny = async (visitId) => {
    try {
      const response = await api.put(
        "/resident/deny-visit",
        { _id: visitId },
        { withCredentials: true },
      );

      if (response.status === 200) {
        setApprovals((prev) => prev.filter((visit) => visit._id !== visitId));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deny visitor.");
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans flex">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`bg-black w-64 p-6 flex flex-col justify-between h-screen fixed top-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="text-2xl font-bold mb-8 text-white">APT APT</div>
          <nav className="space-y-3">
            {[
              { to: "/resident", label: "Dashboard" },
              { to: "/resident/approvals", label: "Approvals", notify: true },
              { to: "/resident/history", label: "History" },
              { to: "/resident/settings", label: "Settings" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (link.notify) setApprovalNotifications(0);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300 transition-colors"
              >
                <span>{link.label}</span>
                {link.notify && approvalNotifications > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {approvalNotifications}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-gray-800 pt-6">
          <div className="font-bold text-white mb-4 truncate">{name}</div>
          <button
            onClick={() => setLogoutModalOpen(true)}
            className="block py-2 px-3 rounded-md hover:bg-red-900/20 hover:text-red-400 text-gray-400 text-sm text-left w-full transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}>
        <header className="flex justify-between items-center p-4 md:p-8 bg-gray-900/50 backdrop-blur-md sticky top-0 z-30 border-b border-gray-800">
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
              Resident Dashboard
            </h2>
          </div>
        </header>

        <main className="p-4 md:p-8 pt-6">
          <Outlet context={{ approvals, loading, error, handleApprove, handleDeny }} />
        </main>
      </div>

      <ToastContainer
        theme="dark"
        position="bottom-right"
        closeOnClick={false}
        pauseOnHover={true}
      />
      
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
};

export default ResidentDashboard;