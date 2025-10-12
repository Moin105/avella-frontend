import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Save, X } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CopyLibrary = () => {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, [selectedTenant]);

  const loadTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = selectedTenant ? { tenant_id: selectedTenant } : {};
      
      const response = await axios.get(
        `${API_URL}/admin/templates`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params
        }
      );
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate({...template});
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/admin/templates/${editingTemplate.id}`,
        {
          name: editingTemplate.name,
          content: editingTemplate.content,
          is_active: editingTemplate.is_active
        },
        { headers: { 'Authorization': `Bearer ${token}` }}
      );

      setEditingTemplate(null);
      loadTemplates();
      alert('Template updated successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    }
  };

  const handleCreateOverride = async (globalTemplate) => {
    if (!selectedTenant) {
      alert('Please select a tenant first');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/templates`,
        {
          template_type: globalTemplate.template_type,
          name: `${globalTemplate.name} (${selectedTenant})`,
          content: globalTemplate.content,
          is_global: false,
          tenant_id: selectedTenant
        },
        { headers: { 'Authorization': `Bearer ${token}` }}
      );

      loadTemplates();
      alert('Tenant override created successfully');
    } catch (error) {
      console.error('Error creating override:', error);
      alert('Failed to create override');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Copy Library (SMS/Email Templates)</h1>
        <div>
          <select
            value={selectedTenant || ''}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Templates (Global)</option>
            {/* TODO: Load tenants from API */}
          </select>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Available Variables:</h3>
        <div className="text-sm space-y-1">
          <div><code className="bg-white px-2 py-1 rounded">{'{{tenantName}}'}</code> - Business name</div>
          <div><code className="bg-white px-2 py-1 rounded">{'{{service}}'}</code> - Service name</div>
          <div><code className="bg-white px-2 py-1 rounded">{'{{date}}'}</code> - Appointment date</div>
          <div><code className="bg-white px-2 py-1 rounded">{'{{time}}'}</code> - Appointment time</div>
          <div><code className="bg-white px-2 py-1 rounded">{'{{addr}}'}</code> - Business address</div>
          <div><code className="bg-white px-2 py-1 rounded">{'{{link}}'}</code> - Booking management link</div>
          <div><code className="bg-white px-2 py-1 rounded">{'{{cancelPolicy}}'}</code> - Cancellation policy</div>
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold">{template.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs ${
                    template.is_global 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {template.is_global ? 'Global' : 'Tenant Override'}
                  </span>
                  <span className="text-sm text-gray-600">{template.template_type}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                {template.is_global && selectedTenant && (
                  <button
                    onClick={() => handleCreateOverride(template)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Create Override
                  </button>
                )}
                <button
                  onClick={() => handleEdit(template)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <Edit className="inline" size={14} /> Edit
                </button>
              </div>
            </div>
            
            {editingTemplate?.id === template.id ? (
              <div>
                <textarea
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    content: e.target.value
                  })}
                  rows={6}
                  className="w-full px-3 py-2 border rounded mb-3"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Save className="inline mr-1" size={16} /> Save
                  </button>
                  <button
                    onClick={() => setEditingTemplate(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    <X className="inline mr-1" size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                {template.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CopyLibrary;
