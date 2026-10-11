import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  DoorClosed,
  Users,
  CreditCard,
  Receipt,
  AlertTriangle,
  Bell,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

export const OwnerLayout = () => {
  const { user, logout, loginDirectly } = useAuth();
  const { notifications, allUsers, resetToDefaultData } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter(n => n.userId === user?.id && !n.isRead).length;

  const navItems = [
    { name: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    { name: 'Properties', path: '/owner/properties', icon: Building2 },
    { name: 'Rooms', path: '/owner/rooms', icon: DoorClosed },
    { name: 'Tenants', path: '/owner/tenants', icon: Users },
    { name: 'Rent Management', path: '/owner/rent', icon: CreditCard },
    { name: 'Payments', path: '/owner/payments', icon: Receipt },
    { name: 'Problems', path: '/owner/problems', icon: AlertTriangle },
    { name: 'Notifications', path: '/owner/notifications', icon: Bell, badge: unreadCount },
    { name: 'Announcements', path: '/owner/announcements', icon: Megaphone },
    { name: 'Reports', path: '/owner/reports', icon: BarChart3 },
    { name: 'Settings', path: '/owner/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSwitchToTenant = () => {
    // Find Rahul or default tenant
    const tenantUser = allUsers.find(u => u.role === 'TENANT') || {
      id: "user_002",
      name: "Rahul Kumar",
      email: "rahul@example.com",
      role: "TENANT"
    };
    loginDirectly(tenantUser);
    toast.success(`Switched to Tenant App as ${tenantUser.name}`);
    navigate('/tenant/dashboard');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to default state?')) {
      resetToDefaultData();
      toast.success('Data reset to default successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#6C4AB6] text-white flex items-center justify-center font-black text-lg shadow-sm">
              PG
            </div>
            <div>
              <span className="font-extrabold text-base text-gray-900 tracking-tight block">PG Manager</span>
              <span className="text-[10px] font-semibold text-[#6C4AB6] uppercase tracking-wider block">Owner Portal</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/owner/dashboard' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#F3EEFF] text-[#6C4AB6]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#6C4AB6]' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#6C4AB6] text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Quick Demo Switcher & Bottom Actions */}
        <div className="p-3 border-t border-gray-100 space-y-1.5">
          <button
            type="button"
            onClick={handleSwitchToTenant}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#6C4AB6] bg-[#F3EEFF] hover:bg-[#E4D8FC] rounded-xl transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Switch to Tenant View
          </button>

          <button
            type="button"
            onClick={handleResetData}
            title="Reset to clean sample data"
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Demo Data
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-gray-400 font-medium">Welcome back,</span>
              <h2 className="text-sm font-bold text-gray-900 leading-none">{user?.name || 'Owner'}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct switch button */}
            <button
              type="button"
              onClick={handleSwitchToTenant}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6C4AB6] bg-[#F3EEFF] hover:bg-[#E4D8FC] rounded-xl transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              View as Tenant (Rahul)
            </button>

            {/* Notification Bell */}
            <NavLink
              to="/owner/notifications"
              className="relative p-2 text-gray-500 hover:text-[#6C4AB6] hover:bg-[#F3EEFF] rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </NavLink>

            {/* Owner Profile icon */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full bg-[#6C4AB6] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {user?.name?.charAt(0) || 'O'}
              </div>
              <span className="hidden sm:block text-xs font-bold text-gray-700">
                {user?.name?.split(' ')[0] || 'Owner'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
