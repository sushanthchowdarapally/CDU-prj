import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button, Select, Textarea } from '../common/FormComponents';
import { Badge } from '../common/CardsAndBadges';
import { formatDate } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { Wrench, CheckCheck, Clock, User, Building, ExternalLink } from 'lucide-react';

export const ProblemResponseModal = ({ isOpen, onClose, problem }) => {
  const { tenants, properties, rooms, updateProblemStatus } = useApp();
  const [status, setStatus] = useState(problem?.status || 'OPEN');
  const [response, setResponse] = useState(problem?.ownerResponse || '');
  const [submitting, setSubmitting] = useState(false);

  // Sync state if problem changes
  React.useEffect(() => {
    if (problem) {
      setStatus(problem.status);
      setResponse(problem.ownerResponse || '');
    }
  }, [problem]);

  if (!problem) return null;

  const tenant = tenants.find(t => t.id === problem.tenantId);
  const property = properties.find(p => p.id === problem.propertyId);
  const room = rooms.find(r => r.id === problem.roomId);

  const handleSubmit = (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      updateProblemStatus(problem.id, status, response);
      toast.success(`Complaint status updated to ${status}! Tenant notified.`);
      onClose();
    } catch {
      toast.error('Failed to update complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickResolve = () => {
    setSubmitting(true);
    try {
      updateProblemStatus(problem.id, 'RESOLVED', response || 'Issue has been inspected and resolved.');
      toast.success('Complaint marked as Resolved! Tenant notified.');
      onClose();
    } catch {
      toast.error('Failed to update complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Problem / Complaint"
      description={`Reported on ${formatDate(problem.createdAt)}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Info header */}
        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-[#6C4AB6] uppercase tracking-wider block">
              {problem.category}
            </span>
            <h4 className="text-base font-bold text-gray-900 mt-0.5">{problem.title}</h4>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400" /> {tenant?.name || 'Tenant'}
              </span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-gray-400" /> {property?.name} (Room {room?.roomNumber})
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge status={problem.status} />
            <Badge status={problem.priority} size="xs" />
          </div>
        </div>

        {/* Problem Description */}
        <div className="p-3.5 bg-white border border-gray-100 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Tenant Description
          </span>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {problem.description}
          </p>

          {problem.image && (
            <div className="mt-3">
              <div className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video max-h-40 flex items-center justify-center bg-gray-50">
                <img
                  src={problem.image}
                  alt="Complaint proof"
                  className="w-full h-full object-cover"
                />
                <a
                  href={problem.image}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-xs"
                >
                  <ExternalLink className="w-4 h-4" /> View Full Photo
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Update Status and Response */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <Select
            label="Update Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'OPEN', label: 'OPEN (Acknowledged)' },
              { value: 'IN_PROGRESS', label: 'IN PROGRESS (Staff Assigned)' },
              { value: 'RESOLVED', label: 'RESOLVED (Completed)' },
              { value: 'CLOSED', label: 'CLOSED' }
            ]}
          />

          <Textarea
            label="Owner Response / Status Update to Tenant"
            rows={3}
            placeholder="e.g. The plumber has been assigned and will visit today between 3 PM and 5 PM."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            helperText="The tenant will instantly receive this update in their notifications."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-2">
          {problem.status !== 'RESOLVED' && (
            <Button
              variant="secondary"
              icon={CheckCheck}
              onClick={handleQuickResolve}
              loading={submitting}
              type="button"
            >
              Mark Resolved
            </Button>
          )}

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Update Complaint
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
