import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { Card, Badge, EmptyState } from '../../components/common/CardsAndBadges';
import { Button, Input, Select } from '../../components/common/FormComponents';
import { ConfirmDialog } from '../../components/common/Modal';
import { AddPropertyModal } from '../../components/owner/AddPropertyAndRoomModals';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  DoorClosed,
  Users,
  Eye,
  Trash2,
  Edit,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export const Properties = () => {
  const navigate = useNavigate();
  const { properties, rooms, beds, tenants, deleteProperty } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'ALL' || p.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [properties, search, typeFilter]);

  const handleDelete = () => {
    if (deleteTargetId) {
      deleteProperty(deleteTargetId);
      toast.success('Property and its associated rooms removed.');
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Properties & Buildings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your PGs, hostels, and rental apartments across locations
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowAddModal(true)}
        >
          Add Property
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search properties by name, locality, or city..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Property Types' },
              { value: 'PG', label: 'PG (Paying Guest)' },
              { value: 'Apartment', label: 'Apartment' },
              { value: 'Hostel', label: 'Hostel' },
              { value: 'Independent House', label: 'Independent House' },
              { value: 'Co-Living', label: 'Co-Living' }
            ]}
          />
        </div>
      </div>

      {/* Grid of Properties */}
      {filteredProperties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties found"
          description="Try changing your search term or add a new property to get started."
          actionText="+ Add First Property"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const propertyRooms = rooms.filter((r) => r.propertyId === property.id);
            const propertyRoomIds = propertyRooms.map((r) => r.id);
            const propertyBeds = beds.filter((b) => propertyRoomIds.includes(b.roomId));
            const occupiedBeds = propertyBeds.filter((b) => b.status === 'OCCUPIED').length;
            const propertyTenants = tenants.filter((t) => t.propertyId === property.id && t.status === 'ACTIVE');
            const occupancy = propertyBeds.length > 0 ? Math.round((occupiedBeds / propertyBeds.length) * 100) : 0;

            return (
              <Card key={property.id} className="flex flex-col justify-between hover:border-purple-300">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#6C4AB6] uppercase tracking-wider block">
                        {property.type}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-0.5">{property.name}</h3>
                    </div>
                    <Badge status="ACTIVE">{property.floors} Floors</Badge>
                  </div>

                  <p className="text-xs text-gray-500 flex items-start gap-1.5 line-clamp-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>{property.address}, {property.city}</span>
                  </p>

                  {property.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      {property.description}
                    </p>
                  )}

                  {/* Metrics bar */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100 text-center">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">Rooms</span>
                      <span className="text-sm font-bold text-gray-800">{propertyRooms.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">Beds</span>
                      <span className="text-sm font-bold text-gray-800">{propertyBeds.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">Tenants</span>
                      <span className="text-sm font-bold text-[#6C4AB6]">{propertyTenants.length}</span>
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-500">Occupancy</span>
                      <span className="text-[#6C4AB6]">{occupancy}% ({occupiedBeds}/{propertyBeds.length} beds)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#6C4AB6] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(property.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Property"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      onClick={() => navigate(`/owner/properties/${property.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Property"
        message="Are you sure you want to delete this property? All associated rooms, beds, and records will also be removed."
      />
    </div>
  );
};
