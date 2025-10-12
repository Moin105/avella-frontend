import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, RotateCcw, Eye, Filter } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ErrorCenter = () => {
  const [errors, setErrors] = useState([]);
  const [filters, setFilters] = useState({
    tenant_id: '',
    integration: 'all'
  });
  const [selectedError, setSelectedError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadErrors();
  }, [filters]);

  const loadErrors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (filters.tenant_id) params.tenant_id = filters.tenant_id;
      if (filters.integration !== 'all') params.integration = filters.integration;

      const response = await axios.get(
        `${API_URL}/admin/events/failed`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params
        }
      );
      setErrors(response.data);
    } catch (error) {
      console.error('Error loading failed events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = async (eventId) => {
    if (!confirm('Replay this failed event?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/admin/events/replay/${eventId}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` }}
      );

      if (response.data.success) {
        alert('Event replay initiated successfully');
        loadErrors();
      } else {
        alert('Replay failed: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error replaying event:', error);
      alert('Failed to replay event');
    }
  };

  const viewDetails = (error) => {
    setSelectedError(error);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <AlertTriangle className="mr-2 text-red-500" />
          Error Center
        </h1>
        <button
          onClick={loadErrors}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-600" />
          <select
            value={filters.integration}
            onChange={(e) => setFilters({...filters, integration: e.target.value})}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All Integrations</option>
            <option value="google_calendar">Google Calendar</option>
            <option value="twilio">Twilio</option>
            <option value="retell">Retell.ai</option>
            <option value="booking">Booking</option>
          </select>
          <select
            value={filters.tenant_id}
            onChange={(e) => setFilters({...filters, tenant_id: e.target.value})}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Tenants</option>
            {/* TODO: Load tenants from API */}
          </select>
        </div>
      </div>

      {/* Errors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Integration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {errors.map((error) => (
              <tr key={error.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(error.timestamp_utc).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {error.event_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {error.integration}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-red-600 max-w-xs truncate">
                  {error.error_message}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs font-mono">
                  {error.request_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => viewDetails(error)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleReplay(error.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Replay"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {errors.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No failed events found
          </div>
        )}
      </div>

      {/* Error Details Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Error Details</h2>
                <button
                  onClick={() => setSelectedError(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Event Type</div>
                  <div className="text-lg">{selectedError.event_type}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Request ID</div>
                  <div className="font-mono text-sm">{selectedError.request_id}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Error Message</div>
                  <div className="text-red-600">{selectedError.error_message}</div>
                </div>

                {selectedError.error_code && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Error Code</div>
                    <div>{selectedError.error_code}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-700">Payload Snapshot</div>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedError.payload_snapshot, null, 2)}
                  </pre>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleReplay(selectedError.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <RotateCcw className="inline mr-2" size={16} />
                    Replay Event
                  </button>
                  <button
                    onClick={() => setSelectedError(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorCenter;
