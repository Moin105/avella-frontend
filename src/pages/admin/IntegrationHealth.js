import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Clock } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const IntegrationHealth = () => {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (selectedTenant && autoRefresh) {
      const interval = setInterval(() => {
        loadHealthData(selectedTenant);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [selectedTenant, autoRefresh]);

  const loadHealthData = async (tenantId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/admin/integrations/health/${tenantId}`,
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      setHealthData(response.data);
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'connected': return <CheckCircle className="text-green-500" />;
      case 'degraded': return <AlertCircle className="text-yellow-500" />;
      case 'broken': return <XCircle className="text-red-500" />;
      default: return <Clock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'broken': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReauth = async (integration) => {
    // Implement re-auth logic for each integration
    if (integration === 'google') {
      window.location.href = `${API_URL}/auth/google/authorize?tenant_id=${selectedTenant}`;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Integration Health Monitor</h1>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={() => loadHealthData(selectedTenant)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <RefreshCw className="inline mr-2" size={16} />
            Refresh Now
          </button>
        </div>
      </div>

      {/* Tenant Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Tenant
        </label>
        <select
          value={selectedTenant || ''}
          onChange={(e) => {
            setSelectedTenant(e.target.value);
            if (e.target.value) {
              loadHealthData(e.target.value);
            }
          }}
          className="px-3 py-2 border rounded w-full max-w-md"
        >
          <option value="">Select a tenant...</option>
          {/* TODO: Load tenants from API */}
        </select>
      </div>

      {healthData && (
        <div className="space-y-6">
          {/* Google Calendar Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Google Calendar</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(healthData.live_metrics?.google_calendar?.status)}`}>
                {healthData.live_metrics?.google_calendar?.status || 'Unknown'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">Last Event</div>
                <div className="font-medium">
                  {healthData.live_metrics?.google_calendar?.last_event 
                    ? new Date(healthData.live_metrics.google_calendar.last_event).toLocaleString()
                    : 'No recent events'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Success Rate</div>
                <div className="font-medium">
                  {healthData.live_metrics?.google_calendar?.success_rate || 0}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Events (60m)</div>
                <div className="font-medium">
                  {healthData.live_metrics?.google_calendar?.total_events || 0}
                </div>
              </div>
            </div>

            {healthData.live_metrics?.google_calendar?.last_error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <div className="text-sm font-medium text-red-800">Last Error:</div>
                <div className="text-sm text-red-700">
                  {healthData.live_metrics.google_calendar.last_error.error_message}
                </div>
              </div>
            )}

            {/* Staff Calendar Status */}
            <div className="mt-4">
              <h3 className="font-medium mb-2">Staff Calendar Status</h3>
              {healthData.google_calendar?.map((staff, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
                  <div>
                    <div className="font-medium">{staff.calendar_name || 'Unknown'}</div>
                    <div className="text-sm text-gray-600">
                      Last refresh: {staff.last_refresh ? new Date(staff.last_refresh).toLocaleString() : 'Never'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(staff.status)}
                    {staff.status === 'broken' && (
                      <button
                        onClick={() => handleReauth('google')}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Re-auth
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Twilio Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Twilio SMS</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(healthData.live_metrics?.twilio?.status)}`}>
                {healthData.live_metrics?.twilio?.status || 'Unknown'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Phone Number</div>
                <div className="font-medium">{healthData.twilio?.phone_number}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Delivery Rate (7d)</div>
                <div className="font-medium">{healthData.twilio?.delivery_rate_7d}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Sent (7d)</div>
                <div className="font-medium">{healthData.twilio?.total_sent_7d}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Failed (7d)</div>
                <div className="font-medium text-red-600">{healthData.twilio?.total_failed_7d}</div>
              </div>
            </div>

            {/* Recent SMS */}
            <div className="mt-4">
              <h3 className="font-medium mb-2">Recent Messages</h3>
              <div className="space-y-2">
                {healthData.recent_sms?.slice(0, 5).map((sms, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <span className="font-medium">{sms.direction === 'inbound' ? '📥' : '📤'}</span>
                      <span className="ml-2">{sms.to_number}</span>
                      <span className="ml-4 text-gray-600">{new Date(sms.created_at).toLocaleTimeString()}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      sms.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      sms.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sms.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Retell Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Retell.ai Voice Agent</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(healthData.live_metrics?.retell?.status)}`}>
                {healthData.live_metrics?.retell?.status || 'Unknown'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Agent ID</div>
                <div className="font-medium text-xs">{healthData.retell?.agent_id || 'Not configured'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Tool Success Rate</div>
                <div className="font-medium">{healthData.retell?.tool_call_success_rate}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Calls (7d)</div>
                <div className="font-medium">{healthData.retell?.total_calls_7d}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Tool Failures (7d)</div>
                <div className="font-medium text-red-600">{healthData.retell?.total_tool_failures_7d}</div>
              </div>
            </div>

            {healthData.retell?.last_failure_reason && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                <div className="text-sm font-medium text-red-800">Last Failure:</div>
                <div className="text-sm text-red-700">{healthData.retell.last_failure_reason}</div>
              </div>
            )}
          </div>

          {/* Recent Events Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Events (Last 60 minutes)</h2>
            <div className="space-y-2">
              {healthData.recent_events?.slice(0, 20).map((event, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border-l-4 border-blue-500 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{event.event_type}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(event.timestamp_utc).toLocaleString()} • {event.integration}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    event.status === 'success' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!selectedTenant && (
        <div className="text-center py-12 text-gray-500">
          Please select a tenant to view integration health data
        </div>
      )}
    </div>
  );
};

export default IntegrationHealth;
