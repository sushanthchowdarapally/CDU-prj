import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ArrowLeftRight, Building2, UserCheck, Shield } from 'lucide-react';
import { toast } from 'sonner';

export const QuickAppSwitcher = () => {
  const { user, loginDirectly } = useAuth();
  const { allUsers } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // If on public login / register page, don't show the bar
  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password') {
    return null;
  }

  const isOwner = user?.role === 'OWNER';

  const switchToTenant = () => {
    const tenantUser = allUsers.find(u => u.role === 'TENANT') || {
      id: "user_002",
      name: "Rahul Kumar",
      email: "rahul@example.com",
      role: "TENANT"
    };
    loginDirectly(tenantUser);
    toast.success(`Switched to Resident / Tenant App (${tenantUser.name})`);
    navigate('/tenant/dashboard');
  };

  const switchToOwner = () => {
    const ownerUser = allUsers.find(u => u.role === 'OWNER') || {
      id: "owner_001",
      name: "Rajesh Sharma",
      email: "owner@example.com",
      role: "OWNER"
    };
    loginDirectly(ownerUser);
    toast.success('Switched to Owner Management App (Rajesh Sharma)');
    navigate('/owner/dashboard');
  };

  return (
    <div className="fixed bottom-3 right-3 z-50 shadow-2xl rounded-2xl bg-gray-900/95 backdrop-blur-md text-white border border-gray-700/80 px-4 py-2.5 flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 pr-3 border-r border-gray-700">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-gray-400">Mode:</span>
        <span className="font-bold text-white flex items-center gap-1.5">
          {isOwner ? (
            <>
              <Building2 className="w-3.5 h-3.5 text-purple-400" /> Owner App
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Tenant App ({user?.name?.split(' ')[0] || 'Rahul'})
            </>
          )}
        </span>
      </div>

      <button
        type="button"
        onClick={isOwner ? switchToTenant : switchToOwner}
        className="px-3 py-1.5 rounded-xl font-bold bg-[#6C4AB6] hover:bg-[#583999] text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
      >
        <ArrowLeftRight className="w-3.5 h-3.5" />
        <span>{isOwner ? 'Switch to 🏠 Tenant App' : 'Switch to 🏢 Owner App'}</span>
      </button>
    </div>
  );
};
