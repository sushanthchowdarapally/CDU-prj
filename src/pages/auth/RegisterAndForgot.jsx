import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button, Input, Select } from '../../components/common/FormComponents';
import { Card } from '../../components/common/CardsAndBadges';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'OWNER',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = (formData) => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: formData.name,
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone,
      role: formData.role,
      password: formData.password
    };

    registerAuth(newUser);
    toast.success(`Account created! Welcome, ${newUser.name}`);
    if (newUser.role === 'OWNER') {
      navigate('/owner/dashboard');
    } else {
      navigate('/tenant/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#6C4AB6] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md ring-8 ring-purple-100">
            PG
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-gray-500">
            Sign up to manage your properties or access your PG resident dashboard
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Select
              label="I am joining as"
              required
              options={[
                { value: 'OWNER', label: 'Property / PG Owner (Management)' },
                { value: 'TENANT', label: 'Resident / Tenant (Tenant App)' }
              ]}
              {...register('role')}
            />

            <Input
              label="Full Name"
              placeholder="e.g. Ramesh Chandra"
              icon={User}
              required
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="ramesh@example.com"
              icon={Mail}
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Valid email is required' }
              })}
            />

            <Input
              label="Phone Number"
              placeholder="+91 98765 00000"
              icon={Phone}
              required
              error={errors.phone?.message}
              {...register('phone', { required: 'Phone number is required' })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' }
              })}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', { required: 'Please confirm password' })}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting}
              icon={ArrowRight}
              iconPosition="right"
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#6C4AB6] hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = () => {
    setSubmitted(true);
    toast.success('Password reset link sent to your email.');
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#6C4AB6] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md ring-8 ring-purple-100">
            PG
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-gray-500">
            Enter your account email to receive recovery instructions
          </p>
        </div>

        <Card>
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold">
                Reset link sent! Please check your inbox or use demo password: Password123
              </div>
              <Link to="/login">
                <Button variant="primary" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                required
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Valid email is required' }
                })}
              />

              <Button type="submit" className="w-full" size="lg">
                Send Reset Link
              </Button>

              <div className="pt-2 text-center">
                <Link to="/login" className="text-xs font-bold text-[#6C4AB6] hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
