import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import { Card, Badge, StatCard, EmptyState } from '../../components/common/CardsAndBadges';
import { Button, Input, Select } from '../../components/common/FormComponents';
import { ProblemResponseModal } from '../../components/owner/ProblemResponseModal';
import {
  AlertTriangle,
  Search,
  CheckCheck,
  Clock,
  Eye,
  Building,
  User,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

export const Problems = () => {
  const navigate = useNavigate();
  const { problems, tenants, properties, rooms, updateProblemStatus } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedProblem, setSelectedProblem] = useState(null);

  const openCount = problems.filter((p) => p.status === 'OPEN').length;
  const inProgressCount = problems.filter((p) => p.status === 'IN_PROGRESS').length;
  const resolvedCount = problems.filter((p) => p.status === 'RESOLVED').length;

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const tenant = tenants.find((t) => t.id === p.tenantId);
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        tenant?.name.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || p.priority === priorityFilter;
      const matchCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [problems, tenants, search, statusFilter, priorityFilter, categoryFilter]);

  const handleQuickResolve = (problem) => {
    updateProblemStatus(problem.id, 'RESOLVED', 'Issue resolved by property maintenance.');
    toast.success(`Complaint "${problem.title}" marked as Resolved! Resident notified.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Maintenance & Complaints
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track reported issues, assign maintenance staff, and update resident status
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Open Requests"
          value={openCount}
          subtext="Requires immediate inspection"
          icon={AlertTriangle}
          className={openCount > 0 ? 'border-amber-200 bg-amber-50/20' : ''}
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtext="Technician assigned"
          icon={Clock}
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          subtext="Fixed and completed"
          icon={CheckCheck}
        />
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Input
          placeholder="Search complaints, descriptions..."
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'OPEN', label: 'OPEN' },
            { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
            { value: 'RESOLVED', label: 'RESOLVED' },
            { value: 'CLOSED', label: 'CLOSED' }
          ]}
        />

        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Priorities' },
            { value: 'URGENT', label: 'Urgent' },
            { value: 'HIGH', label: 'High' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'LOW', label: 'Low' }
          ]}
        />

        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Categories' },
            { value: 'Plumbing', label: 'Plumbing' },
            { value: 'Electricity', label: 'Electricity' },
            { value: 'Internet', label: 'Internet / WiFi' },
            { value: 'AC', label: 'AC' },
            { value: 'Cleaning', label: 'Cleaning' },
            { value: 'Bathroom', label: 'Bathroom' },
            { value: 'Other', label: 'Other' }
          ]}
        />
      </div>

      {/* Complaints List / Table */}
      {filteredProblems.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No complaints found"
          description="Everything is functioning smoothly or adjust your filter selection."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7FC] text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4">Problem</th>
                <th className="py-3.5 px-4">Resident</th>
                <th className="py-3.5 px-4">Property & Room</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProblems.map((prob) => {
                const tenant = tenants.find((t) => t.id === prob.tenantId);
                const property = properties.find((p) => p.id === prob.propertyId);
                const room = rooms.find((r) => r.id === prob.roomId);

                return (
                  <tr key={prob.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 max-w-xs">
                      <div className="truncate font-bold text-sm text-gray-900">{prob.title}</div>
                      <div className="text-[11px] font-normal text-gray-500 line-clamp-1 mt-0.5">
                        {prob.description}
                      </div>
                      {prob.ownerResponse && (
                        <div className="text-[11px] text-[#6C4AB6] italic mt-1 font-normal flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> "{prob.ownerResponse}"
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      <div>{tenant?.name || 'Resident'}</div>
                      <div className="text-[11px] text-gray-400 font-normal">{tenant?.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">{property?.name || 'Property'}</div>
                      <div className="text-[11px] text-gray-500">Room {room?.roomNumber || 'N/A'}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {prob.category}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={prob.priority} size="xs" />
                    </td>

                    <td className="py-3.5 px-4 text-gray-500">
                      {formatDate(prob.createdAt)}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={prob.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => setSelectedProblem(prob)}
                        >
                          Respond
                        </Button>

                        {prob.status !== 'RESOLVED' && (
                          <Button
                            variant="outline"
                            size="xs"
                            icon={CheckCheck}
                            onClick={() => handleQuickResolve(prob)}
                          >
                            Resolve
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Eye}
                          onClick={() => navigate(`/owner/problems/${prob.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Response / Status Update Modal */}
      <ProblemResponseModal
        isOpen={!!selectedProblem}
        onClose={() => setSelectedProblem(null)}
        problem={selectedProblem}
      />
    </div>
  );
};
