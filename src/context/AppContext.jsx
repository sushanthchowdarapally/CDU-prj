import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DATA } from '../data/initialData';
import { generateId } from '../utils/helpers';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

const STORAGE_KEY = 'pg_manager_data_v1';

export const AppProvider = ({ children }) => {
  const { user } = useAuth();

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved data', e);
    }
    return INITIAL_DATA;
  });

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving data to storage', e);
    }
  }, [data]);

  // Reset to default sample data
  const resetToDefaultData = () => {
    setData(INITIAL_DATA);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  };

  // ================= PROPERTY ACTIONS =================
  const addProperty = (propertyData) => {
    const newProperty = {
      id: generateId('prop'),
      ownerId: user?.id || 'owner_001',
      createdAt: new Date().toISOString(),
      ...propertyData
    };
    setData(prev => ({
      ...prev,
      properties: [newProperty, ...prev.properties]
    }));
    return newProperty;
  };

  const updateProperty = (id, updates) => {
    setData(prev => ({
      ...prev,
      properties: prev.properties.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteProperty = (id) => {
    setData(prev => {
      // Find rooms belonging to property
      const roomIds = prev.rooms.filter(r => r.propertyId === id).map(r => r.id);
      return {
        ...prev,
        properties: prev.properties.filter(p => p.id !== id),
        rooms: prev.rooms.filter(r => r.propertyId !== id),
        beds: prev.beds.filter(b => !roomIds.includes(b.roomId)),
        tenants: prev.tenants.filter(t => t.propertyId !== id),
        problems: prev.problems.filter(prob => prob.propertyId !== id)
      };
    });
  };

  // ================= ROOM & BED ACTIONS =================
  const addRoom = (roomData) => {
    const capacity = parseInt(roomData.capacity, 10) || 1;
    const roomId = generateId('room');

    const newRoom = {
      id: roomId,
      propertyId: roomData.propertyId,
      roomNumber: roomData.roomNumber,
      floor: parseInt(roomData.floor, 10) || 1,
      type: roomData.type || (capacity === 1 ? 'Single' : `${capacity} Sharing`),
      capacity: capacity,
      monthlyRent: parseInt(roomData.monthlyRent, 10) || 0,
      securityDeposit: parseInt(roomData.securityDeposit, 10) || 0,
      status: 'ACTIVE'
    };

    // Automatic bed creation
    const newBeds = [];
    for (let i = 1; i <= capacity; i++) {
      newBeds.push({
        id: generateId(`bed_${roomId}`),
        roomId: roomId,
        bedNumber: `Bed ${i}`,
        status: 'AVAILABLE',
        tenantId: null
      });
    }

    setData(prev => ({
      ...prev,
      rooms: [newRoom, ...prev.rooms],
      beds: [...prev.beds, ...newBeds]
    }));

    return { room: newRoom, beds: newBeds };
  };

  const updateRoom = (id, updates) => {
    setData(prev => {
      const existingRoom = prev.rooms.find(r => r.id === id);
      if (!existingRoom) return prev;

      const newCapacity = updates.capacity ? parseInt(updates.capacity, 10) : existingRoom.capacity;
      let updatedBeds = [...prev.beds];

      // If capacity increased, create additional beds
      if (newCapacity > existingRoom.capacity) {
        const currentRoomBeds = prev.beds.filter(b => b.roomId === id);
        for (let i = currentRoomBeds.length + 1; i <= newCapacity; i++) {
          updatedBeds.push({
            id: generateId(`bed_${id}`),
            roomId: id,
            bedNumber: `Bed ${i}`,
            status: 'AVAILABLE',
            tenantId: null
          });
        }
      }

      return {
        ...prev,
        rooms: prev.rooms.map(r => r.id === id ? { ...r, ...updates, capacity: newCapacity } : r),
        beds: updatedBeds
      };
    });
  };

  const deleteRoom = (id) => {
    setData(prev => ({
      ...prev,
      rooms: prev.rooms.filter(r => r.id !== id),
      beds: prev.beds.filter(b => b.roomId !== id),
      tenants: prev.tenants.filter(t => t.roomId !== id)
    }));
  };

  const setBedStatus = (bedId, status) => {
    setData(prev => ({
      ...prev,
      beds: prev.beds.map(b => b.id === bedId ? { ...b, status } : b)
    }));
  };

  // ================= TENANT ACTIONS (CRITICAL WORKFLOW) =================
  const addTenant = (tenantInput) => {
    const userId = generateId('user');
    const tenantId = generateId('tenant');
    const rentId = generateId('rent');
    const notifTenantId = generateId('notif');
    const notifOwnerId = generateId('notif');

    const tempPassword = tenantInput.password || 'Welcome@123';
    const cleanEmail = tenantInput.email.trim().toLowerCase();

    // 1. Create User
    const newUser = {
      id: userId,
      name: tenantInput.name,
      email: cleanEmail,
      secondaryEmail: cleanEmail,
      password: tempPassword,
      phone: tenantInput.phone,
      role: 'TENANT'
    };

    // 2. Create Tenant Profile
    const newTenant = {
      id: tenantId,
      userId: userId,
      ownerId: user?.id || 'owner_001',
      propertyId: tenantInput.propertyId,
      roomId: tenantInput.roomId,
      bedId: tenantInput.bedId,
      name: tenantInput.name,
      email: cleanEmail,
      phone: tenantInput.phone,
      emergencyContact: tenantInput.emergencyContact || '',
      address: tenantInput.address || '',
      monthlyRent: parseInt(tenantInput.monthlyRent, 10),
      securityDeposit: parseInt(tenantInput.securityDeposit, 10) || 0,
      dueDate: parseInt(tenantInput.dueDate, 10) || 5,
      joiningDate: tenantInput.joiningDate || new Date().toISOString().split('T')[0],
      leaseStart: tenantInput.leaseStart || new Date().toISOString().split('T')[0],
      leaseEnd: tenantInput.leaseEnd || '',
      status: 'ACTIVE'
    };

    // 3. Create Initial Rent Record
    const currentDate = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentMonth = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    const dueDay = String(tenantInput.dueDate || 5).padStart(2, '0');
    const dueDateStr = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${dueDay}`;

    const newRent = {
      id: rentId,
      tenantId: tenantId,
      amount: parseInt(tenantInput.monthlyRent, 10),
      month: currentMonth,
      year: currentYear,
      dueDate: dueDateStr,
      status: 'DUE_SOON',
      createdAt: new Date().toISOString()
    };

    // 4. Welcome Notification for Tenant
    const tenantWelcomeNotif = {
      id: notifTenantId,
      userId: userId,
      type: 'Owner Message',
      title: 'Welcome to your new home!',
      message: `Welcome to PG Manager! Your room and bed have been successfully assigned. Your monthly rent is ₹${tenantInput.monthlyRent.toLocaleString('en-IN')} due on the ${tenantInput.dueDate || 5}th of every month.`,
      referenceId: tenantId,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // 5. Notification for Owner
    const ownerNotif = {
      id: notifOwnerId,
      userId: user?.id || 'owner_001',
      type: 'Tenant Added',
      title: 'Tenant Account Created',
      message: `${tenantInput.name} has been assigned to Room and Bed successfully.`,
      referenceId: tenantId,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // Update state synchronously
    setData(prev => {
      // Mark Bed as OCCUPIED and assign tenantId
      const updatedBeds = prev.beds.map(bed => {
        if (bed.id === tenantInput.bedId) {
          return {
            ...bed,
            status: 'OCCUPIED',
            tenantId: tenantId
          };
        }
        return bed;
      });

      return {
        ...prev,
        users: [...prev.users, newUser],
        tenants: [newTenant, ...prev.tenants],
        beds: updatedBeds,
        rents: [newRent, ...prev.rents],
        notifications: [tenantWelcomeNotif, ownerNotif, ...prev.notifications]
      };
    });

    return {
      success: true,
      tenant: newTenant,
      user: newUser,
      credentials: {
        name: tenantInput.name,
        email: cleanEmail,
        password: tempPassword
      }
    };
  };

  const updateTenant = (id, updates) => {
    setData(prev => ({
      ...prev,
      tenants: prev.tenants.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const moveTenantBed = (tenantId, newRoomId, newBedId) => {
    setData(prev => {
      const tenant = prev.tenants.find(t => t.id === tenantId);
      if (!tenant) return prev;

      const oldBedId = tenant.bedId;

      const updatedBeds = prev.beds.map(b => {
        if (b.id === oldBedId) {
          return { ...b, status: 'AVAILABLE', tenantId: null };
        }
        if (b.id === newBedId) {
          return { ...b, status: 'OCCUPIED', tenantId: tenantId };
        }
        return b;
      });

      const updatedTenants = prev.tenants.map(t => {
        if (t.id === tenantId) {
          return { ...t, roomId: newRoomId, bedId: newBedId };
        }
        return t;
      });

      return {
        ...prev,
        beds: updatedBeds,
        tenants: updatedTenants
      };
    });
  };

  const vacateTenant = (tenantId) => {
    setData(prev => {
      const tenant = prev.tenants.find(t => t.id === tenantId);
      if (!tenant) return prev;

      const updatedBeds = prev.beds.map(b => {
        if (b.id === tenant.bedId) {
          return { ...b, status: 'AVAILABLE', tenantId: null };
        }
        return b;
      });

      const updatedTenants = prev.tenants.map(t => {
        if (t.id === tenantId) {
          return { ...t, status: 'VACATED', vacatedAt: new Date().toISOString() };
        }
        return t;
      });

      return {
        ...prev,
        beds: updatedBeds,
        tenants: updatedTenants
      };
    });
  };

  const deleteTenant = (tenantId) => {
    setData(prev => {
      const tenant = prev.tenants.find(t => t.id === tenantId);
      if (!tenant) return prev;

      return {
        ...prev,
        tenants: prev.tenants.filter(t => t.id !== tenantId),
        beds: prev.beds.map(b => b.id === tenant.bedId ? { ...b, status: 'AVAILABLE', tenantId: null } : b),
        users: prev.users.filter(u => u.id !== tenant.userId)
      };
    });
  };

  // ================= PAYMENT ACTIONS =================
  const submitPayment = (paymentData) => {
    const paymentId = generateId('pay');
    const newPayment = {
      id: paymentId,
      tenantId: paymentData.tenantId,
      rentId: paymentData.rentId,
      ownerId: paymentData.ownerId || 'owner_001',
      amount: parseInt(paymentData.amount, 10),
      paymentMethod: paymentData.paymentMethod || 'UPI',
      transactionId: paymentData.transactionId || `TXN${Date.now()}`,
      paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      screenshot: paymentData.screenshot || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
      status: 'PENDING_VERIFICATION',
      rejectionReason: null,
      notes: paymentData.notes || '',
      createdAt: new Date().toISOString()
    };

    // Owner notification
    const tenantObj = data.tenants.find(t => t.id === paymentData.tenantId);
    const ownerNotif = {
      id: generateId('notif'),
      userId: paymentData.ownerId || 'owner_001',
      type: 'Payment Submitted',
      title: 'Rent Payment Submitted for Verification',
      message: `${tenantObj ? tenantObj.name : 'Tenant'} submitted ₹${paymentData.amount.toLocaleString('en-IN')} via ${paymentData.paymentMethod}. Please verify.`,
      referenceId: paymentId,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      payments: [newPayment, ...prev.payments],
      notifications: [ownerNotif, ...prev.notifications]
    }));

    return newPayment;
  };

  const approvePayment = (paymentId) => {
    setData(prev => {
      const payment = prev.payments.find(p => p.id === paymentId);
      if (!payment) return prev;

      const tenant = prev.tenants.find(t => t.id === payment.tenantId);
      const rent = prev.rents.find(r => r.id === payment.rentId);

      const updatedPayments = prev.payments.map(p => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: 'VERIFIED',
            verifiedBy: user?.name || 'Owner',
            verifiedAt: new Date().toISOString()
          };
        }
        return p;
      });

      // Mark Rent as PAID
      const updatedRents = prev.rents.map(r => {
        if (r.id === payment.rentId) {
          return {
            ...r,
            status: 'PAID',
            paidAt: new Date().toISOString()
          };
        }
        return r;
      });

      // Create notification for Tenant
      const tenantNotif = {
        id: generateId('notif'),
        userId: tenant ? tenant.userId : null,
        type: 'Payment Approved',
        title: 'Payment Confirmed',
        message: `Your ₹${payment.amount.toLocaleString('en-IN')} rent payment for ${rent ? rent.month : 'this month'} has been verified and confirmed.`,
        referenceId: paymentId,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      return {
        ...prev,
        payments: updatedPayments,
        rents: updatedRents,
        notifications: tenant?.userId ? [tenantNotif, ...prev.notifications] : prev.notifications
      };
    });
  };

  const rejectPayment = (paymentId, reason) => {
    setData(prev => {
      const payment = prev.payments.find(p => p.id === paymentId);
      if (!payment) return prev;

      const tenant = prev.tenants.find(t => t.id === payment.tenantId);

      const updatedPayments = prev.payments.map(p => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: 'REJECTED',
            rejectionReason: reason || 'Transaction could not be verified'
          };
        }
        return p;
      });

      // Revert Rent to PENDING / OVERDUE
      const updatedRents = prev.rents.map(r => {
        if (r.id === payment.rentId) {
          return {
            ...r,
            status: 'PENDING'
          };
        }
        return r;
      });

      // Tenant Notification
      const tenantNotif = {
        id: generateId('notif'),
        userId: tenant ? tenant.userId : null,
        type: 'Payment Rejected',
        title: 'Payment Verification Failed',
        message: `Your payment of ₹${payment.amount.toLocaleString('en-IN')} could not be verified. Reason: ${reason || 'Transaction could not be verified.'} Please resubmit with valid proof.`,
        referenceId: paymentId,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      return {
        ...prev,
        payments: updatedPayments,
        rents: updatedRents,
        notifications: tenant?.userId ? [tenantNotif, ...prev.notifications] : prev.notifications
      };
    });
  };

  // ================= PROBLEM / COMPLAINT ACTIONS =================
  const reportProblem = (problemInput) => {
    const tenant = data.tenants.find(t => t.id === problemInput.tenantId);
    const probId = generateId('prob');

    const newProblem = {
      id: probId,
      tenantId: problemInput.tenantId,
      ownerId: tenant?.ownerId || 'owner_001',
      propertyId: tenant?.propertyId || '',
      roomId: tenant?.roomId || '',
      title: problemInput.title,
      category: problemInput.category || 'Other',
      description: problemInput.description,
      priority: problemInput.priority || 'MEDIUM',
      status: 'OPEN',
      image: problemInput.image || '',
      ownerResponse: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Owner notification
    const ownerNotif = {
      id: generateId('notif'),
      userId: newProblem.ownerId,
      type: 'Problem Submitted',
      title: 'New Maintenance Problem Reported',
      message: `${tenant ? tenant.name : 'Tenant'} reported "${problemInput.title}" (${problemInput.category}, Priority: ${problemInput.priority}).`,
      referenceId: probId,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      problems: [newProblem, ...prev.problems],
      notifications: [ownerNotif, ...prev.notifications]
    }));

    return newProblem;
  };

  const updateProblemStatus = (problemId, newStatus, ownerResponse = '') => {
    setData(prev => {
      const problem = prev.problems.find(p => p.id === problemId);
      if (!problem) return prev;

      const tenant = prev.tenants.find(t => t.id === problem.tenantId);

      const updatedProblems = prev.problems.map(p => {
        if (p.id === problemId) {
          return {
            ...p,
            status: newStatus,
            ownerResponse: ownerResponse !== undefined && ownerResponse !== '' ? ownerResponse : p.ownerResponse,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });

      // Status change readable title
      const statusLabels = {
        OPEN: 'Reopened',
        IN_PROGRESS: 'In Progress',
        RESOLVED: 'Resolved',
        CLOSED: 'Closed'
      };

      const tenantNotif = {
        id: generateId('notif'),
        userId: tenant ? tenant.userId : null,
        type: 'Problem Updated',
        title: `Maintenance Request ${statusLabels[newStatus] || newStatus}`,
        message: `Your report "${problem.title}" status has been updated to "${statusLabels[newStatus]}". ${ownerResponse ? `Owner: "${ownerResponse}"` : ''}`,
        referenceId: problemId,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      return {
        ...prev,
        problems: updatedProblems,
        notifications: tenant?.userId ? [tenantNotif, ...prev.notifications] : prev.notifications
      };
    });
  };

  // ================= NOTIFICATION ACTIONS =================
  const markNotificationAsRead = (id) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    }));
  };

  const markAllNotificationsAsRead = (userId) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.userId === userId ? { ...n, isRead: true } : n)
    }));
  };

  // ================= ANNOUNCEMENT ACTIONS =================
  const createAnnouncement = (announcementData) => {
    const annId = generateId('ann');
    const newAnnouncement = {
      id: annId,
      ownerId: user?.id || 'owner_001',
      title: announcementData.title,
      message: announcementData.message,
      targetType: announcementData.targetType || 'ALL', // ALL, PROPERTY, ROOM, TENANT
      targetId: announcementData.targetId || null,
      createdAt: new Date().toISOString()
    };

    // Target tenants to notify
    let targetTenants = data.tenants;
    if (announcementData.targetType === 'PROPERTY' && announcementData.targetId) {
      targetTenants = data.tenants.filter(t => t.propertyId === announcementData.targetId);
    } else if (announcementData.targetType === 'ROOM' && announcementData.targetId) {
      targetTenants = data.tenants.filter(t => t.roomId === announcementData.targetId);
    } else if (announcementData.targetType === 'TENANT' && announcementData.targetId) {
      targetTenants = data.tenants.filter(t => t.id === announcementData.targetId);
    }

    const notificationsToCreate = targetTenants.map(t => ({
      id: generateId('notif'),
      userId: t.userId,
      type: 'Owner Message',
      title: `Notice: ${announcementData.title}`,
      message: announcementData.message,
      referenceId: annId,
      isRead: false,
      createdAt: new Date().toISOString()
    }));

    setData(prev => ({
      ...prev,
      announcements: [newAnnouncement, ...prev.announcements],
      notifications: [...notificationsToCreate, ...prev.notifications]
    }));

    return newAnnouncement;
  };

  // Send rent reminder to a tenant
  const sendRentReminder = (tenantId, rentId) => {
    const tenant = data.tenants.find(t => t.id === tenantId);
    const rent = data.rents.find(r => r.id === rentId);
    if (!tenant) return false;

    const notif = {
      id: generateId('notif'),
      userId: tenant.userId,
      type: 'Rent Due',
      title: 'Rent Reminder Notice',
      message: `Dear ${tenant.name}, a reminder that your rent of ₹${(rent?.amount || tenant.monthlyRent).toLocaleString('en-IN')} for ${rent?.month || 'current month'} is due. Please settle through the app.`,
      referenceId: rentId || tenantId,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      notifications: [notif, ...prev.notifications]
    }));
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        ...data,
        allUsers: data.users,
        resetToDefaultData,
        // Property methods
        addProperty,
        updateProperty,
        deleteProperty,
        // Room methods
        addRoom,
        updateRoom,
        deleteRoom,
        setBedStatus,
        // Tenant methods
        addTenant,
        updateTenant,
        moveTenantBed,
        vacateTenant,
        deleteTenant,
        // Payment methods
        submitPayment,
        approvePayment,
        rejectPayment,
        // Problem methods
        reportProblem,
        updateProblemStatus,
        // Notification methods
        markNotificationAsRead,
        markAllNotificationsAsRead,
        // Announcement methods
        createAnnouncement,
        sendRentReminder
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Custom Hook: useTenant() — critical for requirement 38 (NO hardcoded tenant UI)
export const useTenant = () => {
  const { user } = useAuth();
  const app = useApp();

  if (!user) {
    return {
      tenant: null,
      property: null,
      room: null,
      bed: null,
      currentRent: null,
      rentHistory: [],
      paymentHistory: [],
      problems: [],
      notifications: [],
      unreadCount: 0
    };
  }

  // Find tenant record linked to authenticated user
  const tenant = app.tenants.find(
    t => t.userId === user.id ||
         (t.email && user.email && t.email.toLowerCase() === user.email.toLowerCase()) ||
         (t.phone && user.phone && t.phone === user.phone)
  ) || null;

  const property = tenant ? app.properties.find(p => p.id === tenant.propertyId) : null;
  const room = tenant ? app.rooms.find(r => r.id === tenant.roomId) : null;
  const bed = tenant ? app.beds.find(b => b.id === tenant.bedId) : null;

  // Filter rents
  const rentHistory = tenant ? app.rents.filter(r => r.tenantId === tenant.id) : [];
  // Active/latest rent (non-paid first, or latest)
  const currentRent =
    rentHistory.find(r => r.status !== 'PAID') ||
    rentHistory[0] ||
    (tenant
      ? {
          amount: tenant.monthlyRent,
          month: 'October',
          year: 2026,
          dueDate: `2026-10-${String(tenant.dueDate).padStart(2, '0')}`,
          status: 'DUE_SOON'
        }
      : null);

  // Filter payments
  const paymentHistory = tenant
    ? app.payments.filter(p => p.tenantId === tenant.id)
    : [];

  // Filter problems
  const problems = tenant
    ? app.problems.filter(p => p.tenantId === tenant.id)
    : [];

  // Filter notifications
  const notifications = app.notifications.filter(n => n.userId === user.id);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    tenant,
    property,
    room,
    bed,
    currentRent,
    rentHistory,
    paymentHistory,
    problems,
    notifications,
    unreadCount,
    // Direct actions
    submitPayment: (payload) => app.submitPayment({ ...payload, tenantId: tenant?.id }),
    reportProblem: (payload) => app.reportProblem({ ...payload, tenantId: tenant?.id }),
    markNotificationAsRead: app.markNotificationAsRead,
    markAllNotificationsAsRead: () => app.markAllNotificationsAsRead(user.id)
  };
};
