import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import { Card, Badge, EmptyState } from '../../components/common/CardsAndBadges';
import { Button, Input, Select, Textarea } from '../../components/common/FormComponents';
import {
  AlertTriangle,
  Plus,
  Send,
  Camera,
  MessageSquare,
  Clock,
  Eye,
  CheckCircle2,
  Wrench
} from 'lucide-react';
import { toast } from 'sonner';

export const TenantProblems = () => {
  const navigate = useNavigate();
  const { tenant, property, room, problems, reportProblem } = useTenant();
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'
  );

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      category: 'Plumbing',
      priority: 'MEDIUM',
      description: ''
    }
  });

  const onSubmit = (formData) => {
    try {
      // Auto-linking tenant, owner, property, room directly inside reportProblem!
      const created = reportProblem({
        title: formData.title,
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        image: imagePreview
      });
      toast.success('Problem reported! The PG owner has been notified.');
      reset();
      setShowForm(false);
    } catch {
      toast.error('Failed to submit complaint. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Report a Problem / Issue
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Need repairs or maintenance? File a ticket directly to property management
          </p>
        </div>

        {!showForm && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowForm(true)}
          >
            Report New Issue
          </Button>
        )}
      </div>

      {/* Auto-location banner */}
      <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
        <span className="font-semibold">Your Location Auto-Linked:</span>
        <span className="font-medium">
          {property?.name} • Room {room?.roomNumber}
        </span>
      </div>

      {/* Problem Submission Form (Expandable) */}
      {showForm && (
        <Card className="border-purple-200 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#6C4AB6]" />
              New Maintenance Ticket
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Problem Title"
              placeholder="e.g. Bathroom tap leaking / AC not cooling / WiFi disconnected"
              required
              error={errors.title?.message}
              {...register('title', { required: 'Please describe the problem in a short title' })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                required
                options={[
                  { value: 'Plumbing', label: 'Plumbing / Tap / Flush' },
                  { value: 'Electricity', label: 'Electricity / Power' },
                  { value: 'Internet', label: 'Internet / WiFi' },
                  { value: 'AC', label: 'AC / Air Conditioning' },
                  { value: 'Fan', label: 'Fan / Light' },
                  { value: 'Furniture', label: 'Bed / Table / Furniture' },
                  { value: 'Bathroom', label: 'Geyser / Bathroom' },
                  { value: 'Cleaning', label: 'Room / Housekeeping' },
                  { value: 'Kitchen', label: 'Kitchen / Water Purifier' },
                  { value: 'Security', label: 'Door Lock / Security' },
                  { value: 'Other', label: 'Other Issue' }
                ]}
                {...register('category')}
              />

              <Select
                label="Urgency / Priority"
                required
                options={[
                  { value: 'LOW', label: 'Low (Can be fixed in 2-3 days)' },
                  { value: 'MEDIUM', label: 'Medium (Fix within 24 hours)' },
                  { value: 'HIGH', label: 'High (Affects daily routine)' },
                  { value: 'URGENT', label: 'Urgent (Water leak, power cut, emergency)' }
                ]}
                {...register('priority')}
              />
            </div>

            <Textarea
              label="Detailed Description"
              rows={4}
              placeholder="Provide exact details so the repair technician comes with the right tools..."
              required
              error={errors.description?.message}
              {...register('description', { required: 'Please provide details of the problem' })}
            />

            {/* Photo Attachment preview */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Attach Photo of Issue
              </label>
              <div className="border border-dashed border-gray-200 rounded-xl p-3 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Problem sample"
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  />
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Issue_Photo.jpg</span>
                    <span className="text-[11px] text-gray-400">Attached & ready to send</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info('Default sample photo attached for demonstration.')}
                  className="text-xs text-[#6C4AB6] font-medium hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" /> Sample Photo
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" icon={Send} loading={isSubmitting}>
                Send Problem to Owner
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* List of Previous Reports */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-gray-900">Your Maintenance Tickets</h3>

        {problems.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No problems reported yet"
            description="You have not submitted any complaints. Everything looks in order!"
            actionText="Report an Issue"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="space-y-3">
            {problems.map((prob) => (
              <div
                key={prob.id}
                className="p-4 rounded-2xl border border-gray-100 hover:border-purple-200 transition-colors bg-white flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#6C4AB6] uppercase">{prob.category}</span>
                    <span className="text-gray-300">•</span>
                    <h4 className="text-sm font-bold text-gray-900">{prob.title}</h4>
                    <Badge status={prob.priority} size="xs" />
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
                    {prob.description}
                  </p>

                  {/* Owner Response highlight if provided */}
                  {prob.ownerResponse && (
                    <div className="p-3 bg-[#F3EEFF] rounded-xl border border-purple-100 text-xs text-[#4B2E83] mt-2">
                      <span className="font-bold flex items-center gap-1.5 mb-0.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#6C4AB6]" /> Owner Response:
                      </span>
                      <p className="italic">{prob.ownerResponse}</p>
                    </div>
                  )}

                  <span className="text-[11px] text-gray-400 block pt-1">
                    Submitted on {formatDate(prob.createdAt)}
                  </span>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                  <Badge status={prob.status} />
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={Eye}
                    onClick={() => navigate(`/tenant/problems/${prob.id}`)}
                  >
                    View Status
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export const TenantProblemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { problems, property, room } = useTenant();

  const problem = problems.find((p) => p.id === id);

  if (!problem) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Problem Not Found"
        description="The requested ticket was not found."
        actionText="Back to Issues"
        onAction={() => navigate('/tenant/problem')}
      />
    );
  }

  const steps = [
    { key: 'OPEN', label: 'Ticket Acknowledged' },
    { key: 'IN_PROGRESS', label: 'Technician Assigned' },
    { key: 'RESOLVED', label: 'Issue Resolved' }
  ];

  const currentStepIndex =
    problem.status === 'RESOLVED' || problem.status === 'CLOSED'
      ? 2
      : problem.status === 'IN_PROGRESS'
      ? 1
      : 0;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/tenant/problem')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#6C4AB6] cursor-pointer"
      >
        ← Back to Issues
      </button>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-gray-900">{problem.title}</h1>
          <Badge status={problem.status} />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {problem.category} • Logged on {formatDate(problem.createdAt)}
        </p>
      </div>

      {/* Progress Timeline */}
      <Card className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Resolution Timeline
        </h3>

        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 -z-0" />
          {steps.map((s, idx) => {
            const isCompleted = idx <= currentStepIndex;
            return (
              <div key={s.key} className="flex flex-col items-center relative z-10 text-center px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  isCompleted ? 'bg-[#6C4AB6] text-white ring-4 ring-purple-100' : 'bg-gray-200 text-gray-500'
                }`}>
                  {idx + 1}
                </div>
                <span className={`text-[11px] font-semibold mt-2 ${
                  isCompleted ? 'text-[#6C4AB6]' : 'text-gray-400'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Problem Content */}
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-gray-900">Your Description</h3>
        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-line">
          {problem.description}
        </p>

        {problem.ownerResponse && (
          <div className="p-4 bg-[#F3EEFF] border border-purple-200 rounded-xl space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4B2E83] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#6C4AB6]" /> Owner Response:
            </span>
            <p className="text-sm text-gray-800 italic">{problem.ownerResponse}</p>
          </div>
        )}

        {problem.image && (
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Photo Proof</span>
            <img src={problem.image} alt="proof" className="rounded-xl max-h-60 object-cover border border-gray-200" />
          </div>
        )}
      </Card>
    </div>
  );
};
