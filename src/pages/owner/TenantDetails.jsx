import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Card, Badge, StatCard, EmptyState } from '../../components/common/CardsAndBadges';
import { Button } from '../../components/common/FormComponents';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import {
  Users,
  Building,
  DoorClosed,
  Bed as BedIcon,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  AlertTriangle,
  Send,
  LogOut,
  ArrowRightLeft,
  ShieldAlert,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export const TenantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    tenants,
    properties,
    rooms,
    beds,
    rents,
    payments,
    problems,
    sendRentReminder,
    vacateTenant
  } = useApp();

  const [showVacateDialog, setShowVacateDialog] = useState(false);

  const tenant = tenants.find((t) => t.id === id);

  if (!tenant) {
    return (
      <div className="py-12 text-center">
        <EmptyState
          icon={Users}
          title="Tenant Profile Not Found"
          description="The tenant does not exist or has been deleted."
          actionText="Back to Tenants"
          onAction={() => navigate('/owner/tenants')}
        />
      </div>
    );
  }

  const property = properties.find((p) => p.id === tenant.propertyId);
  const room = rooms.find((r) => r.id === tenant.roomId);
  const bed = beds.find((b) => b.id === tenant.bedId);

  const tenantRents = rents.filter((r) => r.tenantId === tenant.id);
  const tenantPayments = payments.filter((p) => p.tenantId === tenant.id);
  const tenantProblems = problems.filter((prob) => prob.tenantId === tenant.id);

  const currentRent = tenantRents.find((r) => r.status !== 'PAID') || tenantRents[0];

  const handleSendReminder = () => {
    if (currentRent) {
      sendRentReminder(tenant.id, currentRent.id);
      toast.success(`Rent reminder sent to ${tenant.name}!`);
    } else {
      toast.info('No pending rent for this tenant.');
    }
  };

  const handleVacate = () => {
    vacateTenant(tenant.id);
    toast.success(`${tenant.name} marked as vacated.`);
    setShowVacateDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Back button and Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/owner/tenants')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#6C4AB6] mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tenants
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6C4AB6] text-white flex items-center justify-center font-black text-xl shadow-xs">
              {tenant.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {tenant.name}
                </h1>
                <Badge status={tenant.status} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Joined on {formatDate(tenant.joiningDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {tenant.status === 'ACTIVE' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Send}
                  onClick={handleSendReminder}
                >
                  Send Reminder
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  icon={LogOut}
                  onClick={() => setShowVacateDialog(true)}
                >
                  Vacate Tenant
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Profile Details & Room Assignment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Details */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#6C4AB6] pb-2 border-b border-purple-100">
            Resident Contact & Details
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-400 block font-medium">Primary Mobile</span>
                <span className="font-bold text-gray-900">{tenant.phone}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-400 block font-medium">Email / Login ID</span>
                <span className="font-bold text-gray-900">{tenant.email}</span>
              </div>
            </div>

            {tenant.emergencyContact && (
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block font-medium">Emergency Contact</span>
                  <span className="font-bold text-gray-900">{tenant.emergencyContact}</span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5 pt-2 border-t border-gray-100">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-400 block font-medium">Lease Period</span>
                <span className="font-semibold text-gray-800">
                  {formatDate(tenant.leaseStart)} - {formatDate(tenant.leaseEnd) || 'Ongoing'}
                </span>
              </div>
            </div>

            {tenant.address && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-400 block font-medium mb-1">Permanent Home Address</span>
                <span className="text-gray-700 leading-relaxed block">{tenant.address}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Room & Bed Allocation */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#6C4AB6] pb-2 border-b border-purple-100">
            Current Stay Allocation
          </h3>

          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl text-[#6C4AB6] shadow-2xs">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Property</span>
                <span className="font-bold text-gray-900 text-sm">{property?.name || 'Assigned Property'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-100">
              <div className="p-2 bg-white rounded-xl">
                <span className="text-[10px] text-gray-400 block font-semibold">Room</span>
                <span className="font-extrabold text-gray-800 text-sm">Room {room?.roomNumber}</span>
              </div>
              <div className="p-2 bg-white rounded-xl">
                <span className="text-[10px] text-gray-400 block font-semibold">Assigned Bed</span>
                <span className="font-extrabold text-[#6C4AB6] text-sm">{bed?.bedNumber || 'Bed'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-gray-50 rounded-xl">
              <span className="text-gray-500 font-medium">Monthly Rent</span>
              <span className="font-extrabold text-gray-900">{formatCurrency(tenant.monthlyRent)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-xl">
              <span className="text-gray-500 font-medium">Security Deposit Paid</span>
              <span className="font-bold text-gray-900">{formatCurrency(tenant.securityDeposit)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-xl">
              <span className="text-gray-500 font-medium">Rent Due Date</span>
              <span className="font-bold text-[#6C4AB6]">{tenant.dueDate}th of every month</span>
            </div>
          </div>
        </Card>

        {/* Current Month Rent Card */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#6C4AB6] pb-2 border-b border-purple-100">
            Active Rent Status
          </h3>

          {currentRent ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <span className="text-xs text-gray-500 block">
                  {currentRent.month} {currentRent.year} Rent
                </span>
                <h4 className="text-3xl font-black text-gray-900 mt-1">
                  {formatCurrency(currentRent.amount)}
                </h4>
                <div className="mt-2">
                  <Badge status={currentRent.status} />
                </div>
              </div>

              <div className="text-xs space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <span className="font-bold text-gray-800">{formatDate(currentRent.dueDate)}</span>
                </div>
                {currentRent.paidAt && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Paid on:</span>
                    <span className="font-bold">{formatDate(currentRent.paidAt)}</span>
                  </div>
                )}
              </div>

              {currentRent.status !== 'PAID' && (
                <Button
                  variant="primary"
                  className="w-full"
                  size="sm"
                  icon={Send}
                  onClick={handleSendReminder}
                >
                  Send Payment Reminder
                </Button>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No active rent record found.</p>
          )}
        </Card>
      </div>

      {/* Rent Records & Payments History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rent Schedule */}
        <Card className="space-y-3">
          <h3 className="text-base font-bold text-gray-900">Rent Invoices / Dues</h3>
          {tenantRents.length === 0 ? (
            <p className="text-xs text-gray-400">No rent history available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tenantRents.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">{r.month} {r.year}</td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">{formatCurrency(r.amount)}</td>
                      <td className="py-2.5 px-3 text-gray-500">{formatDate(r.dueDate)}</td>
                      <td className="py-2.5 px-3 text-right"><Badge status={r.status} size="xs" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Payments History */}
        <Card className="space-y-3">
          <h3 className="text-base font-bold text-gray-900">Payment Transactions</h3>
          {tenantPayments.length === 0 ? (
            <p className="text-xs text-gray-400">No payments submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tenantPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 text-gray-600">{formatDate(p.paymentDate)}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">{formatCurrency(p.amount)}</td>
                      <td className="py-2.5 px-3 text-gray-600">{p.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right"><Badge status={p.status} size="xs" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Reported Complaints by this tenant */}
      <Card className="space-y-3">
        <h3 className="text-base font-bold text-gray-900">Maintenance Issues Logged</h3>
        {tenantProblems.length === 0 ? (
          <p className="text-xs text-gray-400">No issues reported by this tenant.</p>
        ) : (
          <div className="space-y-2">
            {tenantProblems.map((prob) => (
              <div key={prob.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#6C4AB6]">{prob.category}</span>
                    <span className="text-gray-300">•</span>
                    <span className="font-bold text-gray-900">{prob.title}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Reported on {formatDate(prob.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={prob.status} size="xs" />
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => navigate(`/owner/problems/${prob.id}`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Vacate Confirm Dialog */}
      <ConfirmDialog
        isOpen={showVacateDialog}
        onClose={() => setShowVacateDialog(false)}
        onConfirm={handleVacate}
        title="Confirm Vacating Resident"
        message={`Are you sure you want to mark ${tenant.name} as vacated? This will free up their bed immediately.`}
        confirmText="Confirm Vacate"
        confirmVariant="danger"
      />
    </div>
  );
};
