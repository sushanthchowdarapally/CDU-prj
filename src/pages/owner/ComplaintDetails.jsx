import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import { Card, Badge, EmptyState } from '../../components/common/CardsAndBadges';
import { Button, Select, Textarea } from '../../components/common/FormComponents';
import {
  AlertTriangle,
  ArrowLeft,
  User,
  Building,
  DoorClosed,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { problems, tenants, properties, rooms, updateProblemStatus } = useApp();

  const problem = problems.find((p) => p.id === id);

  const [status, setStatus] = useState(problem?.status || 'OPEN');
  const [response, setResponse] = useState(problem?.ownerResponse || '');
  const [submitting, setSubmitting] = useState(false);

  if (!problem) {
    return (
      <div className="py-12 text-center">
        <EmptyState
          icon={AlertTriangle}
          title="Complaint Not Found"
          description="The maintenance request does not exist or has been removed."
          actionText="Back to Problems"
          onAction={() => navigate('/owner/problems')}
        />
      </div>
    );
  }

  const tenant = tenants.find((t) => t.id === problem.tenantId);
  const property = properties.find((p) => p.id === problem.propertyId);
  const room = rooms.find((r) => r.id === problem.roomId);

  const handleUpdate = (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      updateProblemStatus(problem.id, status, response);
      toast.success('Complaint status and response updated! Tenant notified.');
    } catch {
      toast.error('Failed to update complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/owner/problems')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#6C4AB6] mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Maintenance List
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {problem.title}
              </h1>
              <Badge status={problem.status} />
              <Badge status={problem.priority} size="xs" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Category: <span className="font-semibold text-[#6C4AB6]">{problem.category}</span> • Logged on {formatDate(problem.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details and Photo */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-gray-900">Issue Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line p-4 bg-gray-50 rounded-xl border border-gray-100">
              {problem.description}
            </p>

            {problem.image && (
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Tenant Photo Attachment
                </span>
                <div className="relative group rounded-2xl overflow-hidden border border-gray-200 max-h-72 aspect-video bg-gray-100 flex items-center justify-center">
                  <img
                    src={problem.image}
                    alt="Problem attachment"
                    className="w-full h-full object-cover"
                  />
                  <a
                    href={problem.image}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" /> Open Full Image
                  </a>
                </div>
              </div>
            )}
          </Card>

          {/* Action / Update Card */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-gray-900">Take Action & Notify Resident</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
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
                label="Owner Response / Status Update"
                rows={4}
                placeholder="e.g. Technician assigned for 2:30 PM. Tap will be replaced."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                helperText="This message is instantly pushed to the resident's notifications."
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" icon={Send} loading={submitting}>
                  Save & Notify Resident
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Col: Resident & Property Info */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#6C4AB6] pb-2 border-b border-purple-100">
              Resident & Location
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block font-medium">Reported by</span>
                  <span className="font-bold text-gray-900 text-sm">{tenant?.name || 'Resident'}</span>
                  <span className="text-gray-500 block">{tenant?.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-gray-100">
                <Building className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block font-medium">Property</span>
                  <span className="font-semibold text-gray-800">{property?.name}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-gray-100">
                <DoorClosed className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block font-medium">Room Location</span>
                  <span className="font-semibold text-gray-800">
                    Room {room?.roomNumber} (Floor {room?.floor})
                  </span>
                </div>
              </div>
            </div>

            {tenant && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/owner/tenants/${tenant.id}`)}
                >
                  View Tenant Profile
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
