import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import axios from 'axios';
import { 
  Scissors, 
  Search, 
  Plus, 
  Clock, 
  DollarSign,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';

const ServicesView = () => {
  const { currentTenant } = useTenant();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0,
    category: 'Haircuts & Trims',
    buffer_minutes: 5,
    is_active: true
  });

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

  // Real services data will be loaded from API

  const categories = [
    'all',
    'Haircuts & Trims',
    'Grooming', 
    'Styling & Finishing',
    'Color Services',
    'Treatments',
    'Consultations'
  ];

  useEffect(() => {
    if (currentTenant) {
      loadServices();
    }
  }, [currentTenant]);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, categoryFilter]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/services`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': currentTenant?.id
        }
      });
      setServices(response.data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      // Fallback to empty array if API fails
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category === categoryFilter);
    }

    // Sort by category then name
    filtered.sort((a, b) => {
      if (a.category === b.category) {
        return a.name.localeCompare(b.name);
      }
      return a.category.localeCompare(b.category);
    });

    setFilteredServices(filtered);
  };

  const formatDuration = (duration, buffer) => {
    const total = duration + buffer;
    if (total >= 60) {
      const hours = Math.floor(total / 60);
      const minutes = total % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${total}m`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Haircuts & Trims': 'bg-blue-100 text-blue-800',
      'Grooming': 'bg-green-100 text-green-800',
      'Styling & Finishing': 'bg-purple-100 text-purple-800',
      'Color Services': 'bg-pink-100 text-pink-800',
      'Treatments': 'bg-yellow-100 text-yellow-800',
      'Consultations': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setNewService({
      name: service.name || '',
      description: service.description || '',
      duration_minutes: service.duration_minutes || 30,
      price: service.price || 0,
      category: service.category || 'Haircuts & Trims',
      buffer_minutes: service.buffer_minutes || 5,
      is_active: service.is_active
    });
    setShowServiceModal(true);
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setNewService({
      name: '',
      description: '',
      duration_minutes: 30,
      price: 0,
      category: 'Haircuts & Trims',
      buffer_minutes: 5,
      is_active: true
    });
    setShowServiceModal(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      if (selectedService) {
        // Update existing service
        const response = await axios.put(`${API_URL}/services/${selectedService.id}`, newService, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': currentTenant?.id
          }
        });
        setServices(prev => prev.map(s => s.id === selectedService.id ? response.data : s));
        alert('Service updated successfully');
      } else {
        // Create new service
        const response = await axios.post(`${API_URL}/services`, newService, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': currentTenant?.id
          }
        });
        setServices(prev => [...prev, response.data]);
        alert('Service created successfully');
      }
      
      setShowServiceModal(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service. Please try again.');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        await axios.delete(`${API_URL}/services/${serviceId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': currentTenant?.id
          }
        });
        setServices(prev => prev.filter(s => s.id !== serviceId));
        alert('Service deleted successfully');
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  const groupedServices = filteredServices.reduce((groups, service) => {
    const category = service.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(service);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="services-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services & Pricing</h1>
          <p className="text-gray-600">Manage your service offerings and pricing</p>
        </div>
        <button
          onClick={handleCreateService}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          data-testid="add-service-btn"
        >
          <Plus className="h-4 w-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Total Services</div>
          <div className="text-3xl font-bold text-gray-900">{services.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Categories</div>
          <div className="text-3xl font-bold text-blue-600">
            {new Set(services.map(s => s.category)).size}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Avg Duration</div>
          <div className="text-3xl font-bold text-green-600">
            {services.length > 0 ? Math.round(services.reduce((acc, s) => acc + s.duration, 0) / services.length) : 0}m
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Avg Price</div>
          <div className="text-3xl font-bold text-purple-600">
            ${services.length > 0 ? Math.round(services.reduce((acc, s) => acc + s.price, 0) / services.length) : 0}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Services by Category */}
      <div className="space-y-8">
        {Object.keys(groupedServices).map(category => (
          <div key={category} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Scissors className="h-5 w-5 mr-2 text-gray-500" />
                {category}
                <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                  {groupedServices[category].length}
                </span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedServices[category].map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500">{service.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDuration(service.duration, service.buffer)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.duration}m + {service.buffer}m buffer
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          {service.price === 0 ? 'Free' : service.price}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          service.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditService(service)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm || categoryFilter !== 'all' 
              ? 'No services found matching your criteria' 
              : 'No services yet'
            }
          </p>
        </div>
      )}

      {/* Service Modal Placeholder */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">
              {selectedService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter service name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter service description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newService.duration_minutes}
                    onChange={(e) => setNewService({...newService, duration_minutes: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  required
                  value={newService.category}
                  onChange={(e) => setNewService({...newService, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.filter(c => c !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Time (minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={newService.buffer_minutes}
                  onChange={(e) => setNewService({...newService, buffer_minutes: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Extra time between appointments</p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active_service"
                  checked={newService.is_active}
                  onChange={(e) => setNewService({...newService, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active_service" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowServiceModal(false);
                    setSelectedService(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedService ? 'Update' : 'Create'} Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesView;