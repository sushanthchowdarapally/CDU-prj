import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button, Input } from '../../components/common/FormComponents';
import { Card } from '../../components/common/CardsAndBadges';
import {
  Mail,
  Lock,
  Building2,
  Users,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export const Login = () => {
  const { login, loginDirectly } = useAuth();
  const { allUsers } = useApp();
  const navigate = useNavigate();
  const [activePortal, setActivePortal] = useState('TENANT'); // 'OWNER' or 'TENANT'

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      email: 'tenant@example.com',
      password: 'Password123'
    }
  });

  const onSubmit = (formData) => {
    const result = login(formData.email, formData.password, allUsers);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      if (result.user.role === 'OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/tenant/dashboard');
      }
    } else {
      toast.error(result.message || 'Invalid email or password');
    }
  };

  const directLaunchOwner = () => {
    const ownerUser = allUsers.find(u => u.role === 'OWNER') || {
      id: "owner_001",
      name: "Rajesh Sharma",
      email: "owner@example.com",
      role: "OWNER"
    };
    loginDirectly(ownerUser);
    toast.success('Logged in as Owner (Rajesh Sharma)');
    navigate('/owner/dashboard');
  };

  const directLaunchTenant = () => {
    const tenantUser = allUsers.find(u => u.role === 'TENANT') || {
      id: "user_002",
      name: "Rahul Kumar",
      email: "rahul@example.com",
      role: "TENANT"
    };
    loginDirectly(tenantUser);
    toast.success('Logged in as Resident (Rahul Kumar)');
    navigate('/tenant/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-[#6C4AB6] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg ring-8 ring-purple-100">
            PG
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            PG Manager
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
            Choose which portal you want to access: Owner App or Resident Tenant App
          </p>
        </div>

        {/* Big Dual-Portal Launch Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Tenant App Card */}
          <div
            onClick={directLaunchTenant}
            className="p-5 bg-white hover:bg-[#F8F5FE] border-2 border-purple-200 hover:border-[#6C4AB6] rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F3EEFF] text-[#6C4AB6] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Ready to test
                </span>
              </div>
              <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#6C4AB6] transition-colors">
                🏠 Tenant App
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Log in as <strong>Rahul Kumar</strong> to view rent, pay due bills, and submit complaints.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#6C4AB6]">
              <span>Launch Tenant App</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Owner App Card */}
          <div
            onClick={directLaunchOwner}
            className="p-5 bg-white hover:bg-[#F8F5FE] border-2 border-gray-200 hover:border-[#4B2E83] rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#4B2E83] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-[#6C4AB6]">
                  Management
                </span>
              </div>
              <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#4B2E83] transition-colors">
                🏢 Owner App
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Log in as <strong>Rajesh Sharma</strong> to manage properties, rooms, beds, and verify rent payments.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#4B2E83]">
              <span>Launch Owner App</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Manual Login Card */}
        <Card>
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-900">Sign in with Email & Password</h4>
            <p className="text-xs text-gray-400">Or use your custom registered credentials</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. tenant@example.com or owner@example.com"
              icon={Mail}
              required
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </span>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#6C4AB6] hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                icon={Lock}
                error={errors.password?.message}
                {...register('password', { required: 'Password is required' })}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            Need an account?{' '}
            <Link to="/register" className="font-bold text-[#6C4AB6] hover:underline">
              Create account
            </Link>
          </div>
        </Card>

        {/* Demo credentials info */}
        <div className="text-center text-[11px] text-gray-400">
          PG Manager • Live linked data between Owner and Tenant Apps
        </div>
      </div>
    </div>
  );
};
