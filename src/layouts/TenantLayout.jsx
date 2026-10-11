import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/AppContext';
import {
  LayoutDashboard,
  CreditCard,
  AlertTriangle,
  Bell,
  LogOut,
  Building,
  Shield,
  ArrowLeftRight
} from 'lucide-react';
import { toast } from 'sonner';

export const TenantLayout = () => {
  const { user, logout, loginDirectly } = useAuth();
  const { tenant, property, room, bed, unreadCount } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSwitchToOwner = () => {
    const ownerUser = {
      id: "owner_001",
      name: "Rajesh Sharma",
      email: "owner@example.com",
      role: "OWNER"
    };
    loginDirectly(ownerUser);
    toast.success('Switched to Owner Management View');
    navigate('/owner/dashboard');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/tenant/dashboard', icon: LayoutDashboard },
    { name: 'Rent & Pay', path: '/tenant/rent', icon: CreditCard },
    { name: 'Report Issue', path: '/tenant/problem', icon: AlertTriangle },
    { name: 'Alerts', path: '/tenant/notifications', icon: Bell, badge: unreadCount },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex flex-col pb-16 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#6C4AB6] text-white flex items-center justify-center font-black text-sm shadow-sm">
            PG
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight leading-none block">
              PG Manager
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
              <span className="font-medium text-[#6C4AB6]">
                {property?.name || 'Resident Portal'}
              </span>
              {room && (
                <>
                  <span>•</span>
                  <span>Room {room.roomNumber} ({bed?.bedNumber || 'Bed'})</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Nav & User Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden md:flex items-center gap-1 bg-[#F8F7FC] p-1 rounded-xl border border-gray-100">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-white text-[#6C4AB6] shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                  {link.badge > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-rose-500 text-white">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Switch to Owner */}
          <button
            type="button"
            onClick={handleSwitchToOwner}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#6C4AB6] bg-[#F3EEFF] hover:bg-[#E4D8FC] rounded-xl transition-all cursor-pointer"
            title="Switch to Owner Portal"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Owner View</span>
          </button>

          {/* Notifications icon (Mobile/Desktop) */}
          <NavLink
            to="/tenant/notifications"
            className="relative p-2 text-gray-500 hover:text-[#6C4AB6] hover:bg-[#F3EEFF] rounded-xl transition-colors md:hidden"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </NavLink>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex items-center justify-around py-2 px-1 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        {navLinks.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-[#6C4AB6]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {link.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'font-bold' : ''}`}>
                {link.name}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
