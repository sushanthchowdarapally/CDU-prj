import React from 'react';

export const Badge = ({
  status = 'default',
  children,
  size = 'sm',
  className = ''
}) => {
  const normalized = String(status || '').toUpperCase();

  const styles = {
    // Payment / Rent Statuses
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200/80',
    PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200/80',
    DUE_SOON: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200/80',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/80',

    // Bed / Room Statuses
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    OCCUPIED: 'bg-purple-50 text-[#6C4AB6] border-purple-200/80',
    MAINTENANCE: 'bg-orange-50 text-orange-700 border-orange-200/80',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    VACATED: 'bg-gray-100 text-gray-600 border-gray-200',

    // Problem Statuses
    OPEN: 'bg-amber-50 text-amber-700 border-amber-200/80',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200/80',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    CLOSED: 'bg-gray-100 text-gray-600 border-gray-200',

    // Priority
    LOW: 'bg-slate-100 text-slate-700 border-slate-200',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
    URGENT: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',

    // Defaults
    PRIMARY: 'bg-[#F3EEFF] text-[#6C4AB6] border-purple-200',
    DEFAULT: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const readableLabels = {
    PENDING_VERIFICATION: 'Pending Verification',
    DUE_SOON: 'Due Soon',
    IN_PROGRESS: 'In Progress',
    OVERDUE: 'Overdue'
  };

  const displayText = children || readableLabels[normalized] || normalized.replace('_', ' ');

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[11px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  const activeStyle = styles[normalized] || styles.DEFAULT;

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${activeStyle} ${sizeClasses[size] || sizeClasses.sm} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
      {displayText}
    </span>
  );
};

export const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 transition-all duration-200 ${
        hover ? 'hover:shadow-md hover:border-purple-200 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  className = ''
}) => {
  return (
    <Card className={`relative overflow-hidden group ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            {title}
          </p>
          <h4 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {value}
          </h4>
          {subtext && (
            <p className="mt-1.5 text-xs text-gray-500 font-medium">
              {subtext}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-[#F3EEFF] text-[#6C4AB6] rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
          <span>{trend}</span>
        </div>
      )}
    </Card>
  );
};

export const EmptyState = ({
  icon: Icon,
  title = 'No items found',
  description = 'There is no data to display right now.',
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200 ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#F3EEFF] text-[#6C4AB6] flex items-center justify-center mb-4 shadow-xs">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 text-sm font-semibold text-white bg-[#6C4AB6] hover:bg-[#583999] rounded-xl transition-all shadow-sm cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
};

export const SkeletonCard = () => {
  return (
    <Card className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-48" />
    </Card>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <Skeleton className="h-10 w-full rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  );
};
