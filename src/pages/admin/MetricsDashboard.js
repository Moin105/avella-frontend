import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const MetricsDashboard = () => {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [period, setPeriod] = useState(30); // 7, 30, 90 days
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    if (selectedTenant) {
      loadMetrics();
    }
  }, [selectedTenant, period]);

  const loadMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/admin/metrics/${selectedTenant}?days=${period}`,
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      setMetrics(response.data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/admin/metrics/${selectedTenant}/export`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: {
            start_date: dateRange.start,
            end_date: dateRange.end
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `metrics_${selectedTenant}_${dateRange.start}_${dateRange.end}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  if (!selectedTenant) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">
          Please select a tenant to view metrics
        </div>
      </div>
    );
  }

  if (!metrics) return <div>Loading...</div>;

  const chartData = Object.entries(metrics.daily_breakdown).map(([date, data]) => ({
    date,
    bookings: data.bookings,
    cancellations: data.cancellations
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Metrics Dashboard</h1>
        <div className="flex space-x-3">
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">Select Tenant</option>
            {/* TODO: Load tenants from API */}
          </select>
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="px-3 py-2 border rounded"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Bookings</div>
          <div className="text-3xl font-bold text-blue-600">{metrics.total_bookings}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Confirmed</div>
          <div className="text-3xl font-bold text-green-600">{metrics.confirmed}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Cancelled</div>
          <div className="text-3xl font-bold text-red-600">{metrics.cancelled}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Cancellation Rate</div>
          <div className="text-3xl font-bold text-orange-600">
            {metrics.cancellation_rate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Booking Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="bookings" stroke="#3b82f6" />
            <Line type="monotone" dataKey="cancellations" stroke="#ef4444" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CSV Export */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Export Data</h2>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="px-3 py-2 border rounded"
            />
          </div>
          <button
            onClick={exportCSV}
            disabled={!dateRange.start || !dateRange.end}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            <Download className="inline mr-2" size={16} />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
