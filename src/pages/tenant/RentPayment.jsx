import React, { useState } from 'react';
import { useTenant, useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Card, Badge, EmptyState } from '../../components/common/CardsAndBadges';
import { Button } from '../../components/common/FormComponents';
import { PaymentSubmissionModal } from '../../components/tenant/PaymentSubmissionModal';
import {
  CreditCard,
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export const RentPayment = () => {
  const { tenant, currentRent, rentHistory, paymentHistory } = useTenant();
  const { allUsers } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const ownerUser = allUsers.find(u => u.role === 'OWNER') || {
    upiId: 'rajeshsharma@oksbi',
    bankDetails: {
      accountName: 'Rajesh Sharma',
      accountNumber: '987654321098',
      ifsc: 'SBIN0001234'
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(ownerUser.upiId || 'rajeshsharma@oksbi');
    setCopied(true);
    toast.success('Owner UPI ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!tenant) {
    return (
      <EmptyState
        icon={CreditCard}
        title="No rent account found"
        description="Your room assignment has not been completed by the owner yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Rent & Payments
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review monthly rent status, submit payment proof, and track verification
        </p>
      </div>

      {/* Current Rent Highlight Card */}
      <Card className="border-purple-200 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block">
              Current Billing ({currentRent?.month || 'October'} {currentRent?.year || '2026'})
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-1">
              {formatCurrency(currentRent ? currentRent.amount : tenant.monthlyRent)}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge status={currentRent ? currentRent.status : 'DUE_SOON'} size="md" />
              <span className="text-xs text-gray-500">
                Due on {currentRent ? formatDate(currentRent.dueDate) : `${tenant.dueDate}th of month`}
              </span>
            </div>
          </div>

          <div>
            <Button
              variant="primary"
              size="lg"
              icon={CreditCard}
              onClick={() => setShowModal(true)}
            >
              Submit Payment
            </Button>
          </div>
        </div>

        {currentRent?.status === 'PAID' && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Your payment for {currentRent.month} has been verified and confirmed!
          </div>
        )}
      </Card>

      {/* Payment Instructions / Owner Bank Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3 bg-[#F8F5FE] border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#6C4AB6]" />
              <h3 className="text-sm font-bold text-gray-900">Owner's UPI QR / ID</h3>
            </div>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="text-xs font-semibold text-[#6C4AB6] hover:text-[#4B2E83] flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-purple-200 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy UPI'}
            </button>
          </div>

          <div className="bg-white p-3 rounded-xl border border-purple-100 flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-gray-900 select-all">
              {ownerUser.upiId || 'rajeshsharma@oksbi'}
            </span>
            <span className="text-[11px] text-gray-400">BHIM / GPay / PhonePe</span>
          </div>

          <p className="text-[11px] text-gray-600 leading-relaxed">
            Scan and pay using any UPI app. After transfer, click "Submit Payment" to provide the 12-digit UTR and screenshot.
          </p>
        </Card>

        <Card className="space-y-3 bg-gray-50 border-gray-200">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-bold text-gray-900">Direct Bank Transfer (NEFT/IMPS)</h3>
          </div>

          <div className="space-y-1 text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-400">Account Name:</span>
              <span className="font-semibold">{ownerUser.bankDetails?.accountName || 'Rajesh Sharma'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Account Number:</span>
              <span className="font-mono font-semibold">{ownerUser.bankDetails?.accountNumber || '987654321098'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">IFSC Code:</span>
              <span className="font-mono font-semibold">{ownerUser.bankDetails?.ifsc || 'SBIN0001234'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Submissions / History */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-gray-900">Your Payment Submissions</h3>

        {paymentHistory.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No payment submissions yet"
            description="When you make a payment and submit proof, it will appear here for verification."
            actionText="Submit Rent Payment"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7FC] text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Transaction / UTR</th>
                  <th className="py-3 px-4">Proof</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paymentHistory.map((p) => (
                  <tr key={p.id} className="hover:bg-purple-50/20">
                    <td className="py-3.5 px-4 text-gray-700 font-medium">{formatDate(p.paymentDate)}</td>
                    <td className="py-3.5 px-4 font-black text-gray-900 text-sm">{formatCurrency(p.amount)}</td>
                    <td className="py-3.5 px-4 text-gray-600">{p.paymentMethod}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600 select-all">{p.transactionId}</td>
                    <td className="py-3.5 px-4">
                      {p.screenshot && (
                        <a
                          href={p.screenshot}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#6C4AB6] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge status={p.status} />
                      {p.rejectionReason && (
                        <span className="block text-[10px] text-red-500 mt-1">
                          Reason: {p.rejectionReason}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      <PaymentSubmissionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        rentItem={currentRent}
      />
    </div>
  );
};
