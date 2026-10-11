import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Card, Badge, EmptyState } from '../../components/common/CardsAndBadges';
import { Button, Input, Select } from '../../components/common/FormComponents';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { AddTenantModal } from '../../components/owner/AddTenantModal';
import { SuccessTenantModal } from '../../components/owner/SuccessTenantModal';
import {
  Users,
  Plus,
  Search,
  Building,
  DoorClosed,
  Eye,
  Trash2,
  LogOut,
  ArrowRightLeft,
  Mail,
  Phone,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

export const Tenants = () => {
  const navigate = useNavigate();
  const {
    tenants,
    properties,
    rooms,
    beds,
    deleteTenant,
    vacateTenant,
    moveTenantBed,
    sendRentReminder
  } = useApp();

  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [vacateTargetId, setVacateTargetId] = useState(null);
  const [moveTenantObj, setMoveTenantObj] = useState(null);
  const [targetMoveRoom, setTargetMoveRoom] = useState('');
  const [targetMoveBed, setTargetMoveBed] = useState('');
  const [createdTenantData, setCreatedTenantData] = useState(null);

  // Filtered tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.phone.toLowerCase().includes(search.toLowerCase()) ||
        (t.email && t.email.toLowerCase().includes(search.toLowerCase()));

      const matchProperty = propertyFilter === 'ALL' || t.propertyId === propertyFilter;
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchSearch && matchProperty && matchStatus;
    });
  }, [tenants, search, propertyFilter, statusFilter]);

  const handleDelete = () => {
    if (deleteTargetId) {
      deleteTenant(deleteTargetId);
      toast.success('Tenant record deleted.');
      setDeleteTargetId(null);
    }
  };

  const handleVacate = () => {
    if (vacateTargetId) {
      vacateTenant(vacateTargetId);
      toast.success('Tenant marked as vacated and bed released.');
      setVacateTargetId(null);
    }
  };

  const handleMoveConfirm = () => {
    if (!targetMoveBed) {
      toast.error('Please select an available target bed');
      return;
    }
    moveTenantBed(moveTenantObj.id, targetMoveRoom, targetMoveBed);
    toast.success(`${moveTenantObj.name} transferred to new room & bed!`);
    setMoveTenantObj(null);
    setTargetMoveRoom('');
    setTargetMoveBed('');
  };

  // Available beds for move modal
  const movePropertyRooms = moveTenantObj ? rooms.filter(r => r.propertyId === moveTenantObj.propertyId) : [];
  const moveRoomBeds = targetMoveRoom ? beds.filter(b => b.roomId === targetMoveRoom && b.status === 'AVAILABLE') : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Tenant Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Resident profiles, room assignments, leases, and rent due dates
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowAddModal(true)}
        >
          Add Tenant
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by name, phone, or email..."
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'ACTIVE', label: 'Active Residents' },
            { value: 'VACATED', label: 'Vacated' }
          ]}
        />
      </div>

      {/* Table */}
      {filteredTenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tenants found"
          description="Try changing filters or add a new tenant to an available bed."
          actionText="+ Add Tenant"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7FC] text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">Resident</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Property & Room</th>
                <th className="py-3.5 px-4">Bed</th>
                <th className="py-3.5 px-4">Rent</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTenants.map((tenant) => {
                const property = properties.find((p) => p.id === tenant.propertyId);
                const room = rooms.find((r) => r.id === tenant.roomId);
                const bed = beds.find((b) => b.id === tenant.bedId);

                return (
                  <tr key={tenant.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#F3EEFF] text-[#6C4AB6] flex items-center justify-center font-bold text-xs shrink-0">
                          {tenant.name.charAt(0)}
                        </div>
                        <span>{tenant.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      <div>{tenant.phone}</div>
                      <div className="text-[11px] text-gray-400">{tenant.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">{property?.name || 'Property'}</div>
                      <div className="text-[11px] text-gray-500">Room {room?.roomNumber || 'N/A'}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#6C4AB6]">
                      {bed?.bedNumber || 'Assigned'}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {formatCurrency(tenant.monthlyRent)}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 font-medium">
                      {tenant.dueDate}th of month
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={tenant.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={Eye}
                          onClick={() => navigate(`/owner/tenants/${tenant.id}`)}
                        >
                          View
                        </Button>

                        {tenant.status === 'ACTIVE' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setMoveTenantObj(tenant);
                                setTargetMoveRoom(tenant.roomId);
                              }}
                              className="p-1.5 text-gray-400 hover:text-[#6C4AB6] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                              title="Move / Transfer Bed"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setVacateTargetId(tenant.id)}
                              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Vacate Resident"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(tenant.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Add Tenant Modal */}
      <AddTenantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(created) => setCreatedTenantData(created)}
      />

      {/* Success Modal */}
      <SuccessTenantModal
        isOpen={!!createdTenantData}
        onClose={() => setCreatedTenantData(null)}
        data={createdTenantData}
      />

      {/* Move Bed Modal */}
      {moveTenantObj && (
        <Modal
          isOpen={!!moveTenantObj}
          onClose={() => setMoveTenantObj(null)}
          title={`Move ${moveTenantObj.name} to another Bed`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 pt-2">
            <Select
              label="Select Room"
              value={targetMoveRoom}
              onChange={(e) => {
                setTargetMoveRoom(e.target.value);
                setTargetMoveBed('');
              }}
              options={movePropertyRooms.map(r => ({
                value: r.id,
                label: `Room ${r.roomNumber} (${r.type} - Floor ${r.floor})`
              }))}
            />

            <Select
              label="Select Available Bed"
              value={targetMoveBed}
              onChange={(e) => setTargetMoveBed(e.target.value)}
              placeholder={moveRoomBeds.length === 0 ? 'No beds available in this room' : 'Select available bed'}
              options={moveRoomBeds.map(b => ({
                value: b.id,
                label: b.bedNumber
              }))}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={() => setMoveTenantObj(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleMoveConfirm} disabled={!targetMoveBed}>
                Confirm Transfer
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Vacate Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!vacateTargetId}
        onClose={() => setVacateTargetId(null)}
        onConfirm={handleVacate}
        title="Vacate Resident"
        message="Are you sure you want to mark this resident as vacated? Their bed will immediately become AVAILABLE for new tenants."
        confirmText="Confirm Vacate"
        confirmVariant="primary"
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Tenant Record"
        message="Are you sure you want to completely delete this tenant profile?"
      />
    </div>
  );
};
