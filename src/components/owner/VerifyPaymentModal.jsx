import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button, Textarea } from '../common/FormComponents';
import { Badge } from '../common/CardsAndBadges';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { CheckCircle, XCircle, ExternalLink, Calendar, CreditCard, Hash, FileText } from 'lucide-react';

export const VerifyPaymentModal = ({ isOpen, onClose, payment }) => {
  const { tenants, properties, rooms, rents, approvePayment, rejectPayment } = useApp();
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!payment) return null;

  const tenant = tenants.find(t => t.id === payment.tenantId);
  const property = properties.find(p => p.id === tenant?.propertyId);
  const room = rooms.find(r => r.id === tenant?.roomId);
  const rent = rents.find(r => r.id === payment.rentId);

  const handleApprove = () => {
    setProcessing(true);
    try {
      approvePayment(payment.id);
      toast.success(`Payment of ${formatCurrency(payment.amount)} verified & marked PAID!`);
      onClose();
    } catch {
      toast.error('Failed to verify payment.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a reason for rejecting the payment');
      return;
    }
    setProcessing(true);
    try {
      rejectPayment(payment.id, rejectReason);
      toast.success('Payment marked as rejected');
      setRejecting(false);
      setRejectReason('');
      onClose();
    } catch {
      toast.error('Failed to reject payment.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setRejecting(false);
        onClose();
      }}
      title="Verify Payment Submission"
      description="Inspect tenant payment screenshot and transaction details before confirming."
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 pt-1">
        {/* Tenant & Status banner */}
        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
          <div>
            <h4 className="text-sm font-bold text-gray-900">{tenant?.name || 'Tenant'}</h4>
            <p className="text-xs text-gray-500">
              {property?.name} • Room {room?.roomNumber}
            </p>
          </div>
          <Badge status={payment.status} />
        </div>

        {/* Amount & Period */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-[#F8F5FE] rounded-2xl border border-purple-100 text-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block">Amount Submitted</span>
            <span className="text-2xl font-extrabold text-[#4B2E83]">{formatCurrency(payment.amount)}</span>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block">Rent Period</span>
            <span className="text-base font-bold text-gray-800">{rent?.month || 'Current'} {rent?.year || '2026'}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white border border-gray-100 rounded-xl flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-[#6C4AB6]" />
            <div>
              <span className="text-gray-400 block font-medium">Method</span>
              <span className="font-bold text-gray-800">{payment.paymentMethod}</span>
            </div>
          </div>
          <div className="p-3 bg-white border border-gray-100 rounded-xl flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#6C4AB6]" />
            <div>
              <span className="text-gray-400 block font-medium">Payment Date</span>
              <span className="font-bold text-gray-800">{formatDate(payment.paymentDate)}</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white border border-gray-100 rounded-xl flex items-center gap-2.5 text-xs">
          <Hash className="w-4 h-4 text-[#6C4AB6] shrink-0" />
          <div className="truncate">
            <span className="text-gray-400 block font-medium">Transaction Reference / UTR</span>
            <span className="font-mono font-bold text-gray-900 select-all">{payment.transactionId}</span>
          </div>
        </div>

        {payment.notes && (
          <div className="p-3 bg-white border border-gray-100 rounded-xl flex items-start gap-2.5 text-xs">
            <FileText className="w-4 h-4 text-[#6C4AB6] shrink-0 mt-0.5" />
            <div>
              <span className="text-gray-400 block font-medium">Tenant Notes</span>
              <span className="text-gray-700">{payment.notes}</span>
            </div>
          </div>
        )}

        {/* Screenshot View */}
        <div>
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
            Payment Screenshot
          </span>
          <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video max-h-48 flex items-center justify-center">
            {payment.screenshot ? (
              <>
                <img
                  src={payment.screenshot}
                  alt="Payment Proof"
                  className="w-full h-full object-cover"
                />
                <a
                  href={payment.screenshot}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-xs"
                >
                  <ExternalLink className="w-4 h-4" /> View Full Image
                </a>
              </>
            ) : (
              <span className="text-xs text-gray-400">No screenshot attached</span>
            )}
          </div>
        </div>

        {/* Rejection form mode */}
        {rejecting ? (
          <div className="p-4 bg-red-50/50 border border-red-200 rounded-2xl space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-red-700">Specify Rejection Reason</h5>
            <Textarea
              rows={2}
              placeholder="e.g. UTR number not found in bank statement, amount mismatch..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRejecting(false)}
              >
                Back
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={processing}
                onClick={handleReject}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3">
            {payment.status === 'PENDING_VERIFICATION' ? (
              <>
                <Button
                  variant="danger"
                  icon={XCircle}
                  onClick={() => setRejecting(true)}
                  disabled={processing}
                >
                  Reject Payment
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    icon={CheckCircle}
                    loading={processing}
                    onClick={handleApprove}
                  >
                    Approve Payment
                  </Button>
                </div>
              </>
            ) : (
              <div className="w-full flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {payment.status === 'VERIFIED'
                    ? `Verified by ${payment.verifiedBy || 'Owner'} on ${formatDate(payment.verifiedAt)}`
                    : `Rejected: ${payment.rejectionReason}`}
                </span>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
