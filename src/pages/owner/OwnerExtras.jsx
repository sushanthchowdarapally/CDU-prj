import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, formatTimeAgo } from '../../utils/helpers';
import { Card, Badge, StatCard, EmptyState } from '../../components/common/CardsAndBadges';
import { Button, Input, Select, Textarea } from '../../components/common/FormComponents';
import { AnnouncementModal } from '../../components/owner/AnnouncementModal';
import {
  Bell,
  CheckCheck,
  Megaphone,
  Plus,
  BarChart3,
  Download,
  Printer,
  Settings as SettingsIcon,
  CreditCard,
  Building,
  RotateCcw,
  Check,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';

// ================= NOTIFICATIONS =================
export const Notifications = () => {
  const { user } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD

  const userNotifs = notifications.filter(n => n.userId === user?.id || n.userId === 'owner_001');

  const filtered = userNotifs.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Notifications & Activity Alerts
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time updates on payments, resident complaints, and move-ins
          </p>
        </div>

        {userNotifs.some(n => !n.isRead) && (
          <Button
            variant="secondary"
            size="sm"
            icon={CheckCheck}
            onClick={() => {
              markAllNotificationsAsRead(user?.id || 'owner_001');
              toast.success('All notifications marked as read');
            }}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'ALL' ? 'bg-[#6C4AB6] text-white' : 'bg-white border text-gray-600'
          }`}
        >
          All ({userNotifs.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'UNREAD' ? 'bg-[#6C4AB6] text-white' : 'bg-white border text-gray-600'
          }`}
        >
          Unread ({userNotifs.filter(n => !n.isRead).length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are completely caught up with all resident activity."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(notif => (
            <Card
              key={notif.id}
              className={`p-4 flex items-start justify-between gap-3 transition-colors ${
                !notif.isRead ? 'bg-purple-50/40 border-purple-200' : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  !notif.isRead ? 'bg-[#6C4AB6] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#6C4AB6]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    {formatTimeAgo(notif.createdAt)}
                  </span>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  type="button"
                  onClick={() => markNotificationAsRead(notif.id)}
                  className="text-xs font-semibold text-[#6C4AB6] hover:underline shrink-0 cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ================= ANNOUNCEMENTS =================
export const Announcements = () => {
  const { announcements, properties, rooms, tenants } = useApp();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Resident Announcements
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Broadcast emergency alerts, maintenance schedules, and notices to residents
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowModal(true)}
        >
          New Announcement
        </Button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements sent yet"
          description="Send your first notice to keep residents informed about events and maintenance."
          actionText="+ Create Notice"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => {
            let targetLabel = 'All Tenants';
            if (ann.targetType === 'PROPERTY' && ann.targetId) {
              const p = properties.find(prop => prop.id === ann.targetId);
              targetLabel = `Property: ${p?.name || 'Selected'}`;
            } else if (ann.targetType === 'ROOM' && ann.targetId) {
              const r = rooms.find(rm => rm.id === ann.targetId);
              targetLabel = `Room ${r?.roomNumber || ''}`;
            } else if (ann.targetType === 'TENANT' && ann.targetId) {
              const t = tenants.find(ten => ten.id === ann.targetId);
              targetLabel = `Tenant: ${t?.name || ''}`;
            }

            return (
              <Card key={ann.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#F3EEFF] text-[#6C4AB6] rounded-xl">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">{ann.title}</h4>
                      <span className="text-[11px] text-gray-400 block">{formatDate(ann.createdAt)}</span>
                    </div>
                  </div>
                  <Badge status="PRIMARY" size="xs">{targetLabel}</Badge>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-line">
                  {ann.message}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      <AnnouncementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

// ================= REPORTS =================
export const Reports = () => {
  const { properties, rooms, beds, tenants, rents, payments } = useApp();

  const totalCollected = rents.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.amount, 0);
  const totalPending = rents.filter(r => r.status !== 'PAID').reduce((sum, r) => sum + r.amount, 0);
  const occupancy = beds.length > 0 ? Math.round((beds.filter(b => b.status === 'OCCUPIED').length / beds.length) * 100) : 0;

  const handleExportCSV = () => {
    const headers = ['Tenant Name', 'Month', 'Year', 'Amount', 'Due Date', 'Status'];
    const rows = rents.map(r => {
      const t = tenants.find(ten => ten.id === r.tenantId);
      return [
        `"${t?.name || 'Resident'}"`,
        r.month,
        r.year,
        r.amount,
        r.dueDate,
        r.status
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PG_Manager_Rent_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Rent report exported as CSV!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Financial & Occupancy Reports
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Export receipts, download rent registers, and inspect operational metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print Summary
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="All Time Collections"
          value={formatCurrency(totalCollected)}
          subtext="Verified receipts"
          icon={CreditCard}
        />
        <StatCard
          title="Current Receivables"
          value={formatCurrency(totalPending)}
          subtext="Pending / Overdue"
          icon={BarChart3}
        />
        <StatCard
          title="Portfolio Occupancy"
          value={`${occupancy}%`}
          subtext={`${beds.filter(b => b.status === 'OCCUPIED').length}/${beds.length} Total Beds`}
          icon={Building}
        />
        <StatCard
          title="Total Properties"
          value={properties.length}
          subtext={`${rooms.length} Units`}
          icon={Building}
        />
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Monthly Ledger Overview</h3>
          <span className="text-xs text-gray-500">Live aggregated transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7FC] text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rents.map((r) => {
                const t = tenants.find(ten => ten.id === r.tenantId);
                return (
                  <tr key={r.id}>
                    <td className="py-3 px-4 font-semibold text-gray-800">{r.month} {r.year}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{t?.name || 'Resident'}</td>
                    <td className="py-3 px-4 font-bold text-[#4B2E83]">{formatCurrency(r.amount)}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(r.dueDate)}</td>
                    <td className="py-3 px-4 text-right"><Badge status={r.status} size="xs" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ================= SETTINGS =================
export const Settings = () => {
  const { user } = useAuth();
  const { resetToDefaultData } = useApp();

  const [upiId, setUpiId] = useState(user?.upiId || 'rajeshsharma@oksbi');
  const [accountName, setAccountName] = useState('Rajesh Sharma');
  const [accountNumber, setAccountNumber] = useState('987654321098');
  const [ifsc, setIfsc] = useState('SBIN0001234');

  const handleSaveBank = (e) => {
    e.preventDefault();
    toast.success('Payment settlement bank details updated!');
  };

  const handleReset = () => {
    if (window.confirm('Reset all application data back to default demo state?')) {
      resetToDefaultData();
      toast.success('Data reset successfully!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Management Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Configure collection bank details, UPI QR settings, and system defaults
        </p>
      </div>

      {/* Payment Settlement Information */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="p-2.5 bg-[#F3EEFF] text-[#6C4AB6] rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Rent Collection & Bank Details</h3>
            <p className="text-xs text-gray-500">
              Tenants see these details in the Tenant App when submitting rent payment.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBank} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary UPI ID"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              helperText="e.g. yourname@okhdfcbank or yourname@oksbi"
            />

            <Input
              label="Account Beneficiary Name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />

            <Input
              label="Bank Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />

            <Input
              label="IFSC Code"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit">
              Save Payment Settings
            </Button>
          </div>
        </form>
      </Card>

      {/* Demo Reset Card */}
      <Card className="border-red-100 bg-red-50/20 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Demo Data Reset</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Reset all properties, tenants, rents, and complaints back to original test values.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={RotateCcw}
            onClick={handleReset}
          >
            Reset Demo Data
          </Button>
        </div>
      </Card>
    </div>
  );
};
