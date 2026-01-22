import React from 'react';
import { useOutletContext } from 'react-router-dom';

const ResidentApprovals = () => {
  const { approvals, loading, error, handleApprove, handleDeny } = useOutletContext();

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Pending Approvals
      </h3>
      <div className="max-h-72 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        
        {loading && <p className="text-center text-gray-400">Loading...</p>}
        {error && <p className="text-red-400 text-center py-4">{error}</p>}
        {!loading && !error && approvals.length === 0 && (
          <p className="text-gray-400 text-center py-4">No pending approvals.</p>
        )}
        {approvals.map((visit) => (
          <div
            key={visit._id}
            className="flex justify-between items-center bg-gray-900 p-4 rounded-md"
          >
            <div>
              <p className="font-semibold text-white">{visit.visitor.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                Purpose: {visit.purpose} | Expected: {new Date(visit.createdAt).toLocaleTimeString('en-IN')}
              </p>
            </div>
            <div className="flex space-x-3 flex-shrink-0">
              <button 
                onClick={() => handleApprove(visit._id)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                Approve
              </button>
              <button 
                onClick={() => handleDeny(visit._id)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
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