import React, { useState } from 'react';
import { useTenant } from '../../context/AppContext';
import { formatTimeAgo } from '../../utils/helpers';
import { Card, Badge, EmptyState } from '../../components/common/CardsAndBadges';
import { Button } from '../../components/common/FormComponents';
import {
  Bell,
  CheckCheck,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Megaphone,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export const TenantNotifications = () => {
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useTenant();
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case 'Rent Due':
        return <Clock className="w-4 h-4 text-indigo-600" />;
      case 'Payment Approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'Payment Rejected':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'Problem Updated':
        return <AlertTriangle className="w-4 h-4 text-blue-600" />;
      case 'Owner Message':
        return <Megaphone className="w-4 h-4 text-[#6C4AB6]" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Rent due reminders, payment approvals, problem updates, and owner messages
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            icon={CheckCheck}
            onClick={() => {
              markAllNotificationsAsRead();
              toast.success('All notifications marked as read');
            }}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'ALL' ? 'bg-[#6C4AB6] text-white' : 'bg-white border text-gray-600'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'UNREAD' ? 'bg-[#6C4AB6] text-white' : 'bg-white border text-gray-600'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {filteredNotifs.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts right now"
          description="You are caught up with all rent notices and messages."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => (
            <Card
              key={n.id}
              className={`p-4 flex items-start justify-between gap-3 transition-colors ${
                !n.isRead ? 'bg-purple-50/50 border-purple-200' : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  !n.isRead ? 'bg-white shadow-2xs' : 'bg-gray-100'
                }`}>
                  {getNotifIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#6C4AB6]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[11px] text-gray-400 mt-1.5 block">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <button
                  type="button"
                  onClick={() => markNotificationAsRead(n.id)}
                  className="text-xs font-semibold text-[#6C4AB6] hover:underline shrink-0 cursor-pointer"
                >
                  Mark read
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
