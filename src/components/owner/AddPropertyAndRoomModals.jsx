import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';
import { Input, Select, Textarea, Button } from '../common/FormComponents';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

export const AddPropertyModal = ({ isOpen, onClose, onSuccess }) => {
  const { addProperty } = useApp();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      type: 'PG',
      address: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '',
      floors: 3,
      description: ''
    }
  });

  const onSubmit = (formData) => {
    try {
      const created = addProperty({
        ...formData,
        floors: parseInt(formData.floors, 10) || 1
      });
      toast.success(`Property "${formData.name}" created successfully!`);
      reset();
      onClose();
      if (onSuccess) onSuccess(created);
    } catch {
      toast.error('Failed to create property. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Property"
      description="Register a new building, PG, hostel, or rental property to manage."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Property Name"
            placeholder="e.g. Sunshine PG"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Property name is required' })}
          />

          <Select
            label="Property Type"
            required
            options={[
              { value: 'PG', label: 'PG (Paying Guest)' },
              { value: 'Apartment', label: 'Apartment' },
              { value: 'Hostel', label: 'Hostel' },
              { value: 'Independent House', label: 'Independent House' },
              { value: 'Co-Living', label: 'Co-Living' }
            ]}
            error={errors.type?.message}
            {...register('type', { required: 'Select property type' })}
          />
        </div>

        <Input
          label="Street Address"
          placeholder="e.g. 124, 5th Main, 7th Cross, Koramangala 4th Block"
          required
          error={errors.address?.message}
          {...register('address', { required: 'Address is required' })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="City"
            placeholder="Bengaluru"
            required
            error={errors.city?.message}
            {...register('city', { required: 'City is required' })}
          />
          <Input
            label="State"
            placeholder="Karnataka"
            required
            error={errors.state?.message}
            {...register('state', { required: 'State is required' })}
          />
          <Input
            label="Pincode"
            placeholder="560034"
            required
            error={errors.pincode?.message}
            {...register('pincode', {
              required: 'Pincode is required',
              pattern: { value: /^[0-9]{6}$/, message: 'Valid 6-digit pincode' }
            })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Number of Floors"
            type="number"
            min="1"
            max="50"
            required
            error={errors.floors?.message}
            {...register('floors', { required: 'Number of floors is required' })}
          />
        </div>

        <Textarea
          label="Description / Amenities"
          placeholder="Add details about meals, WiFi, housekeeping, security, etc."
          rows={3}
          {...register('description')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Create Property
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const AddRoomModal = ({ isOpen, onClose, preselectedPropertyId, onSuccess }) => {
  const { properties, addRoom } = useApp();
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      propertyId: preselectedPropertyId || (properties[0]?.id || ''),
      roomNumber: '',
      floor: 1,
      type: 'Triple Sharing',
      capacity: 3,
      monthlyRent: 8000,
      securityDeposit: 16000
    }
  });

  const selectedCapacity = watch('capacity');

  const onSubmit = (formData) => {
    try {
      const created = addRoom(formData);
      toast.success(`Room ${formData.roomNumber} added with ${formData.capacity} automatically created beds!`);
      reset();
      onClose();
      if (onSuccess) onSuccess(created);
    } catch {
      toast.error('Failed to create room. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Room"
      description="Create a room and beds will be generated automatically based on capacity."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        <Select
          label="Property"
          required
          options={properties.map(p => ({ value: p.id, label: `${p.name} (${p.city})` }))}
          error={errors.propertyId?.message}
          {...register('propertyId', { required: 'Please select a property' })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Room Number / Name"
            placeholder="e.g. A-101"
            required
            error={errors.roomNumber?.message}
            {...register('roomNumber', { required: 'Room number is required' })}
          />

          <Input
            label="Floor"
            type="number"
            min="0"
            max="50"
            required
            error={errors.floor?.message}
            {...register('floor', { required: 'Floor is required' })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Room Type"
            required
            options={[
              { value: 'Single', label: 'Single' },
              { value: 'Double Sharing', label: 'Double Sharing' },
              { value: 'Triple Sharing', label: 'Triple Sharing' },
              { value: 'Four Sharing', label: 'Four Sharing' },
              { value: 'Custom', label: 'Custom' }
            ]}
            error={errors.type?.message}
            {...register('type', { required: 'Select room type' })}
          />

          <Input
            label="Capacity (Number of Beds)"
            type="number"
            min="1"
            max="12"
            required
            error={errors.capacity?.message}
            helperText="System will auto-create Bed 1 to Bed N"
            {...register('capacity', {
              required: 'Capacity is required',
              min: { value: 1, message: 'Minimum 1 bed' },
              max: { value: 12, message: 'Maximum 12 beds' }
            })}
          />
        </div>

        {selectedCapacity && (
          <div className="p-3.5 bg-[#F3EEFF] rounded-xl border border-purple-200 text-xs text-[#4B2E83] flex items-center justify-between">
            <span className="font-semibold">Auto-Bed Generation:</span>
            <span className="font-medium">
              Will generate {Array.from({ length: Math.min(Number(selectedCapacity) || 1, 12) }, (_, i) => `Bed ${i + 1}`).join(', ')}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Monthly Rent per Bed (₹)"
            type="number"
            placeholder="8000"
            required
            error={errors.monthlyRent?.message}
            {...register('monthlyRent', {
              required: 'Monthly rent is required',
              min: { value: 100, message: 'Minimum rent ₹100' }
            })}
          />

          <Input
            label="Security Deposit (₹)"
            type="number"
            placeholder="16000"
            error={errors.securityDeposit?.message}
            {...register('securityDeposit')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Add Room & Beds
          </Button>
        </div>
      </form>
    </Modal>
  );
};
