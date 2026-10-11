import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Card, Badge, StatCard, EmptyState } from '../../components/common/CardsAndBadges';
import { Button, Input, Select } from '../../components/common/FormComponents';
import {
  CreditCard,
  Search,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Filter,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export const RentManagement = () => {
  const navigate = useNavigate();
  const { rents, tenants, properties, rooms, sendRentReminder, updateRentStatus } = useApp();

  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('October');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredRents = useMemo(() => {
    return rents.filter((r) => {
      const tenant = tenants.find((t) => t.id === r.tenantId);
      const matchSearch = tenant?.name.toLowerCase().includes(search.toLowerCase());
      const matchMonth = monthFilter === 'ALL' || r.month === monthFilter;
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchMonth && matchStatus;
    });
  }, [rents, tenants, search, monthFilter, statusFilter]);

  // Statistics for selected month
  const monthRents = rents.filter(r => monthFilter === 'ALL' || r.month === monthFilter);
  const totalExpected = monthRents.reduce((sum, r) => sum + r.amount, 0);
  const totalCollected = monthRents.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.amount, 0);
  const totalPending = monthRents.filter(r => r.status !== 'PAID').reduce((sum, r) => sum + r.amount, 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const handleSendReminder = (tenantId, rentId, tenantName) => {
    sendRentReminder(tenantId, rentId);
    toast.success(`Rent reminder notification sent to ${tenantName}!`);
  };

  const handleManualMarkPaid = (rentId, tenantName) => {
    // Direct manual cash receipt confirmation
    toast.success(`Marked rent as PAID for ${tenantName}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Rent Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track monthly collections, overdue balances, and send instant tenant reminders
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Expected"
          value={formatCurrency(totalExpected)}
          subtext={`${monthRents.length} Invoices (${monthFilter})`}
          icon={CreditCard}
        />
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalCollected)}
          subtext={`${collectionRate}% Collection Rate`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Pending Rent"
          value={formatCurrency(totalPending)}
          subtext={`${monthRents.filter(r => r.status !== 'PAID').length} Outstanding`}
          icon={Clock}
        />
        <StatCard
          title="Overdue Notices"
          value={monthRents.filter(r => r.status === 'OVERDUE').length}
          subtext="Past due date"
          icon={AlertCircle}
        />
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by resident name..."
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Months' },
            { value: 'October', label: 'October 2026' },
            { value: 'September', label: 'September 2026' },
            { value: 'August', label: 'August 2026' }
          ]}
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'PAID', label: 'PAID' },
            { value: 'DUE_SOON', label: 'Due Soon' },
            { value: 'OVERDUE', label: 'Overdue' },
            { value: 'PENDING', label: 'Pending' }
          ]}
        />
      </div>

      {/* Table */}
      {filteredRents.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No rent records found"
          description="Adjust your search filters or generate monthly rent records."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7FC] text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">Resident</th>
                <th className="py-3.5 px-4">Property & Room</th>
                <th className="py-3.5 px-4">Billing Month</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRents.map((rent) => {
                const tenant = tenants.find((t) => t.id === rent.tenantId);
                const property = properties.find((p) => p.id === tenant?.propertyId);
                const room = rooms.find((r) => r.id === tenant?.roomId);

                return (
                  <tr key={rent.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <div>{tenant?.name || 'Resident'}</div>
                      <div className="text-[11px] font-normal text-gray-400">{tenant?.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">Room {room?.roomNumber || 'N/A'}</div>
                      <div className="text-[11px] text-gray-400">{property?.name}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {rent.month} {rent.year}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-[#4B2E83] text-sm">
                      {formatCurrency(rent.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 font-medium">
                      {formatDate(rent.dueDate)}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={rent.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rent.status !== 'PAID' && tenant && (
                          <Button
                            variant="secondary"
                            size="xs"
                            icon={Send}
                            onClick={() => handleSendReminder(tenant.id, rent.id, tenant.name)}
                          >
                            Remind
                          </Button>
                        )}

                        {tenant && (
                          <Button
                            variant="outline"
                            size="xs"
                            icon={Eye}
                            onClick={() => navigate(`/owner/tenants/${tenant.id}`)}
                          >
                            Details
                          </Button>
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
    </div>
  );
};
