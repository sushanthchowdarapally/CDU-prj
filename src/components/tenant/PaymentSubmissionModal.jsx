import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';
import { Input, Select, Textarea, Button } from '../common/FormComponents';
import { useTenant, useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { toast } from 'sonner';
import { Copy, Check, QrCode, Upload, ShieldCheck, ArrowRight } from 'lucide-react';

export const PaymentSubmissionModal = ({ isOpen, onClose, rentItem, onSuccess }) => {
  const { tenant, submitPayment } = useTenant();
  const { allUsers } = useApp();
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState(
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80'
  );

  const ownerUser = allUsers.find(u => u.role === 'OWNER') || {
    upiId: 'rajeshsharma@oksbi',
    bankDetails: {
      accountName: 'Rajesh Sharma',
      accountNumber: '987654321098',
      ifsc: 'SBIN0001234'
    }
  };

  const defaultAmount = rentItem ? rentItem.amount : (tenant?.monthlyRent || 8000);
  const defaultMonth = rentItem ? rentItem.month : 'October';

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      month: defaultMonth,
      amount: defaultAmount,
      paymentMethod: 'UPI',
      paymentDate: new Date().toISOString().split('T')[0],
      transactionId: '',
      notes: ''
    }
  });

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(ownerUser.upiId || 'rajeshsharma@oksbi');
    setCopiedUpi(true);
    toast.success('Owner UPI ID copied!');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const onSubmit = (formData) => {
    try {
      submitPayment({
        rentId: rentItem ? rentItem.id : 'rent_current',
        ownerId: tenant?.ownerId || 'owner_001',
        amount: parseInt(formData.amount, 10),
        month: formData.month,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
        paymentDate: formData.paymentDate,
        screenshot: screenshotPreview,
        notes: formData.notes
      });
      toast.success('Payment submitted! Awaiting owner verification.');
      reset();
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      toast.error('Failed to submit payment. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Rent Payment"
      description="Pay the owner directly and submit your transaction details for instant verification."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* UPI Details Box */}
        <div className="p-4 bg-[#F8F5FE] rounded-2xl border border-purple-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#6C4AB6]" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Owner's Payment UPI ID
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="text-xs font-semibold text-[#6C4AB6] hover:text-[#4B2E83] flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs cursor-pointer"
            >
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedUpi ? 'Copied' : 'Copy UPI'}
            </button>
          </div>

          <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-purple-100">
            <span className="font-mono text-sm font-bold text-gray-800">
              {ownerUser.upiId || 'rajeshsharma@oksbi'}
            </span>
            <span className="text-[11px] text-gray-400">GPay / PhonePe / Paytm</span>
          </div>

          <p className="text-[11px] text-purple-700 leading-tight">
            Transfer {formatCurrency(defaultAmount)} directly to the above UPI ID, then enter the UTR / Transaction ID below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Month"
            placeholder="October"
            required
            error={errors.month?.message}
            {...register('month', { required: 'Month is required' })}
          />

          <Input
            label="Amount Paid (₹)"
            type="number"
            required
            error={errors.amount?.message}
            {...register('amount', { required: 'Amount is required' })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Payment Method"
            required
            options={[
              { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
              { value: 'Bank Transfer', label: 'Bank Transfer (IMPS / NEFT)' },
              { value: 'Cash', label: 'Cash (Handed in Person)' },
              { value: 'Other', label: 'Other' }
            ]}
            {...register('paymentMethod')}
          />

          <Input
            label="Payment Date"
            type="date"
            required
            {...register('paymentDate', { required: 'Payment date required' })}
          />
        </div>

        <Input
          label="Transaction ID / UTR Number"
          placeholder="e.g. UPI/20261005/789012 or UTR12345678"
          required
          helperText="12-digit UPI reference ID or Bank UTR"
          error={errors.transactionId?.message}
          {...register('transactionId', { required: 'Transaction ID is required' })}
        />

        {/* Payment Screenshot */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Payment Screenshot Proof
          </label>
          <div className="border border-dashed border-gray-300 rounded-xl p-3 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={screenshotPreview}
                alt="Proof"
                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
              />
              <div>
                <span className="text-xs font-semibold text-gray-800 block">Screenshot_Payment.jpg</span>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Ready for verification
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast.info('Default mock receipt is selected for seamless verification testing.')}
              className="text-xs font-medium text-[#6C4AB6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Sample Proof
            </button>
          </div>
        </div>

        <Textarea
          label="Notes (Optional)"
          placeholder="Any message for the owner regarding this payment..."
          rows={2}
          {...register('notes')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" icon={ArrowRight} iconPosition="right" loading={isSubmitting}>
            Submit Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
