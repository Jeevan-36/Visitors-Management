import React from 'react';
import { useOutletContext } from 'react-router-dom';

const ResidentApprovals = () => {
  const { approvals, loading, error, handleApprove, handleDeny } = useOutletContext();

  return (
    <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg">
      <h3 className="text-lg md:text-xl font-semibold text-white mb-4">
        Pending Approvals
      </h3>
      <div className="max-h-[70vh] md:max-h-72 overflow-y-auto space-y-4 pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-400">Loading requests...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 p-4 rounded-md text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && approvals.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded-md">
            <p className="text-gray-500 text-sm">No pending approvals found.</p>
          </div>
        )}

        {approvals.map((visit) => (
          <div
            key={visit._id}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-900 p-4 rounded-md border border-gray-700 gap-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white truncate">{visit.visitor.name}</p>
              <div className="flex flex-wrap items-center gap-x-2 text-xs md:text-sm text-gray-400 mt-1">
                <span>Purpose: {visit.purpose}</span>
                <span className="hidden sm:inline">|</span>
                <span className="text-blue-400">
                  {new Date(visit.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="flex space-x-2 w-full sm:w-auto">
              <button 
                onClick={() => handleApprove(visit._id)}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-md transition-colors shadow-lg shadow-blue-900/20"
              >
                Approve
              </button>
              <button 
                onClick={() => handleDeny(visit._id)}
                className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-md transition-colors"
              >
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResidentApprovals;