import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Card, Badge, EmptyState, StatCard } from '../../components/common/CardsAndBadges';
import { Button, Input, Select } from '../../components/common/FormComponents';
import { VerifyPaymentModal } from '../../components/owner/VerifyPaymentModal';
import {
  Receipt,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  ShieldAlert,
  Clock,
  Check,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

export const Payments = () => {
  const { payments, tenants, properties, rooms, rents, approvePayment, rejectPayment } = useApp();

  const [activeTab, setActiveTab] = useState('PENDING_VERIFICATION'); // PENDING_VERIFICATION, VERIFIED, REJECTED
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Tab counts
  const pendingCount = payments.filter((p) => p.status === 'PENDING_VERIFICATION').length;
  const verifiedCount = payments.filter((p) => p.status === 'VERIFIED').length;
  const rejectedCount = payments.filter((p) => p.status === 'REJECTED').length;

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const tenant = tenants.find((t) => t.id === p.tenantId);
      const matchSearch =
        tenant?.name.toLowerCase().includes(search.toLowerCase()) ||
        p.transactionId.toLowerCase().includes(search.toLowerCase());

      const matchTab = activeTab === 'ALL' || p.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [payments, tenants, search, activeTab]);

  const handleQuickApprove = (payment) => {
    try {
      approvePayment(payment.id);
      toast.success(`Payment of ${formatCurrency(payment.amount)} approved & rent marked PAID!`);
    } catch {
      toast.error('Failed to approve payment.');
    }
  };

  const handleQuickReject = (payment) => {
    const reason = window.prompt('Enter reason for rejecting this payment submission:');
    if (reason && reason.trim()) {
      rejectPayment(payment.id, reason.trim());
      toast.success('Payment marked as rejected. Tenant notified.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Payment Verification
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review screenshots, verify UPI/Bank reference IDs, and confirm rent settlements
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Approvals"
          value={pendingCount}
          subtext="Requires verification"
          icon={Clock}
          className={pendingCount > 0 ? 'border-amber-200 bg-amber-50/20' : ''}
        />
        <StatCard
          title="Verified Payments"
          value={verifiedCount}
          subtext="Successfully approved"
          icon={CheckCircle}
        />
        <StatCard
          title="Rejected Submissions"
          value={rejectedCount}
          subtext="Returned for correction"
          icon={XCircle}
        />
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-3">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('PENDING_VERIFICATION')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'PENDING_VERIFICATION'
                ? 'bg-[#6C4AB6] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span>Pending Verification</span>
            {pendingCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'PENDING_VERIFICATION' ? 'bg-white text-[#6C4AB6]' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'VERIFIED'
                ? 'bg-[#6C4AB6] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span>Verified ({verifiedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'REJECTED'
                ? 'bg-[#6C4AB6] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span>Rejected ({rejectedCount})</span>
          </button>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by tenant or transaction ID..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Payments List / Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={
            activeTab === 'PENDING_VERIFICATION'
              ? 'No payments pending verification'
              : 'No payment submissions found'
          }
          description={
            activeTab === 'PENDING_VERIFICATION'
              ? 'All resident payments are verified and up to date.'
              : 'There are no records under this status filter.'
          }
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7FC] text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">Resident</th>
                <th className="py-3.5 px-4">Room & Property</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Method & Date</th>
                <th className="py-3.5 px-4">Txn / UTR ID</th>
                <th className="py-3.5 px-4">Screenshot</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.map((payment) => {
                const tenant = tenants.find((t) => t.id === payment.tenantId);
                const property = properties.find((p) => p.id === tenant?.propertyId);
                const room = rooms.find((r) => r.id === tenant?.roomId);
                const rent = rents.find((r) => r.id === payment.rentId);

                return (
                  <tr key={payment.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <div>{tenant?.name || 'Resident'}</div>
                      <div className="text-[11px] font-normal text-gray-400">
                        For {rent?.month || 'Current'} {rent?.year || '2026'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">Room {room?.roomNumber || 'N/A'}</div>
                      <div className="text-[11px] text-gray-400">{property?.name}</div>
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-[#4B2E83] text-sm">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      <div className="font-medium text-gray-800">{payment.paymentMethod}</div>
                      <div className="text-[11px] text-gray-400">{formatDate(payment.paymentDate)}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-gray-700">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] block truncate max-w-[140px] select-all">
                        {payment.transactionId}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {payment.screenshot ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPayment(payment)}
                          className="flex items-center gap-1.5 text-xs text-[#6C4AB6] font-semibold hover:underline cursor-pointer"
                        >
                          <img
                            src={payment.screenshot}
                            alt="Receipt"
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                          />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[11px]">No proof</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={payment.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={Eye}
                          onClick={() => setSelectedPayment(payment)}
                        >
                          Inspect
                        </Button>

                        {payment.status === 'PENDING_VERIFICATION' && (
                          <>
                            <Button
                              variant="primary"
                              size="xs"
                              icon={Check}
                              onClick={() => handleQuickApprove(payment)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="xs"
                              onClick={() => handleQuickReject(payment)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Verify / Review Modal */}
      <VerifyPaymentModal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        payment={selectedPayment}
      />
    </div>
  );
};
