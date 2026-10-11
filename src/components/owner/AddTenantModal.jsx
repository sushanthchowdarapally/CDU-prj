import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';
import { Input, Select, Textarea, Button } from '../common/FormComponents';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

export const AddTenantModal = ({ isOpen, onClose, onSuccess, preselectedPropertyId, preselectedRoomId }) => {
  const { properties, rooms, beds, addTenant } = useApp();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      emergencyContact: '',
      address: '',
      propertyId: preselectedPropertyId || (properties[0]?.id || ''),
      roomId: preselectedRoomId || '',
      bedId: '',
      monthlyRent: 8000,
      securityDeposit: 16000,
      dueDate: 5,
      joiningDate: new Date().toISOString().split('T')[0],
      leaseStart: new Date().toISOString().split('T')[0],
      leaseEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      password: 'Welcome@123'
    }
  });

  const selectedPropertyId = watch('propertyId');
  const selectedRoomId = watch('roomId');

  // Filter rooms for the selected property
  const availableRooms = rooms.filter(r => r.propertyId === selectedPropertyId);

  // If property changes and current roomId is not in availableRooms, auto-select first room
  useEffect(() => {
    if (availableRooms.length > 0) {
      if (!selectedRoomId || !availableRooms.find(r => r.id === selectedRoomId)) {
        const firstRoom = availableRooms[0];
        setValue('roomId', firstRoom.id);
        setValue('monthlyRent', firstRoom.monthlyRent || 8000);
        setValue('securityDeposit', firstRoom.securityDeposit || 16000);
      }
    } else {
      setValue('roomId', '');
      setValue('bedId', '');
    }
  }, [selectedPropertyId, availableRooms, selectedRoomId, setValue]);

  // When room changes, update rent & deposit, and filter beds
  const roomBeds = beds.filter(b => b.roomId === selectedRoomId);

  useEffect(() => {
    if (selectedRoomId) {
      const roomObj = rooms.find(r => r.id === selectedRoomId);
      if (roomObj) {
        setValue('monthlyRent', roomObj.monthlyRent);
        setValue('securityDeposit', roomObj.securityDeposit);
      }
      // Check if current bed is in this room and available
      const currentBed = roomBeds.find(b => b.id === watch('bedId'));
      if (!currentBed || currentBed.status !== 'AVAILABLE') {
        const firstAvailable = roomBeds.find(b => b.status === 'AVAILABLE');
        setValue('bedId', firstAvailable ? firstAvailable.id : '');
      }
    }
  }, [selectedRoomId, rooms, roomBeds, setValue, watch]);

  const onSubmit = (formData) => {
    if (!formData.bedId) {
      toast.error('Please select an available bed for this tenant.');
      return;
    }

    try {
      const result = addTenant(formData);
      toast.success(`Tenant ${formData.name} added successfully!`);
      reset();
      onClose();
      if (onSuccess) onSuccess(result);
    } catch (e) {
      console.error(e);
      toast.error('Failed to create tenant.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Tenant"
      description="Create a tenant profile, assign room and bed, and auto-generate login credentials."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
        {/* Step 1: Personal Details */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6C4AB6] mb-3 pb-1 border-b border-purple-100 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#6C4AB6] text-white flex items-center justify-center text-[10px]">1</span>
            Personal Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Rahul Kumar"
              required
              error={errors.name?.message}
              {...register('name', { required: 'Tenant name is required' })}
            />

            <Input
              label="Email (For App Login)"
              type="email"
              placeholder="rahul@example.com"
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Valid email address' }
              })}
            />

            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              required
              error={errors.phone?.message}
              {...register('phone', { required: 'Phone number is required' })}
            />

            <Input
              label="Emergency Contact"
              placeholder="+91 98765 00000 (Parent/Guardian)"
              error={errors.emergencyContact?.message}
              {...register('emergencyContact')}
            />
          </div>

          <div className="mt-4">
            <Input
              label="Permanent Address"
              placeholder="Flat 402, Green Avenue, Delhi"
              {...register('address')}
            />
          </div>
        </div>

        {/* Step 2: Assignment */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6C4AB6] mb-3 pb-1 border-b border-purple-100 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#6C4AB6] text-white flex items-center justify-center text-[10px]">2</span>
            Room & Bed Assignment
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Property"
              required
              options={properties.map(p => ({ value: p.id, label: p.name }))}
              error={errors.propertyId?.message}
              {...register('propertyId', { required: 'Select property' })}
            />

            <Select
              label="Room"
              required
              options={availableRooms.map(r => ({
                value: r.id,
                label: `${r.roomNumber} (${r.type} - Floor ${r.floor})`
              }))}
              error={errors.roomId?.message}
              {...register('roomId', { required: 'Select room' })}
            />

            <Select
              label="Bed"
              required
              placeholder={roomBeds.length === 0 ? 'No beds in room' : 'Select available bed'}
              options={roomBeds.map(b => ({
                value: b.id,
                label: `${b.bedNumber} — ${b.status}`,
                disabled: b.status !== 'AVAILABLE'
              }))}
              error={errors.bedId?.message}
              {...register('bedId', { required: 'Select an available bed' })}
            />
          </div>
          {roomBeds.length > 0 && roomBeds.filter(b => b.status === 'AVAILABLE').length === 0 && (
            <p className="mt-2 text-xs text-red-500 font-medium">
              All beds in this room are currently occupied. Please choose another room.
            </p>
          )}
        </div>

        {/* Step 3: Rental & Lease Terms */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6C4AB6] mb-3 pb-1 border-b border-purple-100 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#6C4AB6] text-white flex items-center justify-center text-[10px]">3</span>
            Rental & Payment Terms
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Monthly Rent (₹)"
              type="number"
              required
              error={errors.monthlyRent?.message}
              {...register('monthlyRent', { required: 'Monthly rent required' })}
            />

            <Input
              label="Security Deposit (₹)"
              type="number"
              error={errors.securityDeposit?.message}
              {...register('securityDeposit')}
            />

            <Select
              label="Rent Due Date (Day of Month)"
              required
              options={[1, 5, 7, 10, 15, 20, 25, 28].map(day => ({
                value: day,
                label: `${day}th of every month`
              }))}
              error={errors.dueDate?.message}
              {...register('dueDate', { required: 'Due date is required' })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Input
              label="Joining / Lease Start Date"
              type="date"
              required
              {...register('leaseStart', { required: 'Start date required' })}
            />
            <Input
              label="Lease End Date"
              type="date"
              {...register('leaseEnd')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Create Tenant & Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};
