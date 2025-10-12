import React, { useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Settings, 
  Building, 
  Clock, 
  Globe, 
  Phone, 
  Mail,
  Save,
  Users,
  Bell,
  Shield
} from 'lucide-react';

const SettingsView = () => {
  const { currentTenant, updateTenant } = useTenant();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(false);

  const [businessSettings, setBusinessSettings] = useState({
    businessName: currentTenant?.business_name || '',
    businessType: currentTenant?.business_type || 'salon',
    address: currentTenant?.address || '',
    phone: currentTenant?.phone || '',
    website: currentTenant?.website || '',
    timezone: currentTenant?.timezone || 'America/New_York',
    logoUrl: currentTenant?.logo_url || ''
  });

  const [businessHours, setBusinessHours] = useState({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: true, start: '10:00', end: '16:00' },
    sunday: { enabled: false, start: '10:00', end: '16:00' }
  });

  const [bookingSettings, setBookingSettings] = useState({
    bufferTimeMinutes: 5,
    maxAdvanceBookingDays: 30,
    cancellationWindowHours: 24,
    autoConfirmBookings: true,
    allowOnlineBooking: true,
    requirePhone: true,
    requireEmail: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    smsConfirmations: true,
    emailConfirmations: true,
    smsReminders: true,
    emailReminders: true,
    reminderTimeBefore: 60, // minutes
    smsNoShow: false,
    emailNoShow: true
  });

  const tabs = [
    { id: 'business', name: 'Business Info', icon: Building },
    { id: 'hours', name: 'Business Hours', icon: Clock },
    { id: 'booking', name: 'Booking Settings', icon: Settings },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'team', name: 'Team & Users', icon: Users },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  ];

  const businessTypes = [
    { value: 'salon', label: 'Hair Salon' },
    { value: 'barbershop', label: 'Barbershop' },
    { value: 'spa', label: 'Spa' },
    { value: 'beauty', label: 'Beauty Salon' },
  ];

  const handleSaveBusinessInfo = async () => {
    try {
      setLoading(true);
      const result = await updateTenant(currentTenant.id, {
        business_name: businessSettings.businessName,
        business_type: businessSettings.businessType,
        address: businessSettings.address,
        phone: businessSettings.phone,
        website: businessSettings.website,
        timezone: businessSettings.timezone
      });
      
      if (result.success) {
        alert('Business information updated successfully!');
      } else {
        alert('Error updating business information: ' + result.error);
      }
    } catch (error) {
      alert('Error saving changes');
    } finally {
      setLoading(false);
    }
  };

  const renderBusinessInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={businessSettings.businessName}
              onChange={(e) => setBusinessSettings(prev => ({...prev, businessName: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <select
              value={businessSettings.businessType}
              onChange={(e) => setBusinessSettings(prev => ({...prev, businessType: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {businessTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={businessSettings.address}
              onChange={(e) => setBusinessSettings(prev => ({...prev, address: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Main St, City, State 12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={businessSettings.phone}
              onChange={(e) => setBusinessSettings(prev => ({...prev, phone: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={businessSettings.website}
              onChange={(e) => setBusinessSettings(prev => ({...prev, website: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={businessSettings.timezone}
              onChange={(e) => setBusinessSettings(prev => ({...prev, timezone: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <button
          onClick={handleSaveBusinessInfo}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );

  const renderBusinessHours = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
      <div className="space-y-4">
        {Object.entries(businessHours).map(([day, hours]) => (
          <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-24">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {day}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={hours.enabled}
                onChange={(e) => setBusinessHours(prev => ({
                  ...prev,
                  [day]: { ...prev[day], enabled: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Open</span>
            </div>

            {hours.enabled && (
              <>
                <input
                  type="time"
                  value={hours.start}
                  onChange={(e) => setBusinessHours(prev => ({
                    ...prev,
                    [day]: { ...prev[day], start: e.target.value }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={hours.end}
                  onChange={(e) => setBusinessHours(prev => ({
                    ...prev,
                    [day]: { ...prev[day], end: e.target.value }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </>
            )}

            {!hours.enabled && (
              <span className="text-sm text-gray-500 italic">Closed</span>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save Hours</span>
        </button>
      </div>
    </div>
  );

  const renderBookingSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Booking Settings</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buffer Time (minutes)
            </label>
            <input
              type="number"
              value={bookingSettings.bufferTimeMinutes}
              onChange={(e) => setBookingSettings(prev => ({...prev, bufferTimeMinutes: parseInt(e.target.value)}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="60"
            />
            <p className="text-sm text-gray-500 mt-1">Time between appointments</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Advance Booking (days)
            </label>
            <input
              type="number"
              value={bookingSettings.maxAdvanceBookingDays}
              onChange={(e) => setBookingSettings(prev => ({...prev, maxAdvanceBookingDays: parseInt(e.target.value)}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="365"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Window (hours)
            </label>
            <input
              type="number"
              value={bookingSettings.cancellationWindowHours}
              onChange={(e) => setBookingSettings(prev => ({...prev, cancellationWindowHours: parseInt(e.target.value)}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="168"
            />
            <p className="text-sm text-gray-500 mt-1">Minimum notice required</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Booking Options</h4>
          
          {[
            { key: 'autoConfirmBookings', label: 'Auto-confirm bookings', description: 'Automatically confirm new bookings' },
            { key: 'allowOnlineBooking', label: 'Allow online booking', description: 'Enable online booking widget' },
            { key: 'requirePhone', label: 'Require phone number', description: 'Make phone number mandatory' },
            { key: 'requireEmail', label: 'Require email address', description: 'Make email address mandatory' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{setting.label}</div>
                <div className="text-sm text-gray-500">{setting.description}</div>
              </div>
              <input
                type="checkbox"
                checked={bookingSettings[setting.key]}
                onChange={(e) => setBookingSettings(prev => ({...prev, [setting.key]: e.target.checked}))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">SMS Notifications</h4>
          <div className="space-y-3">
            {[
              { key: 'smsConfirmations', label: 'Booking confirmations' },
              { key: 'smsReminders', label: 'Appointment reminders' },
              { key: 'smsNoShow', label: 'No-show notifications' }
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <span className="text-gray-700">{setting.label}</span>
                <input
                  type="checkbox"
                  checked={notificationSettings[setting.key]}
                  onChange={(e) => setNotificationSettings(prev => ({...prev, [setting.key]: e.target.checked}))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Email Notifications</h4>
          <div className="space-y-3">
            {[
              { key: 'emailConfirmations', label: 'Booking confirmations' },
              { key: 'emailReminders', label: 'Appointment reminders' },
              { key: 'emailNoShow', label: 'No-show notifications' }
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <span className="text-gray-700">{setting.label}</span>
                <input
                  type="checkbox"
                  checked={notificationSettings[setting.key]}
                  onChange={(e) => setNotificationSettings(prev => ({...prev, [setting.key]: e.target.checked}))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Time (minutes before appointment)
          </label>
          <select
            value={notificationSettings.reminderTimeBefore}
            onChange={(e) => setNotificationSettings(prev => ({...prev, reminderTimeBefore: parseInt(e.target.value)}))}
            className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={1440}>1 day</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save Notifications</span>
        </button>
      </div>
    </div>
  );

  const renderPlaceholder = (title) => (
    <div className="text-center py-12">
      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">This section will be implemented in the next phase</p>
    </div>
  );

  return (
    <div className="space-y-6" data-testid="settings-view">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your business settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'business' && renderBusinessInfo()}
          {activeTab === 'hours' && renderBusinessHours()}
          {activeTab === 'booking' && renderBookingSettings()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'team' && renderPlaceholder('Team & Users')}
          {activeTab === 'security' && renderPlaceholder('Security Settings')}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;