import React, { useState } from 'react';
import { Scissors, Plus, Upload, X, FileText, AlertCircle } from 'lucide-react';
import { validateDuration, validatePrice, getValidationError } from '../../utils/validation';

const Step5Services = ({ data, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    services: data?.services || []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [csvPreview, setCsvPreview] = useState(null);
  const [csvError, setCsvError] = useState('');

  const [newService, setNewService] = useState({
    name: '',
    duration: 30,
    price: 0,
    category: '',
    bufferBeforeMin: 0,
    bufferAfterMin: 0
  });

  const serviceCategories = [
    'Haircut', 'Hair Color', 'Hair Treatment', 'Styling', 'Beard Trim',
    'Facial', 'Massage', 'Manicure', 'Pedicure', 'Waxing', 'Other'
  ];

  const handleAddService = () => {
    const newErrors = {};

    // Validate new service
    if (!newService.name.trim()) {
      newErrors.name = 'Service name is required';
    }
    if (!validateDuration(newService.duration)) {
      newErrors.duration = 'Duration must be a positive integer (minutes)';
    }
    if (!validatePrice(newService.price)) {
      newErrors.price = 'Price must be a non-negative integer (PKR)';
    }
    if (!newService.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check for duplicate service name
    const isDuplicate = formData.services.some(service => 
      service.name.toLowerCase() === newService.name.toLowerCase()
    );

    if (isDuplicate) {
      setErrors({ name: 'Service with this name already exists' });
      return;
    }

    // Add service
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { ...newService }]
    }));

    // Reset form
    setNewService({
      name: '',
      duration: 30,
      price: 0,
      category: '',
      bufferBeforeMin: 0,
      bufferAfterMin: 0
    });
    setShowAddForm(false);
    setErrors({});
  };

  const handleRemoveService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setCsvError('Please select a valid CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const lines = csvText.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setCsvError('CSV file must have at least a header row and one data row');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['name', 'duration', 'price', 'category'];
        
        const missingHeaders = requiredHeaders.filter(header => 
          !headers.includes(header)
        );

        if (missingHeaders.length > 0) {
          setCsvError(`Missing required columns: ${missingHeaders.join(', ')}`);
          return;
        }

        // Parse first 3 rows for preview
        const previewData = [];
        for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const row = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          previewData.push(row);
        }

        setCsvPreview({
          headers,
          data: previewData,
          totalRows: lines.length - 1
        });
        setCsvError('');
      } catch (error) {
        setCsvError('Error parsing CSV file: ' + error.message);
      }
    };

    reader.readAsText(file);
  };

  const handleCsvImport = () => {
    if (!csvPreview) return;

    const newServices = csvPreview.data.map(row => ({
      name: row.name || '',
      duration: parseInt(row.duration) || 30,
      price: parseInt(row.price) || 0,
      category: row.category || 'Other',
      bufferBeforeMin: parseInt(row.bufferbeforemin) || 0,
      bufferAfterMin: parseInt(row.bufferaftermin) || 0
    }));

    // Check for duplicates
    const duplicates = newServices.filter(newService =>
      formData.services.some(existingService =>
        existingService.name.toLowerCase() === newService.name.toLowerCase()
      )
    );

    if (duplicates.length > 0) {
      setCsvError(`Duplicate services found: ${duplicates.map(s => s.name).join(', ')}`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      services: [...prev.services, ...newServices]
    }));

    setCsvPreview(null);
    setCsvError('');
  };

  const validateForm = () => {
    if (formData.services.length === 0) {
      setErrors({ services: 'At least one service is required' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updatedData = {
        ...data,
        services: formData.services
      };

      onUpdate(updatedData);
      onNext();
    } catch (error) {
      console.error('Error in Step 5:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Services
        </h2>
        <p className="text-gray-600">
          Add the services you offer. You can add them manually or import from a CSV file.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CSV Import Section */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Import Services from CSV
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="csvFile" className="block text-sm font-medium text-blue-900 mb-2">
                Select CSV File
              </label>
              <input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="block w-full text-sm text-blue-900 border border-blue-300 rounded-lg cursor-pointer bg-blue-50 focus:outline-none"
              />
              <p className="mt-1 text-xs text-blue-700">
                CSV format: name, duration, price, category, bufferBeforeMin, bufferAfterMin
              </p>
            </div>

            {csvError && (
              <div className="flex items-center p-3 bg-red-100 border border-red-300 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{csvError}</span>
              </div>
            )}

            {csvPreview && (
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Preview (First 3 rows of {csvPreview.totalRows} total):
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        {csvPreview.headers.map(header => (
                          <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.data.map((row, index) => (
                        <tr key={index} className="border-t">
                          {csvPreview.headers.map(header => (
                            <td key={header} className="px-3 py-2 text-gray-600">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleCsvImport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Import Services
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCsvPreview(null);
                      setCsvError('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manual Add Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Scissors className="h-5 w-5 mr-2 text-green-600" />
              Services ({formData.services.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Service
            </button>
          </div>

          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Service</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Haircut"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newService.duration}
                    onChange={(e) => setNewService(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="30"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-xs text-red-600">{errors.duration}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newService.price}
                    onChange={(e) => setNewService(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="800"
                  />
                  {errors.price && (
                    <p className="mt-1 text-xs text-red-600">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select category</option>
                    {serviceCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-xs text-red-600">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buffer Before (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newService.bufferBeforeMin}
                    onChange={(e) => setNewService(prev => ({ ...prev, bufferBeforeMin: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buffer After (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newService.bufferAfterMin}
                    onChange={(e) => setNewService(prev => ({ ...prev, bufferAfterMin: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Add Service
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewService({
                      name: '',
                      duration: 30,
                      price: 0,
                      category: '',
                      bufferBeforeMin: 0,
                      bufferAfterMin: 0
                    });
                    setErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Services List */}
          {formData.services.length > 0 ? (
            <div className="space-y-3">
              {formData.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <span className="text-sm text-gray-500">{service.category}</span>
                      <span className="text-sm text-gray-500">{service.duration} min</span>
                      <span className="text-sm font-medium text-green-600">PKR {service.price}</span>
                      {(service.bufferBeforeMin > 0 || service.bufferAfterMin > 0) && (
                        <span className="text-xs text-gray-500">
                          Buffer: {service.bufferBeforeMin}+{service.bufferAfterMin} min
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index)}
                    className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Scissors className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No services added yet. Add your first service above.</p>
            </div>
          )}

          {errors.services && (
            <p className="mt-2 text-sm text-red-600">{errors.services}</p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back
          </button>
          
          <button
            type="submit"
            disabled={loading || formData.services.length === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Next: Staff'}
          </button>
        </div>
      </form>

      {/* Summary Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Services Summary:</h4>
        <div className="text-sm text-gray-600">
          <p><strong>Total Services:</strong> {formData.services.length}</p>
          {formData.services.length > 0 && (
            <div className="mt-2">
              <p><strong>Categories:</strong> {[...new Set(formData.services.map(s => s.category))].join(', ')}</p>
              <p><strong>Price Range:</strong> PKR {Math.min(...formData.services.map(s => s.price))} - PKR {Math.max(...formData.services.map(s => s.price))}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step5Services;
