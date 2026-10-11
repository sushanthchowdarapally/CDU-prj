import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Card, Badge, EmptyState } from '../../components/common/CardsAndBadges';
import { Button } from '../../components/common/FormComponents';
import { PaymentSubmissionModal } from '../../components/tenant/PaymentSubmissionModal';
import {
  CreditCard,
  AlertTriangle,
  Building,
  DoorClosed,
  Bed as BedIcon,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Bell
} from 'lucide-react';

export const TenantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    tenant,
    property,
    room,
    bed,
    currentRent,
    paymentHistory,
    problems,
    notifications
  } = useTenant();

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // If no tenant record is linked to this account yet
  if (!tenant) {
    return (
      <div className="py-8">
        <EmptyState
          icon={Building}
          title={`Welcome, ${user?.name || 'Resident'}`}
          description="Your tenant profile is being set up by the PG owner. As soon as the owner assigns your property, room, and bed, your rent and dues will appear here."
        />
      </div>
    );
  }

  const latestPayment = paymentHistory[0];
  const activeProblems = problems.filter(p => p.status === 'OPEN' || p.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-[#4B2E83] to-[#6C4AB6] text-white p-5 sm:p-6 rounded-3xl shadow-sm">
        <div>
          <span className="text-purple-200 text-xs font-semibold uppercase tracking-wider block">
            Resident Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
            Hello, {tenant.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-white">{property?.name || 'Sunshine PG'}</span>
            <span>•</span>
            <span>Room {room?.roomNumber || 'A-101'}</span>
            <span>•</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
              {bed?.bedNumber || 'Bed 2'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <Button
            variant="secondary"
            size="sm"
            icon={AlertTriangle}
            onClick={() => navigate('/tenant/problem')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Report Issue
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={CreditCard}
            onClick={() => setShowPaymentModal(true)}
            className="bg-white text-[#4B2E83] hover:bg-purple-50 shadow-sm"
          >
            Pay Rent
          </Button>
        </div>
      </div>

      {/* Main Rent Status Highlight Card */}
      <Card className="border-purple-200 bg-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F3EEFF] rounded-bl-full -z-0 opacity-50" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block">
                {currentRent?.month || 'Current'} {currentRent?.year || '2026'} Rent
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-1">
                {formatCurrency(currentRent ? currentRent.amount : tenant.monthlyRent)}
              </h2>
            </div>
            {currentRent && (
              <Badge status={currentRent.status} size="md" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-gray-100">
            <div>
              <span className="text-gray-400 block font-medium">Due Date</span>
              <span className="font-bold text-gray-800 text-sm">
                {currentRent ? formatDate(currentRent.dueDate) : `${tenant.dueDate}th of month`}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Payment Status</span>
              <span className="font-bold text-gray-800 text-sm">
                {currentRent?.status === 'PAID'
                  ? 'Settled & Verified'
                  : currentRent?.status === 'OVERDUE'
                  ? 'Overdue — Please Pay'
                  : 'Pending / Due Soon'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            {currentRent?.status !== 'PAID' ? (
              <Button
                variant="primary"
                size="lg"
                icon={CreditCard}
                className="w-full sm:flex-1"
                onClick={() => setShowPaymentModal(true)}
              >
                Submit Rent Payment Proof
              </Button>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 w-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Rent is fully paid and confirmed for this period!
              </div>
            )}

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate('/tenant/rent')}
            >
              View Rent Details
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Maintenance / Problems Quick Card */}
        <Card className="hover:border-purple-200 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Maintenance & Complaints</h3>
              </div>
              <Badge status={activeProblems.length > 0 ? 'OPEN' : 'RESOLVED'} size="xs">
                {activeProblems.length} Active
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Need repairs for electricity, plumbing, water, or WiFi? Submit a ticket directly to the owner.
            </p>

            {problems.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs mb-3 space-y-1">
                <span className="font-bold text-gray-800 block truncate">Latest: {problems[0].title}</span>
                <span className="text-[11px] text-[#6C4AB6] block">Status: {problems[0].status}</span>
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/tenant/problem')}
          >
            Report a Problem
          </Button>
        </Card>

        {/* Notifications & Announcements Quick Card */}
        <Card className="hover:border-purple-200 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#F3EEFF] text-[#6C4AB6] rounded-xl">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Notices & Messages</h3>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Stay updated with owner announcements, payment verification notices, and rent due alerts.
            </p>

            {notifications.length > 0 && (
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs mb-3 space-y-1">
                <span className="font-bold text-gray-800 block truncate">{notifications[0].title}</span>
                <span className="text-[11px] text-gray-500 block line-clamp-1">{notifications[0].message}</span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/tenant/notifications')}
          >
            View All Alerts
          </Button>
        </Card>
      </div>

      {/* Payment Submission Modal */}
      <PaymentSubmissionModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        rentItem={currentRent}
      />
    </div>
  );
};
