import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import LogoutModal from "./LogoutModal";
import { ToastContainer, toast } from "react-toastify";
import { io } from "socket.io-client";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../context/UserContextProvider";
const socket = io("http://localhost:8000");
const ResidentDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

  const { user } = useUser();
  const { flatNo, name } = user;

  useEffect(() => {
    socket.emit("join_room", flatNo);

    const fetchApprovals = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.post(
          `http://localhost:8000/resident/pending-approvals`,
          { flatNo },
          { withCredentials: true },
        );
        setApprovals(response.data?.pendingVisits || []);
      } catch (error) {
        setError("Error fetching Pending Approvals.");
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();

    const handleNewVisitor = (newVisitData) => {
      toast.info(`New approval request from: ${newVisitData.visitor.name}`);
      setApprovals((currentApprovals) => [newVisitData, ...currentApprovals]);
    };

    socket.on("new-visitor", handleNewVisitor);

    return () => {
      socket.off("new-visitor", handleNewVisitor);
    };
  }, []);

  const handleApprove = async (visitId) => {
    try {
      const response = await axios.put(
        "http://localhost:8000/resident/approve-visit",
        { _id: visitId },
        { withCredentials: true },
      );

      if (response.status === 200) {
        const newApprovals = approvals.filter((visit) => visit._id !== visitId);
        setApprovals(newApprovals);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve visitor.");
      console.error("Approve error:", err);
    }
  };

  const handleDeny = async (visitId) => {
    try {
      const response = await axios.put(
        "http://localhost:8000/resident/deny-visit",
        { _id: visitId },
        { withCredentials: true },
      );

      if (response.status === 200) {
        const newApprovals = approvals.filter((visit) => visit._id !== visitId);
        setApprovals(newApprovals);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deny visitor.");
      console.error("Deny error:", err);
    }
  };
  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans flex">
      <aside
        className={`bg-black w-64 p-6 flex flex-col justify-between h-screen fixed top-0 left-0 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div>
          <div className="text-2xl font-bold mb-8 text-white">APT APT</div>
          <nav className="space-y-3">
            <Link
              to="/resident"
              className="flex items-center py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300"
            >
              Dashboard
            </Link>
            <Link
              to="/resident/approvals"
              className="flex items-center py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300"
            >
              Approvals
            </Link>
            <Link
              to="/resident/history"
              className="flex items-center py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300"
            >
              History
            </Link>
            <Link
              to="/resident/settings"
              className="flex items-center py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300"
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="border-t border-gray-700 pt-6">
          <div className="flex items-center space-x-3 text-gray-200">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0"></div>
            <div>{name}</div>
          </div>
          <button
            onClick={() => setLogoutModalOpen(true)}
            className="block mt-4 py-2 px-3 rounded-md hover:bg-gray-800 text-gray-300 text-sm text-left w-full"
          >
            Logout
          </button>
        </div>
      </aside>

      <main
        className={`flex-1 p-8 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"}`}
      >
        <header className="flex justify-between items-center mb-8">
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
            <h2 className="text-3xl font-bold text-white">
              Resident Dashboard
            </h2>
          </div>
        </header>

        <Outlet
          context={{ approvals, loading, error, handleApprove, handleDeny }}
        />
      </main>

      <ToastContainer theme="dark" position="top-right" />
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
};

export default ResidentDashboard;
