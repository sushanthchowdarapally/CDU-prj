import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';
import { Input, Select, Textarea, Button } from '../common/FormComponents';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { Megaphone } from 'lucide-react';

export const AnnouncementModal = ({ isOpen, onClose }) => {
  const { properties, rooms, tenants, createAnnouncement } = useApp();
  const [targetType, setTargetType] = useState('ALL');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      message: '',
      targetId: ''
    }
  });

  const onSubmit = (formData) => {
    try {
      createAnnouncement({
        title: formData.title,
        message: formData.message,
        targetType: targetType,
        targetId: targetType === 'ALL' ? null : formData.targetId
      });
      toast.success('Announcement broadcasted! Targeted tenants have been notified.');
      reset();
      setTargetType('ALL');
      onClose();
    } catch {
      toast.error('Failed to post announcement.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Broadcast Announcement"
      description="Send instant notifications and notices to all or selected residents."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        <Input
          label="Notice Title"
          placeholder="e.g. Water Maintenance Notice / Pest Control Schedule"
          required
          error={errors.title?.message}
          {...register('title', { required: 'Title is required' })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Target Audience"
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Tenants (Entire PG)' },
              { value: 'PROPERTY', label: 'Specific Property' },
              { value: 'ROOM', label: 'Specific Room' },
              { value: 'TENANT', label: 'Single Specific Tenant' }
            ]}
          />

          {targetType === 'PROPERTY' && (
            <Select
              label="Select Property"
              required
              options={properties.map(p => ({ value: p.id, label: p.name }))}
              {...register('targetId', { required: 'Please select a property' })}
            />
          )}

          {targetType === 'ROOM' && (
            <Select
              label="Select Room"
              required
              options={rooms.map(r => ({
                value: r.id,
                label: `Room ${r.roomNumber} (${properties.find(p => p.id === r.propertyId)?.name || ''})`
              }))}
              {...register('targetId', { required: 'Please select a room' })}
            />
          )}

          {targetType === 'TENANT' && (
            <Select
              label="Select Tenant"
              required
              options={tenants.map(t => ({
                value: t.id,
                label: `${t.name} (Room ${rooms.find(r => r.id === t.roomId)?.roomNumber || ''})`
              }))}
              {...register('targetId', { required: 'Please select a tenant' })}
            />
          )}
        </div>

        <Textarea
          label="Announcement Message"
          placeholder="e.g. Water supply will be unavailable from 10 AM to 1 PM tomorrow due to maintenance..."
          rows={4}
          required
          error={errors.message?.message}
          {...register('message', { required: 'Announcement message is required' })}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" icon={Megaphone} loading={isSubmitting}>
            Send Announcement
          </Button>
        </div>
      </form>
    </Modal>
  );
};
