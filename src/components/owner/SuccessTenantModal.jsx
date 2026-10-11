import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/FormComponents';
import { CheckCircle2, Copy, Check, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SuccessTenantModal = ({ isOpen, onClose, data }) => {
  const [copied, setCopied] = useState(false);
  const { loginDirectly } = useAuth();
  const navigate = useNavigate();

  if (!data) return null;

  const { credentials, user } = data;

  const handleCopy = () => {
    const text = `PG Manager Credentials:\nName: ${credentials.name}\nLogin Email: ${credentials.email}\nTemporary Password: ${credentials.password}\nLogin URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleQuickLogin = () => {
    if (user) {
      loginDirectly(user);
      toast.success(`Logged in as ${user.name}`);
      onClose();
      navigate('/tenant/dashboard');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tenant Account Created"
      maxWidth="max-w-md"
    >
      <div className="text-center pt-2 pb-1 space-y-4">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h4 className="text-lg font-bold text-gray-900">{credentials.name}</h4>
          <p className="text-xs text-gray-500 mt-0.5">Account, profile, rent record & bed linked successfully</p>
        </div>

        <div className="bg-[#F8F7FC] border border-purple-100 rounded-2xl p-4 text-left space-y-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Login Email</span>
            <span className="text-sm font-semibold text-gray-900 select-all">{credentials.email}</span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Temporary Password</span>
            <span className="text-sm font-mono font-bold text-[#6C4AB6] bg-white px-2 py-0.5 rounded border border-purple-100 inline-block select-all">
              {credentials.password}
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Button
            variant="outline"
            className="w-full"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
          >
            {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
          </Button>

          <Button
            variant="primary"
            className="w-full"
            icon={LogIn}
            onClick={handleQuickLogin}
          >
            Quick Switch & Login as {credentials.name.split(' ')[0]}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-xs text-gray-500"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
