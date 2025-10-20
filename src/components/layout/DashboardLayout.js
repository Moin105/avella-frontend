import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Building, 
  ChevronDown,
  LayoutDashboard,
  CalendarCheck,
  Scissors,
  Briefcase,
  Plug
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { currentTenant, tenants, switchTenant } = useTenant();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
    { name: 'Barbers', href: '/dashboard/barbers', icon: Scissors },
    { name: 'Services', href: '/dashboard/services', icon: Briefcase },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Integrations', href: '/dashboard/integrations', icon: Plug },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <img 
                  src="/images/avella-logo.png" 
                  alt="Avella AI" 
                  className="h-10 w-10 mr-2"
                />
                <span className="text-xl font-bold text-gray-900">Avella AI</span>
              </Link>
              
              {/* Tenant Selector */}
              {currentTenant && (
                <div className="ml-8 flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-2" />
                  <select 
                    value={currentTenant.id}
                    onChange={(e) => {
                      const tenant = tenants.find(t => t.id === e.target.value);
                      switchTenant(tenant);
                    }}
                    className="border-0 bg-transparent text-gray-700 font-medium focus:ring-0 focus:outline-none"
                  >
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.business_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
                </div>
              )}
              
              {/* Search Bar */}
              <div className="ml-8 flex-1 max-w-lg">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search bookings, clients, barbers..."
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user?.first_name} • Owner
              </span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.first_name?.charAt(0) || 'S'}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                data-testid="logout-btn"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
          <div className="p-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
            </div>
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Bottom Links */}
            <div className="mt-auto pt-8">
              <ul className="space-y-1">
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors text-sm">
                    Help & Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors text-sm">
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
