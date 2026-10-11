import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { StatCard, Card, Badge, EmptyState } from '../../components/common/CardsAndBadges';
import { Button } from '../../components/common/FormComponents';
import { AddPropertyModal, AddRoomModal } from '../../components/owner/AddPropertyAndRoomModals';
import { AddTenantModal } from '../../components/owner/AddTenantModal';
import { SuccessTenantModal } from '../../components/owner/SuccessTenantModal';
import { AnnouncementModal } from '../../components/owner/AnnouncementModal';
import {
  Building2,
  DoorClosed,
  Users,
  Percent,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Receipt,
  Megaphone,
  Eye
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    properties,
    rooms,
    beds,
    tenants,
    rents,
    payments,
    problems
  } = useApp();

  // Modals state
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [createdTenantData, setCreatedTenantData] = useState(null);

  // Compute live metrics
  const activeTenants = tenants.filter(t => t.status === 'ACTIVE');
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
  const vacantBeds = beds.filter(b => b.status === 'AVAILABLE').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Financial calculations for current month (October 2026)
  const currentMonthRents = rents.filter(r => r.month === 'October' && r.year === 2026);
  const collectedRent = currentMonthRents
    .filter(r => r.status === 'PAID')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingRent = currentMonthRents
    .filter(r => r.status !== 'PAID')
    .reduce((sum, r) => sum + r.amount, 0);

  const openProblems = problems.filter(p => p.status === 'OPEN' || p.status === 'IN_PROGRESS');
  const pendingPaymentsCount = payments.filter(p => p.status === 'PENDING_VERIFICATION').length;

  // Chart data: Monthly Revenue
  const revenueChartData = useMemo(() => {
    return [
      { month: 'Jun', collected: 145000, pending: 15000 },
      { month: 'Jul', collected: 168000, pending: 22000 },
      { month: 'Aug', collected: 175000, pending: 18000 },
      { month: 'Sep', collected: 182000, pending: 12000 },
      { month: 'Oct', collected: collectedRent || 33000, pending: pendingRent || 18000 }
    ];
  }, [collectedRent, pendingRent]);

  // Chart data: Occupancy
  const occupancyChartData = useMemo(() => [
    { name: 'Occupied Beds', value: occupiedBeds || 3, color: '#6C4AB6' },
    { name: 'Vacant Beds', value: vacantBeds || 1, color: '#E4D8FC' },
    { name: 'Maintenance', value: beds.filter(b => b.status === 'MAINTENANCE').length || 0, color: '#F59E0B' }
  ], [occupiedBeds, vacantBeds, beds]);

  // Chart data: Rent Status Breakdown
  const rentStatusData = useMemo(() => {
    const paidCount = rents.filter(r => r.status === 'PAID').length;
    const dueSoonCount = rents.filter(r => r.status === 'DUE_SOON').length;
    const overdueCount = rents.filter(r => r.status === 'OVERDUE').length;
    return [
      { name: 'Paid', count: paidCount, fill: '#10B981' },
      { name: 'Due Soon', count: dueSoonCount, fill: '#6366F1' },
      { name: 'Overdue', count: overdueCount, fill: '#EF4444' }
    ];
  }, [rents]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time status across properties, tenant occupancies, and collections
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            icon={Megaphone}
            size="sm"
            onClick={() => setShowAnnouncement(true)}
          >
            Notice
          </Button>

          <Button
            variant="secondary"
            icon={Building2}
            size="sm"
            onClick={() => setShowAddProperty(true)}
          >
            + Property
          </Button>

          <Button
            variant="secondary"
            icon={DoorClosed}
            size="sm"
            onClick={() => setShowAddRoom(true)}
          >
            + Room
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            size="sm"
            onClick={() => setShowAddTenant(true)}
          >
            Add Tenant
          </Button>
        </div>
      </div>

      {/* Verification Alert Banner if pending payments exist */}
      {pendingPaymentsCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {pendingPaymentsCount} Payment Submission{pendingPaymentsCount > 1 ? 's' : ''} Awaiting Approval
              </h4>
              <p className="text-xs text-amber-700">
                Tenants have submitted payment screenshots. Review and approve them.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="dark"
            onClick={() => navigate('/owner/payments')}
            icon={ArrowRight}
            iconPosition="right"
          >
            Verify Now
          </Button>
        </div>
      )}

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Properties"
          value={properties.length}
          subtext={`${rooms.length} Total Rooms`}
          icon={Building2}
          onClick={() => navigate('/owner/properties')}
          className="cursor-pointer hover:border-purple-200"
        />

        <StatCard
          title="Active Tenants"
          value={activeTenants.length}
          subtext={`${occupiedBeds} Beds Occupied`}
          icon={Users}
          onClick={() => navigate('/owner/tenants')}
          className="cursor-pointer hover:border-purple-200"
        />

        <StatCard
          title="PG Occupancy"
          value={`${occupancyRate}%`}
          subtext={`${vacantBeds} Beds Available`}
          icon={Percent}
          trend={`${occupancyRate >= 75 ? 'Optimal' : 'Needs Tenants'}`}
        />

        <StatCard
          title="Open Complaints"
          value={openProblems.length}
          subtext={openProblems.length === 0 ? 'All resolved' : 'Require attention'}
          icon={AlertTriangle}
          onClick={() => navigate('/owner/problems')}
          className="cursor-pointer hover:border-purple-200"
        />
      </div>

      {/* Financial Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50/50 via-white to-white border-emerald-100">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
                Rent Collected (Oct 2026)
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                {formatCurrency(collectedRent)}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Verified payments received
              </p>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50/40 via-white to-white border-rose-100">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block">
                Rent Pending (Oct 2026)
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                {formatCurrency(pendingRent)}
              </h3>
              <p className="text-xs text-rose-600 font-medium mt-1">
                From due or overdue resident rents
              </p>
            </div>
            <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Monthly Rent Revenue</h3>
              <p className="text-xs text-gray-400">Collected vs Pending Collection</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6C4AB6]" /> Collected
              </span>
              <span className="flex items-center gap-1.5 font-medium text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E4D8FC]" /> Pending
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), '']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                />
                <Bar dataKey="collected" fill="#6C4AB6" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="pending" fill="#E4D8FC" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Occupancy Donut Chart */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Bed Occupancy</h3>
              <p className="text-xs text-gray-400">{totalBeds} total beds capacity</p>
            </div>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {occupancyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Beds`, name]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
            {occupancyChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-gray-900">{item.value} Beds</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Upcoming & Due Rent Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Upcoming & Pending Rents</h3>
            <p className="text-xs text-gray-400">Tenants with rent due soon or pending payment</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/owner/rent')}
            icon={ArrowRight}
            iconPosition="right"
          >
            All Rents
          </Button>
        </div>

        {rents.length === 0 ? (
          <EmptyState
            title="No rent records found"
            description="Add tenants to begin generating and tracking monthly rents."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7FC] text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Tenant</th>
                  <th className="py-3 px-4">Room & Property</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rents.slice(0, 6).map((rent) => {
                  const tenant = tenants.find(t => t.id === rent.tenantId);
                  const room = rooms.find(r => r.id === tenant?.roomId);
                  const property = properties.find(p => p.id === tenant?.propertyId);

                  return (
                    <tr key={rent.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {tenant?.name || 'Resident'}
                        <span className="block text-[11px] font-normal text-gray-400">{tenant?.phone}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800">Room {room?.roomNumber || 'N/A'}</span>
                        <span className="block text-[11px] text-gray-400">{property?.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#4B2E83] text-sm">
                        {formatCurrency(rent.amount)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-600">
                        {formatDate(rent.dueDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={rent.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={Eye}
                          onClick={() => {
                            if (tenant) {
                              navigate(`/owner/tenants/${tenant.id}`);
                            } else {
                              navigate('/owner/rent');
                            }
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modals */}
      <AddPropertyModal
        isOpen={showAddProperty}
        onClose={() => setShowAddProperty(false)}
      />

      <AddRoomModal
        isOpen={showAddRoom}
        onClose={() => setShowAddRoom(false)}
      />

      <AddTenantModal
        isOpen={showAddTenant}
        onClose={() => setShowAddTenant(false)}
        onSuccess={(created) => {
          setCreatedTenantData(created);
        }}
      />

      <SuccessTenantModal
        isOpen={!!createdTenantData}
        onClose={() => setCreatedTenantData(null)}
        data={createdTenantData}
      />

      <AnnouncementModal
        isOpen={showAnnouncement}
        onClose={() => setShowAnnouncement(false)}
      />
    </div>
  );
};
