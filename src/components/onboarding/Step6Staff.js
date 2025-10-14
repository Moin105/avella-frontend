import React, { useState } from 'react';
import { Users, Plus, Upload, X, FileText, AlertCircle, Mail } from 'lucide-react';
import { validateEmail, getValidationError } from '../../utils/validation';

const Step6Staff = ({ data, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    staff: data?.staff || []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [csvPreview, setCsvPreview] = useState(null);
  const [csvError, setCsvError] = useState('');

  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: '',
    servicesAssigned: [],
    calendarConnected: false
  });

  const staffRoles = [
    'Owner-Admin', 'Manager', 'Stylist', 'Barber', 'Therapist', 'Technician', 'Assistant', 'Other'
  ];

  const availableServices = data?.services || [];

  const handleAddStaff = () => {
    const newErrors = {};

    // Validate new staff
    if (!newStaff.name.trim()) {
      newErrors.name = 'Staff name is required';
    }
    if (!newStaff.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailError = getValidationError('email', newStaff.email);
      if (emailError) {
        newErrors.email = emailError;
      }
    }
    if (!newStaff.role.trim()) {
      newErrors.role = 'Role is required';
    }

    // Check for duplicate email
    const isDuplicate = formData.staff.some(staff => 
      staff.email.toLowerCase() === newStaff.email.toLowerCase()
    );

    if (isDuplicate) {
      newErrors.email = 'Staff with this email already exists';
    }

    // Auto-assign role if email matches owner email
    if (data?.contacts?.owner?.email && 
        newStaff.email.toLowerCase() === data.contacts.owner.email.toLowerCase()) {
      setNewStaff(prev => ({ ...prev, role: 'Owner-Admin' }));
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Add staff
    setFormData(prev => ({
      ...prev,
      staff: [...prev.staff, { ...newStaff }]
    }));

    // Reset form
    setNewStaff({
      name: '',
      email: '',
      role: '',
      servicesAssigned: [],
      calendarConnected: false
    });
    setShowAddForm(false);
    setErrors({});
  };

  const handleRemoveStaff = (index) => {
    setFormData(prev => ({
      ...prev,
      staff: prev.staff.filter((_, i) => i !== index)
    }));
  };

  const handleServiceToggle = (serviceName) => {
    setNewStaff(prev => ({
      ...prev,
      servicesAssigned: prev.servicesAssigned.includes(serviceName)
        ? prev.servicesAssigned.filter(s => s !== serviceName)
        : [...prev.servicesAssigned, serviceName]
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
        const requiredHeaders = ['name', 'email', 'role'];
        
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

    const newStaffMembers = csvPreview.data.map(row => {
      const servicesAssigned = row.servicesassigned 
        ? row.servicesassigned.split(';').map(s => s.trim()).filter(s => s)
        : [];

      return {
        name: row.name || '',
        email: row.email || '',
        role: row.role || 'Stylist',
        servicesAssigned,
        calendarConnected: false
      };
    });

    // Check for duplicates
    const duplicates = newStaffMembers.filter(newStaff =>
      formData.staff.some(existingStaff =>
        existingStaff.email.toLowerCase() === newStaff.email.toLowerCase()
      )
    );

    if (duplicates.length > 0) {
      setCsvError(`Duplicate staff found: ${duplicates.map(s => s.email).join(', ')}`);
      return;
    }

    // Auto-assign owner-admin role for matching emails
    const updatedStaff = newStaffMembers.map(staff => {
      if (data?.contacts?.owner?.email && 
          staff.email.toLowerCase() === data.contacts.owner.email.toLowerCase()) {
        return { ...staff, role: 'Owner-Admin' };
      }
      return staff;
    });

    setFormData(prev => ({
      ...prev,
      staff: [...prev.staff, ...updatedStaff]
    }));

    setCsvPreview(null);
    setCsvError('');
  };

  const validateForm = () => {
    if (formData.staff.length === 0) {
      setErrors({ staff: 'At least one staff member is required' });
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
        staff: formData.staff
      };

      onUpdate(updatedData);
      onNext();
    } catch (error) {
      console.error('Error in Step 6:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Staff Members
        </h2>
        <p className="text-gray-600">
          Add your staff members. You can add them manually or import from a CSV file.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CSV Import Section */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Import Staff from CSV
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
                CSV format: name, email, role, servicesAssigned (semicolon-separated)
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
                    Import Staff
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
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Staff Members ({formData.staff.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Staff
            </button>
          </div>

          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Staff Member</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@elitehair.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.role ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select role</option>
                    {staffRoles.map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calendar Connected
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newStaff.calendarConnected}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, calendarConnected: e.target.checked }))}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Connected to calendar</span>
                  </div>
                </div>
              </div>

              {/* Services Assignment */}
              {availableServices.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Services
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {availableServices.map(service => (
                      <label key={service.name} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newStaff.servicesAssigned.includes(service.name)}
                          onChange={() => handleServiceToggle(service.name)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{service.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleAddStaff}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Add Staff
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStaff({
                      name: '',
                      email: '',
                      role: '',
                      servicesAssigned: [],
                      calendarConnected: false
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

          {/* Staff List */}
          {formData.staff.length > 0 ? (
            <div className="space-y-3">
              {formData.staff.map((staff, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h4 className="font-medium text-gray-900">{staff.name}</h4>
                      <span className="text-sm text-gray-500">{staff.role}</span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {staff.email}
                      </span>
                      {staff.calendarConnected && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Calendar Connected
                        </span>
                      )}
                    </div>
                    {staff.servicesAssigned.length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-500">
                          Services: {staff.servicesAssigned.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStaff(index)}
                    className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No staff members added yet. Add your first staff member above.</p>
            </div>
          )}

          {errors.staff && (
            <p className="mt-2 text-sm text-red-600">{errors.staff}</p>
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
            disabled={loading || formData.staff.length === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Next: Phone Routing'}
          </button>
        </div>
      </form>

      {/* Summary Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Staff Summary:</h4>
        <div className="text-sm text-gray-600">
          <p><strong>Total Staff:</strong> {formData.staff.length}</p>
          {formData.staff.length > 0 && (
            <div className="mt-2">
              <p><strong>Roles:</strong> {[...new Set(formData.staff.map(s => s.role))].join(', ')}</p>
              <p><strong>Calendar Connected:</strong> {formData.staff.filter(s => s.calendarConnected).length} of {formData.staff.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step6Staff;
