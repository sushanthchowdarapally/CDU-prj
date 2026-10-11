import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { Card, Badge, EmptyState } from '../../components/common/CardsAndBadges';
import { Button, Input, Select } from '../../components/common/FormComponents';
import { ConfirmDialog } from '../../components/common/Modal';
import { AddRoomModal } from '../../components/owner/AddPropertyAndRoomModals';
import { AddTenantModal } from '../../components/owner/AddTenantModal';
import { SuccessTenantModal } from '../../components/owner/SuccessTenantModal';
import {
  DoorClosed,
  Plus,
  Search,
  Building,
  Users,
  Eye,
  Trash2,
  UserPlus,
  Bed as BedIcon
} from 'lucide-react';
import { toast } from 'sonner';

export const Rooms = () => {
  const navigate = useNavigate();
  const { properties, rooms, beds, tenants, deleteRoom, setBedStatus } = useApp();

  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [assignTenantRoom, setAssignTenantRoom] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [createdTenantData, setCreatedTenantData] = useState(null);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchSearch = r.roomNumber.toLowerCase().includes(search.toLowerCase());
      const matchProperty = propertyFilter === 'ALL' || r.propertyId === propertyFilter;
      const matchType = typeFilter === 'ALL' || r.type === typeFilter;
      return matchSearch && matchProperty && matchType;
    });
  }, [rooms, search, propertyFilter, typeFilter]);

  const handleDelete = () => {
    if (deleteTargetId) {
      deleteRoom(deleteTargetId);
      toast.success('Room removed successfully.');
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Room Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Configure room capacities, inspect auto-generated beds, and assign residents
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowAddRoom(true)}
        >
          Add Room
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by room number (e.g. A-101)..."
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Properties' },
            ...properties.map((p) => ({ value: p.id, label: p.name }))
          ]}
        />

        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Room Types' },
            { value: 'Single', label: 'Single' },
            { value: 'Double Sharing', label: 'Double Sharing' },
            { value: 'Triple Sharing', label: 'Triple Sharing' },
            { value: 'Four Sharing', label: 'Four Sharing' }
          ]}
        />
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <EmptyState
          icon={DoorClosed}
          title="No rooms match your filter"
          description="Create a room and beds will be generated automatically based on capacity."
          actionText="+ Add Room"
          onAction={() => setShowAddRoom(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const property = properties.find((p) => p.id === room.propertyId);
            const roomBeds = beds.filter((b) => b.roomId === room.id);
            const occupiedCount = roomBeds.filter((b) => b.status === 'OCCUPIED').length;
            const availableCount = roomBeds.filter((b) => b.status === 'AVAILABLE').length;

            return (
              <Card key={room.id} className="flex flex-col justify-between hover:border-purple-300">
                <div className="space-y-4">
                  {/* Top Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-gray-900">Room {room.roomNumber}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-purple-50 text-[#6C4AB6] font-bold">
                          Floor {room.floor}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        {property?.name || 'Property'}
                      </p>
                    </div>

                    <Badge status={occupiedCount === room.capacity ? 'OCCUPIED' : 'AVAILABLE'}>
                      {occupiedCount}/{room.capacity} Occupied
                    </Badge>
                  </div>

                  {/* Financials */}
                  <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[10px]">Monthly Rent</span>
                      <span className="font-extrabold text-gray-900 text-sm">{formatCurrency(room.monthlyRent)}</span>
                      <span className="text-gray-400"> / bed</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 block font-semibold uppercase text-[10px]">Deposit</span>
                      <span className="font-bold text-gray-700">{formatCurrency(room.securityDeposit)}</span>
                    </div>
                  </div>

                  {/* Bed Breakdown Visual */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Beds ({room.capacity} Total)
                      </span>
                      <span className="text-xs text-emerald-600 font-semibold">
                        {availableCount} Available
                      </span>
                    </div>

                    <div className="space-y-2">
                      {roomBeds.map((bed) => {
                        const bedTenant = tenants.find((t) => t.id === bed.tenantId);

                        return (
                          <div
                            key={bed.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                              bed.status === 'OCCUPIED'
                                ? 'bg-purple-50/50 border-purple-200'
                                : bed.status === 'MAINTENANCE'
                                ? 'bg-amber-50/50 border-amber-200'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <BedIcon className={`w-4 h-4 ${bed.status === 'OCCUPIED' ? 'text-[#6C4AB6]' : 'text-gray-400'}`} />
                              <div>
                                <span className="font-bold text-gray-800">{bed.bedNumber}</span>
                                {bedTenant && (
                                  <span className="block text-[11px] text-[#6C4AB6] font-medium">
                                    {bedTenant.name}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Badge status={bed.status} size="xs" />
                              {bed.status !== 'OCCUPIED' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setBedStatus(
                                      bed.id,
                                      bed.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE'
                                    )
                                  }
                                  className="text-[10px] text-gray-400 hover:text-gray-600 underline cursor-pointer ml-1"
                                >
                                  {bed.status === 'AVAILABLE' ? 'Mark Maint.' : 'Mark Avail.'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(room.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex gap-2">
                    {availableCount > 0 && (
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={UserPlus}
                        onClick={() => setAssignTenantRoom(room)}
                      >
                        Assign Tenant
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="xs"
                      icon={Eye}
                      onClick={() => navigate(`/owner/rooms/${room.id}`)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={showAddRoom}
        onClose={() => setShowAddRoom(false)}
      />

      {/* Add Tenant Modal (Preselecting this room) */}
      {assignTenantRoom && (
        <AddTenantModal
          isOpen={!!assignTenantRoom}
          onClose={() => setAssignTenantRoom(null)}
          preselectedPropertyId={assignTenantRoom.propertyId}
          preselectedRoomId={assignTenantRoom.id}
          onSuccess={(created) => setCreatedTenantData(created)}
        />
      )}

      <SuccessTenantModal
        isOpen={!!createdTenantData}
        onClose={() => setCreatedTenantData(null)}
        data={createdTenantData}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Room"
        message="Are you sure you want to delete this room and all associated beds?"
      />
    </div>
  );
};
