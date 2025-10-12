import React, { useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { 
  Link, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Settings,
  Calendar,
  MessageSquare,
  Mic,
  Zap,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

const IntegrationsView = () => {
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState({});

  const integrations = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync appointments with Google Calendar for real-time availability',
      icon: Calendar,
      status: 'connected', // connected, disconnected, error
      category: 'Calendar',
      lastSync: new Date(2025, 9, 4, 10, 30),
      connectedAccounts: 2,
      totalAccounts: 3,
      features: [
        'Real-time availability checking',
        'Automatic event creation',
        'Two-way synchronization',
        'Multiple calendar support'
      ],
      settings: {
        autoSync: true,
        conflictResolution: 'ask',
        defaultCalendar: 'primary'
      }
    },
    {
      id: 'twilio-sms',
      name: 'Twilio SMS',
      description: 'Send automated SMS notifications for bookings and reminders',
      icon: MessageSquare,
      status: 'connected',
      category: 'Communications',
      lastUsed: new Date(2025, 9, 4, 9, 15),
      messagesSent: 147,
      monthlyQuota: 1000,
      features: [
        'Booking confirmations',
        'Appointment reminders',
        'Cancellation notifications',
        'Custom message templates'
      ],
      settings: {
        confirmations: true,
        reminders: true,
        reminderTime: '1 hour before'
      }
    },
    {
      id: 'retell-ai',
      name: 'Retell.ai Voice Agent',
      description: 'AI-powered voice assistant for phone bookings and customer service',
      icon: Mic,
      status: 'disconnected',
      category: 'AI Assistant',
      features: [
        'Natural language booking',
        'Availability checking',
        'Appointment rescheduling',
        '24/7 phone support'
      ],
      settings: {
        enabled: false,
        businessHours: 'follow_schedule',
        voicePersonality: 'professional'
      }
    },
    {
      id: 'stripe',
      name: 'Stripe Payments',
      description: 'Accept online payments and deposits for appointments',
      icon: Zap,
      status: 'available',
      category: 'Payments',
      features: [
        'Online payment processing',
        'Deposit collection',
        'Refund management',
        'Payment analytics'
      ]
    },
    {
      id: 'mailgun',
      name: 'Mailgun Email',
      description: 'Professional email notifications and marketing campaigns',
      icon: MessageSquare,
      status: 'available',
      category: 'Communications',
      features: [
        'Transactional emails',
        'Email templates',
        'Delivery tracking',
        'Marketing campaigns'
      ]
    },
    {
      id: 'zapier',
      name: 'Zapier Automation',
      description: 'Connect with 5000+ apps through automated workflows',
      icon: Zap,
      status: 'available',
      category: 'Automation',
      features: [
        'Custom workflows',
        'Multi-app connections',
        'Trigger-based actions',
        'Data synchronization'
      ]
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <Settings className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return { text: 'Connected', color: 'text-green-600' };
      case 'error':
        return { text: 'Error', color: 'text-red-600' };
      case 'disconnected':
        return { text: 'Disconnected', color: 'text-gray-500' };
      default:
        return { text: 'Available', color: 'text-blue-600' };
    }
  };

  const handleConnect = async (integrationId) => {
    setLoading(prev => ({ ...prev, [integrationId]: true }));
    
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (integrationId === 'google-calendar') {
        // TODO: Implement Google Calendar OAuth flow
        alert('Google Calendar connection will redirect to OAuth flow');
      } else if (integrationId === 'retell-ai') {
        // TODO: Implement Retell.ai setup
        alert('Retell.ai voice agent setup will be configured');
      } else {
        alert(`${integrationId} connection will be implemented`);
      }
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setLoading(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  const handleDisconnect = async (integrationId) => {
    if (window.confirm('Are you sure you want to disconnect this integration?')) {
      setLoading(prev => ({ ...prev, [integrationId]: true }));
      
      try {
        // TODO: Implement disconnect logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Integration disconnected');
      } catch (error) {
        console.error('Disconnect error:', error);
      } finally {
        setLoading(prev => ({ ...prev, [integrationId]: false }));
      }
    }
  };

  const handleSync = async (integrationId) => {
    setLoading(prev => ({ ...prev, [integrationId]: true }));
    
    try {
      // TODO: Implement sync logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Sync completed');
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setLoading(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div className="space-y-6" data-testid="integrations-view">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600">Connect your favorite tools and services</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Connected</div>
          <div className="text-3xl font-bold text-green-600">
            {integrations.filter(i => i.status === 'connected').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Available</div>
          <div className="text-3xl font-bold text-blue-600">
            {integrations.filter(i => i.status === 'available').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Need Attention</div>
          <div className="text-3xl font-bold text-red-600">
            {integrations.filter(i => i.status === 'error' || i.status === 'disconnected').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Categories</div>
          <div className="text-3xl font-bold text-purple-600">{categories.length}</div>
        </div>
      </div>

      {/* Integrations by Category */}
      <div className="space-y-8">
        {categories.map(category => (
          <div key={category} className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {integrations
                  .filter(integration => integration.category === category)
                  .map((integration) => {
                    const statusInfo = getStatusText(integration.status);
                    const isLoading = loading[integration.id];
                    
                    return (
                      <div key={integration.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <integration.icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(integration.status)}
                                <span className={`text-sm font-medium ${statusInfo.color}`}>
                                  {statusInfo.text}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {integration.status === 'connected' && (
                              <button
                                onClick={() => handleSync(integration.id)}
                                disabled={isLoading}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                              >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                              </button>
                            )}
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                              <Settings className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">{integration.description}</p>

                        {/* Status Details */}
                        {integration.status === 'connected' && (
                          <div className="mb-4 p-3 bg-green-50 rounded-lg">
                            <div className="text-sm text-green-800">
                              {integration.lastSync && (
                                <div>Last sync: {integration.lastSync.toLocaleString()}</div>
                              )}
                              {integration.connectedAccounts && (
                                <div>{integration.connectedAccounts} of {integration.totalAccounts} accounts connected</div>
                              )}
                              {integration.messagesSent && (
                                <div>{integration.messagesSent} messages sent this month ({integration.monthlyQuota - integration.messagesSent} remaining)</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Features</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {integration.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {integration.status === 'connected' ? (
                            <>
                              <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
                                <Settings className="h-4 w-4" />
                                <span>Configure</span>
                              </button>
                              <button
                                onClick={() => handleDisconnect(integration.id)}
                                disabled={isLoading}
                                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
                              >
                                Disconnect
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleConnect(integration.id)}
                              disabled={isLoading}
                              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                              <Link className="h-4 w-4" />
                              <span>{isLoading ? 'Connecting...' : 'Connect'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <ExternalLink className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">Need Help with Integrations?</h3>
            <p className="text-blue-800 mb-3">
              Our integration guides will walk you through setting up each service step by step.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
              View Integration Guides
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsView;