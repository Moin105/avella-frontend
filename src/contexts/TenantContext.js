import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [tenants, setTenants] = useState([]);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

  useEffect(() => {
    if (isAuthenticated) {
      fetchTenants();
    }
  }, [isAuthenticated]);

  // Set X-Tenant-ID header when current tenant changes
  useEffect(() => {
    if (currentTenant) {
      axios.defaults.headers.common['X-Tenant-ID'] = currentTenant.id;
    } else {
      delete axios.defaults.headers.common['X-Tenant-ID'];
    }
  }, [currentTenant]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tenants/my`);
      setTenants(response.data);
      
      // Auto-select first tenant if available
      if (response.data.length > 0 && !currentTenant) {
        setCurrentTenant(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTenant = async (tenantData) => {
    try {
      const response = await axios.post(`${API_URL}/tenants`, tenantData);
      const newTenant = response.data;
      
      setTenants(prev => [...prev, newTenant]);
      
      // Set as current tenant if it's the first one
      if (tenants.length === 0) {
        setCurrentTenant(newTenant);
      }
      
      return { success: true, tenant: newTenant };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to create tenant';
      return { success: false, error: message };
    }
  };

  const updateTenant = async (tenantId, updateData) => {
    try {
      const response = await axios.put(`${API_URL}/tenants/${tenantId}`, updateData);
      const updatedTenant = response.data;
      
      setTenants(prev => prev.map(t => t.id === tenantId ? updatedTenant : t));
      
      if (currentTenant?.id === tenantId) {
        setCurrentTenant(updatedTenant);
      }
      
      return { success: true, tenant: updatedTenant };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to update tenant';
      return { success: false, error: message };
    }
  };

  const switchTenant = (tenant) => {
    setCurrentTenant(tenant);
  };

  const initializeDefaultServices = async () => {
    try {
      await axios.post(`${API_URL}/services/initialize-default`);
      return { success: true, message: 'Default services initialized' };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to initialize services';
      return { success: false, error: message };
    }
  };

  const value = {
    tenants,
    currentTenant,
    loading,
    fetchTenants,
    createTenant,
    updateTenant,
    switchTenant,
    initializeDefaultServices
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};