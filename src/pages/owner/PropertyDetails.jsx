import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Card, Badge, StatCard, EmptyState } from '../../components/common/CardsAndBadges';
import { Button } from '../../components/common/FormComponents';
import { AddRoomModal } from '../../components/owner/AddPropertyAndRoomModals';
import { AddTenantModal } from '../../components/owner/AddTenantModal';
import { SuccessTenantModal } from '../../components/owner/SuccessTenantModal';
import {
  Building2,
  DoorClosed,
  Users,
  MapPin,
  ArrowLeft,
  Plus,
  CreditCard,
  AlertTriangle,
  Receipt,
  CheckCircle,
  Eye
} from 'lucide-react';

export const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, rooms, beds, tenants, rents, problems } = useApp();

  const [activeTab, setActiveTab] = useState('Overview');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [createdTenantData, setCreatedTenantData] = useState(null);

  const property = properties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="py-12 text-center">
        <EmptyState
          icon={Building2}
          title="Property Not Found"
          description="The requested property does not exist or has been removed."
          actionText="Back to Properties"
          onAction={() => navigate('/owner/properties')}
        />
      </div>
    );
  }

  // Related data
  const propertyRooms = rooms.filter((r) => r.propertyId === property.id);
  const propertyRoomIds = propertyRooms.map((r) => r.id);
  const propertyBeds = beds.filter((b) => propertyRoomIds.includes(b.roomId));
  const occupiedBeds = propertyBeds.filter((b) => b.status === 'OCCUPIED').length;
  const propertyTenants = tenants.filter((t) => t.propertyId === property.id && t.status === 'ACTIVE');
  const tenantIds = propertyTenants.map((t) => t.id);

  const propertyRents = rents.filter((r) => tenantIds.includes(r.tenantId));
  const propertyProblems = problems.filter((prob) => prob.propertyId === property.id);

  const collectedRent = propertyRents
    .filter((r) => r.status === 'PAID')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingRent = propertyRents
    .filter((r) => r.status !== 'PAID')
    .reduce((sum, r) => sum + r.amount, 0);

  const occupancy = propertyBeds.length > 0 ? Math.round((occupiedBeds / propertyBeds.length) * 100) : 0;

  const tabs = ['Overview', 'Rooms', 'Tenants', 'Rent', 'Problems'];

  return (
    <div className="space-y-6">
      {/* Back button and Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/owner/properties')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#6C4AB6] mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {property.name}
              </h1>
              <Badge status="PRIMARY">{property.type}</Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              {property.address}, {property.city}, {property.state} - {property.pincode}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={DoorClosed}
              onClick={() => setShowAddRoom(true)}
            >
              Add Room
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowAddTenant(true)}
            >
              Add Tenant
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rooms"
          value={propertyRooms.length}
          subtext={`${property.floors} Floors`}
          icon={DoorClosed}
        />
        <StatCard
          title="Total Tenants"
          value={propertyTenants.length}
          subtext={`${occupiedBeds}/${propertyBeds.length} Beds Occupied`}
          icon={Users}
        />
        <StatCard
          title="Occupancy"
          value={`${occupancy}%`}
          subtext={`${propertyBeds.length - occupiedBeds} Beds Vacant`}
          icon={CheckCircle}
        />
        <StatCard
          title="Rent Collected"
          value={formatCurrency(collectedRent)}
          subtext={`Pending: ${formatCurrency(pendingRent)}`}
          icon={CreditCard}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab
                  ? 'border-[#6C4AB6] text-[#6C4AB6]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
              {tab === 'Rooms' && ` (${propertyRooms.length})`}
              {tab === 'Tenants' && ` (${propertyTenants.length})`}
              {tab === 'Problems' && ` (${propertyProblems.length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-gray-900">About this Property</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {property.description || 'No description provided for this property.'}
            </p>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Building Specifications
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block font-medium">Floors</span>
                  <span className="font-bold text-gray-800 text-sm">{property.floors} Floors</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block font-medium">Property Category</span>
                  <span className="font-bold text-gray-800 text-sm">{property.type}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-400 block font-medium">Total Capacity</span>
                  <span className="font-bold text-gray-800 text-sm">{propertyBeds.length} Beds</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-base font-bold text-gray-900">Financial Summary</h3>
            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Collected This Period
              </span>
              <h4 className="text-2xl font-black text-emerald-900 mt-1">
                {formatCurrency(collectedRent)}
              </h4>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-xl">
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
                Pending / Overdue
              </span>
              <h4 className="text-2xl font-black text-rose-900 mt-1">
                {formatCurrency(pendingRent)}
              </h4>
            </div>

            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => setActiveTab('Rent')}
            >
              View Rent Breakdown
            </Button>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: Rooms */}
      {activeTab === 'Rooms' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-900">Rooms in {property.name}</h3>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowAddRoom(true)}
            >
              Add Room
            </Button>
          </div>

          {propertyRooms.length === 0 ? (
            <EmptyState
              icon={DoorClosed}
              title="No rooms added yet"
              description="Add the first room and beds will be created automatically based on capacity."
              actionText="+ Add Room"
              onAction={() => setShowAddRoom(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {propertyRooms.map((room) => {
                const roomBedsList = beds.filter((b) => b.roomId === room.id);
                const roomOccupied = roomBedsList.filter((b) => b.status === 'OCCUPIED').length;

                return (
                  <Card key={room.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-gray-900">Room {room.roomNumber}</h4>
                        <span className="text-xs text-gray-500">Floor {room.floor} • {room.type}</span>
                      </div>
                      <Badge status={roomOccupied === room.capacity ? 'OCCUPIED' : 'AVAILABLE'}>
                        {roomOccupied}/{room.capacity} Beds
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-600">
                      <span className="font-semibold text-[#4B2E83] text-sm">
                        {formatCurrency(room.monthlyRent)}
                      </span>
                      <span className="text-gray-400"> / bed / mo</span>
                    </div>

                    {/* Beds visual chips */}
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        Beds Status
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {roomBedsList.map((bed) => (
                          <span
                            key={bed.id}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              bed.status === 'OCCUPIED'
                                ? 'bg-purple-100 text-[#6C4AB6]'
                                : bed.status === 'MAINTENANCE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {bed.bedNumber} ({bed.status})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={Eye}
                        onClick={() => navigate(`/owner/rooms/${room.id}`)}
                      >
                        Room Details
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Tenants */}
      {activeTab === 'Tenants' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-900">Active Tenants ({propertyTenants.length})</h3>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowAddTenant(true)}
            >
              Add Tenant
            </Button>
          </div>

          {propertyTenants.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No tenants assigned to this property"
              description="Add a tenant to assign them to an available room and bed."
              actionText="+ Add Tenant"
              onAction={() => setShowAddTenant(true)}
            />
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F7FC] text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Room & Bed</th>
                    <th className="py-3 px-4">Monthly Rent</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {propertyTenants.map((t) => {
                    const room = rooms.find((r) => r.id === t.roomId);
                    const bed = beds.find((b) => b.id === t.bedId);
                    return (
                      <tr key={t.id} className="hover:bg-purple-50/20">
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          {t.name}
                          <span className="block text-[11px] font-normal text-gray-400">{t.phone}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-gray-800">Room {room?.roomNumber}</span>
                          <span className="block text-[11px] text-[#6C4AB6]">{bed?.bedNumber}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#4B2E83] text-sm">
                          {formatCurrency(t.monthlyRent)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-600">
                          {t.dueDate}th of month
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={t.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
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
            </Card>
          )}
        </div>
      )}

      {/* TAB CONTENT: Rent */}
      {activeTab === 'Rent' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-900">Rent Records for {property.name}</h3>
          {propertyRents.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No rent history for this property"
              description="Rent records will appear here as tenants are assigned."
            />
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F7FC] text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Tenant</th>
                    <th className="py-3 px-4">Month & Year</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {propertyRents.map((rent) => {
                    const tenant = propertyTenants.find((t) => t.id === rent.tenantId);
                    return (
                      <tr key={rent.id} className="hover:bg-purple-50/20">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{tenant?.name || 'Tenant'}</td>
                        <td className="py-3.5 px-4 font-medium text-gray-700">{rent.month} {rent.year}</td>
                        <td className="py-3.5 px-4 font-bold text-[#4B2E83]">{formatCurrency(rent.amount)}</td>
                        <td className="py-3.5 px-4 text-gray-600">{formatDate(rent.dueDate)}</td>
                        <td className="py-3.5 px-4"><Badge status={rent.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {/* TAB CONTENT: Problems */}
      {activeTab === 'Problems' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-900">Maintenance Requests ({propertyProblems.length})</h3>
          {propertyProblems.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No complaints reported"
              description="There are currently no maintenance issues reported for this property."
            />
          ) : (
            <div className="space-y-3">
              {propertyProblems.map((prob) => {
                const tenant = propertyTenants.find((t) => t.id === prob.tenantId);
                const room = propertyRooms.find((r) => r.id === prob.roomId);
                return (
                  <Card key={prob.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#6C4AB6] uppercase">{prob.category}</span>
                        <span className="text-gray-300">•</span>
                        <h4 className="text-sm font-bold text-gray-900">{prob.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Reported by {tenant?.name || 'Tenant'} in Room {room?.roomNumber || 'N/A'} on {formatDate(prob.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge status={prob.status} />
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={Eye}
                        onClick={() => navigate(`/owner/problems/${prob.id}`)}
                      >
                        Inspect
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddRoomModal
        isOpen={showAddRoom}
        onClose={() => setShowAddRoom(false)}
        preselectedPropertyId={property.id}
      />

      <AddTenantModal
        isOpen={showAddTenant}
        onClose={() => setShowAddTenant(false)}
        preselectedPropertyId={property.id}
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
