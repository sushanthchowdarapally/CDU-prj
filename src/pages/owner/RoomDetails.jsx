import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { Card, Badge, StatCard, EmptyState } from '../../components/common/CardsAndBadges';
import { Button } from '../../components/common/FormComponents';
import { AddTenantModal } from '../../components/owner/AddTenantModal';
import { SuccessTenantModal } from '../../components/owner/SuccessTenantModal';
import {
  DoorClosed,
  Building,
  Users,
  Bed as BedIcon,
  ArrowLeft,
  Plus,
  Wrench,
  CheckCircle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms, properties, beds, tenants, setBedStatus } = useApp();

  const [showAddTenant, setShowAddTenant] = useState(false);
  const [createdTenantData, setCreatedTenantData] = useState(null);

  const room = rooms.find((r) => r.id === id);

  if (!room) {
    return (
      <div className="py-12 text-center">
        <EmptyState
          icon={DoorClosed}
          title="Room Not Found"
          description="The room requested does not exist."
          actionText="Back to Rooms"
          onAction={() => navigate('/owner/rooms')}
        />
      </div>
    );
  }

  const property = properties.find((p) => p.id === room.propertyId);
  const roomBeds = beds.filter((b) => b.roomId === room.id);
  const roomTenants = tenants.filter((t) => t.roomId === room.id && t.status === 'ACTIVE');
  const occupiedBeds = roomBeds.filter((b) => b.status === 'OCCUPIED').length;
  const availableBeds = roomBeds.filter((b) => b.status === 'AVAILABLE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/owner/rooms')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#6C4AB6] mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Rooms
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Room {room.roomNumber}
              </h1>
              <Badge status={occupiedBeds === room.capacity ? 'OCCUPIED' : 'AVAILABLE'}>
                {room.type}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 mt-1">
              <Building className="w-4 h-4 text-gray-400" />
              {property?.name} • Floor {room.floor}
            </p>
          </div>

          {availableBeds > 0 && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowAddTenant(true)}
            >
              Assign Tenant
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Capacity"
          value={`${room.capacity} Beds`}
          subtext={`${occupiedBeds} Currently Occupied`}
          icon={BedIcon}
        />
        <StatCard
          title="Available Beds"
          value={availableBeds}
          subtext="Ready for new tenants"
          icon={CheckCircle}
        />
        <StatCard
          title="Monthly Rent"
          value={formatCurrency(room.monthlyRent)}
          subtext="Per Bed / Month"
          icon={DoorClosed}
        />
        <StatCard
          title="Security Deposit"
          value={formatCurrency(room.securityDeposit)}
          subtext="Refundable on move out"
          icon={Users}
        />
      </div>

      {/* Beds Breakdown Card */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Bed Allocations</h3>
            <p className="text-xs text-gray-400">Manage individual bed statuses and occupancy</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomBeds.map((bed) => {
            const tenant = tenants.find((t) => t.id === bed.tenantId);

            return (
              <div
                key={bed.id}
                className={`p-4 rounded-2xl border transition-all ${
                  bed.status === 'OCCUPIED'
                    ? 'bg-purple-50/40 border-purple-200'
                    : bed.status === 'MAINTENANCE'
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#6C4AB6]">
                      <BedIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{bed.bedNumber}</h4>
                      <Badge status={bed.status} size="xs" />
                    </div>
                  </div>
                </div>

                {tenant ? (
                  <div className="mt-4 pt-3 border-t border-purple-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Occupied by</span>
                    <span className="text-sm font-bold text-gray-900 block">{tenant.name}</span>
                    <span className="text-xs text-gray-500 block">{tenant.phone}</span>
                    <div className="pt-2">
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={Eye}
                        onClick={() => navigate(`/owner/tenants/${tenant.id}`)}
                      >
                        Tenant Profile
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {bed.status === 'AVAILABLE' ? 'Ready for assignment' : 'Under maintenance'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = bed.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
                        setBedStatus(bed.id, next);
                        toast.success(`${bed.bedNumber} status updated to ${next}`);
                      }}
                      className="text-xs font-semibold text-[#6C4AB6] hover:underline cursor-pointer"
                    >
                      {bed.status === 'AVAILABLE' ? 'Set Maintenance' : 'Set Available'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tenants in Room */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-gray-900">Current Residents in this Room</h3>
        {roomTenants.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Room is currently vacant"
            description="Assign a tenant to this room to occupy one of the available beds."
            actionText="+ Assign Tenant"
            onAction={() => setShowAddTenant(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7FC] text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Resident</th>
                  <th className="py-3 px-4">Assigned Bed</th>
                  <th className="py-3 px-4">Rent</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roomTenants.map((t) => {
                  const b = beds.find((bed) => bed.id === t.bedId);
                  return (
                    <tr key={t.id} className="hover:bg-purple-50/20">
                      <td className="py-3 px-4 font-bold text-gray-900">{t.name}</td>
                      <td className="py-3 px-4 font-semibold text-[#6C4AB6]">{b?.bedNumber || 'Bed'}</td>
                      <td className="py-3 px-4 font-bold text-gray-800">{formatCurrency(t.monthlyRent)}</td>
                      <td className="py-3 px-4 text-gray-600">{t.dueDate}th of month</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={Eye}
                          onClick={() => navigate(`/owner/tenants/${t.id}`)}
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
      <AddTenantModal
        isOpen={showAddTenant}
        onClose={() => setShowAddTenant(false)}
        preselectedPropertyId={room.propertyId}
        preselectedRoomId={room.id}
        onSuccess={(created) => setCreatedTenantData(created)}
      />

      <SuccessTenantModal
        isOpen={!!createdTenantData}
        onClose={() => setCreatedTenantData(null)}
        data={createdTenantData}
      />
    </div>
  );
};
