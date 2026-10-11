export const INITIAL_DATA = {
  users: [
    {
      id: "owner_001",
      name: "Rajesh Sharma",
      email: "owner@example.com",
      password: "Password123",
      phone: "+91 98450 12345",
      role: "OWNER",
      upiId: "rajeshsharma@oksbi",
      bankDetails: {
        accountName: "Rajesh Sharma",
        accountNumber: "987654321098",
        ifsc: "SBIN0001234",
        bankName: "State Bank of India",
        branch: "Koramangala, Bengaluru"
      }
    },
    {
      id: "user_002",
      name: "Rahul Kumar",
      email: "tenant@example.com", // also matches rahul@example.com
      secondaryEmail: "rahul@example.com",
      password: "Password123",
      phone: "+91 98765 43210",
      role: "TENANT"
    },
    {
      id: "user_003",
      name: "Priya Patel",
      email: "priya@example.com",
      password: "Password123",
      phone: "+91 98765 54321",
      role: "TENANT"
    },
    {
      id: "user_004",
      name: "Amit Verma",
      email: "amit@example.com",
      password: "Password123",
      phone: "+91 98765 67890",
      role: "TENANT"
    }
  ],

  properties: [
    {
      id: "prop_001",
      ownerId: "owner_001",
      name: "Sunshine PG",
      type: "PG",
      address: "124, 5th Main, 7th Cross, Koramangala 4th Block",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034",
      description: "Premium gents PG with modern amenities, 24/7 security, high-speed WiFi, and home-cooked meals.",
      floors: 3,
      createdAt: "2026-01-10T10:00:00Z"
    },
    {
      id: "prop_002",
      ownerId: "owner_001",
      name: "Greenfield Luxury Co-Living",
      type: "Co-Living",
      address: "88, 14th Main Rd, Sector 4, HSR Layout",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560102",
      description: "Co-living spaces designed for working professionals with gym, lounge, and game room.",
      floors: 4,
      createdAt: "2026-02-15T11:00:00Z"
    },
    {
      id: "prop_003",
      ownerId: "owner_001",
      name: "Silver Oak Residency",
      type: "Apartment",
      address: "42, 100 Feet Rd, HAL 2nd Stage, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      description: "Spacious independent studio and 2BHK rental apartments for long term stays.",
      floors: 2,
      createdAt: "2026-03-20T12:00:00Z"
    }
  ],

  rooms: [
    {
      id: "room_101",
      propertyId: "prop_001",
      roomNumber: "A-101",
      floor: 1,
      type: "Triple Sharing",
      capacity: 3,
      monthlyRent: 8000,
      securityDeposit: 16000,
      status: "ACTIVE"
    },
    {
      id: "room_102",
      propertyId: "prop_001",
      roomNumber: "A-102",
      floor: 1,
      type: "Double Sharing",
      capacity: 2,
      monthlyRent: 10000,
      securityDeposit: 20000,
      status: "ACTIVE"
    },
    {
      id: "room_201",
      propertyId: "prop_001",
      roomNumber: "B-201",
      floor: 2,
      type: "Single",
      capacity: 1,
      monthlyRent: 15000,
      securityDeposit: 30000,
      status: "ACTIVE"
    },
    {
      id: "room_202",
      propertyId: "prop_001",
      roomNumber: "B-202",
      floor: 2,
      type: "Double Sharing",
      capacity: 2,
      monthlyRent: 9500,
      securityDeposit: 19000,
      status: "ACTIVE"
    },
    {
      id: "room_301",
      propertyId: "prop_002",
      roomNumber: "101",
      floor: 1,
      type: "Double Sharing",
      capacity: 2,
      monthlyRent: 12000,
      securityDeposit: 24000,
      status: "ACTIVE"
    }
  ],

  beds: [
    // Room A-101 (Capacity 3)
    { id: "bed_101_1", roomId: "room_101", bedNumber: "Bed 1", status: "AVAILABLE", tenantId: null },
    { id: "bed_101_2", roomId: "room_101", bedNumber: "Bed 2", status: "OCCUPIED", tenantId: "tenant_001" },
    { id: "bed_101_3", roomId: "room_101", bedNumber: "Bed 3", status: "AVAILABLE", tenantId: null },

    // Room A-102 (Capacity 2)
    { id: "bed_102_1", roomId: "room_102", bedNumber: "Bed 1", status: "OCCUPIED", tenantId: "tenant_002" },
    { id: "bed_102_2", roomId: "room_102", bedNumber: "Bed 2", status: "AVAILABLE", tenantId: null },

    // Room B-201 (Capacity 1)
    { id: "bed_201_1", roomId: "room_201", bedNumber: "Bed 1", status: "OCCUPIED", tenantId: "tenant_003" },

    // Room B-202 (Capacity 2)
    { id: "bed_202_1", roomId: "room_202", bedNumber: "Bed 1", status: "AVAILABLE", tenantId: null },
    { id: "bed_202_2", roomId: "room_202", bedNumber: "Bed 2", status: "AVAILABLE", tenantId: null },

    // Room 101 in Greenfield (Capacity 2)
    { id: "bed_301_1", roomId: "room_301", bedNumber: "Bed 1", status: "AVAILABLE", tenantId: null },
    { id: "bed_301_2", roomId: "room_301", bedNumber: "Bed 2", status: "AVAILABLE", tenantId: null }
  ],

  tenants: [
    {
      id: "tenant_001",
      userId: "user_002",
      ownerId: "owner_001",
      propertyId: "prop_001",
      roomId: "room_101",
      bedId: "bed_101_2",
      name: "Rahul Kumar",
      email: "rahul@example.com",
      phone: "+91 98765 43210",
      emergencyContact: "+91 98765 00000",
      address: "Flat 402, Green Avenue, Delhi",
      monthlyRent: 8000,
      securityDeposit: 16000,
      dueDate: 5,
      joiningDate: "2026-08-01",
      leaseStart: "2026-08-01",
      leaseEnd: "2027-07-31",
      status: "ACTIVE"
    },
    {
      id: "tenant_002",
      userId: "user_003",
      ownerId: "owner_001",
      propertyId: "prop_001",
      roomId: "room_102",
      bedId: "bed_102_1",
      name: "Priya Patel",
      email: "priya@example.com",
      phone: "+91 98765 54321",
      emergencyContact: "+91 98765 11111",
      address: "B-12, Navrangpura, Ahmedabad, Gujarat",
      monthlyRent: 10000,
      securityDeposit: 20000,
      dueDate: 1,
      joiningDate: "2026-07-15",
      leaseStart: "2026-07-15",
      leaseEnd: "2027-07-14",
      status: "ACTIVE"
    },
    {
      id: "tenant_003",
      userId: "user_004",
      ownerId: "owner_001",
      propertyId: "prop_001",
      roomId: "room_201",
      bedId: "bed_201_1",
      name: "Amit Verma",
      email: "amit@example.com",
      phone: "+91 98765 67890",
      emergencyContact: "+91 98765 22222",
      address: "House 55, Sector 62, Noida, UP",
      monthlyRent: 15000,
      securityDeposit: 30000,
      dueDate: 10,
      joiningDate: "2026-09-01",
      leaseStart: "2026-09-01",
      leaseEnd: "2027-08-31",
      status: "ACTIVE"
    }
  ],

  rents: [
    {
      id: "rent_001",
      tenantId: "tenant_001",
      amount: 8000,
      month: "October",
      year: 2026,
      dueDate: "2026-10-05",
      status: "DUE_SOON", // DUE_SOON, PENDING, OVERDUE, PAID
      createdAt: "2026-10-01T00:00:00Z"
    },
    {
      id: "rent_002",
      tenantId: "tenant_002",
      amount: 10000,
      month: "October",
      year: 2026,
      dueDate: "2026-10-01",
      status: "OVERDUE",
      createdAt: "2026-10-01T00:00:00Z"
    },
    {
      id: "rent_003",
      tenantId: "tenant_003",
      amount: 15000,
      month: "October",
      year: 2026,
      dueDate: "2026-10-10",
      status: "PAID",
      paidAt: "2026-10-02T16:20:00Z",
      createdAt: "2026-10-01T00:00:00Z"
    },
    {
      id: "rent_004",
      tenantId: "tenant_001",
      amount: 8000,
      month: "September",
      year: 2026,
      dueDate: "2026-09-05",
      status: "PAID",
      paidAt: "2026-09-04T12:00:00Z",
      createdAt: "2026-09-01T00:00:00Z"
    },
    {
      id: "rent_005",
      tenantId: "tenant_002",
      amount: 10000,
      month: "September",
      year: 2026,
      dueDate: "2026-09-01",
      status: "PAID",
      paidAt: "2026-09-01T10:30:00Z",
      createdAt: "2026-09-01T00:00:00Z"
    }
  ],

  payments: [
    {
      id: "pay_001",
      tenantId: "tenant_003",
      rentId: "rent_003",
      ownerId: "owner_001",
      amount: 15000,
      paymentMethod: "UPI",
      transactionId: "UPI/20261002/98712345",
      paymentDate: "2026-10-02",
      screenshot: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80",
      status: "VERIFIED",
      rejectionReason: null,
      verifiedBy: "Rajesh Sharma",
      verifiedAt: "2026-10-02T16:20:00Z",
      notes: "Paid on time via PhonePe",
      createdAt: "2026-10-02T15:45:00Z"
    },
    {
      id: "pay_002",
      tenantId: "tenant_001",
      rentId: "rent_004",
      ownerId: "owner_001",
      amount: 8000,
      paymentMethod: "UPI",
      transactionId: "UPI/20260904/45189211",
      paymentDate: "2026-09-04",
      screenshot: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80",
      status: "VERIFIED",
      rejectionReason: null,
      verifiedBy: "Rajesh Sharma",
      verifiedAt: "2026-09-04T12:00:00Z",
      notes: "September rent verified",
      createdAt: "2026-09-04T11:30:00Z"
    }
  ],

  problems: [
    {
      id: "prob_001",
      tenantId: "tenant_001",
      ownerId: "owner_001",
      propertyId: "prop_001",
      roomId: "room_101",
      title: "Bathroom tap leaking",
      category: "Plumbing",
      description: "The washbasin tap has a constant drip that is wasting water and causing noise.",
      priority: "MEDIUM",
      status: "OPEN", // OPEN, IN_PROGRESS, RESOLVED, CLOSED
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80",
      ownerResponse: "",
      createdAt: "2026-10-05T14:30:00Z",
      updatedAt: "2026-10-05T14:30:00Z"
    },
    {
      id: "prob_002",
      tenantId: "tenant_002",
      ownerId: "owner_001",
      propertyId: "prop_001",
      roomId: "room_102",
      title: "WiFi router disconnecting frequently",
      category: "Internet",
      description: "The 1st floor router drops signal frequently every night after 9 PM.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      image: "",
      ownerResponse: "Airtel fiber engineer has been booked for service at 4 PM today.",
      createdAt: "2026-10-04T09:15:00Z",
      updatedAt: "2026-10-04T11:00:00Z"
    }
  ],

  notifications: [
    {
      id: "notif_001",
      userId: "user_002", // Rahul
      type: "Rent Due",
      title: "Rent Due Soon",
      message: "Your October rent of ₹8,000 is due in 3 days (05 Oct 2026). Please pay on time.",
      referenceId: "rent_001",
      isRead: false,
      createdAt: "2026-10-02T09:00:00Z"
    },
    {
      id: "notif_002",
      userId: "owner_001", // Owner
      type: "Problem Submitted",
      title: "New Problem Reported",
      message: "Rahul Kumar reported: Bathroom tap leaking (Sunshine PG, A-101).",
      referenceId: "prob_001",
      isRead: false,
      createdAt: "2026-10-05T14:30:00Z"
    },
    {
      id: "notif_003",
      userId: "user_003", // Priya
      type: "Rent Due",
      title: "Rent Overdue Notice",
      message: "Your October rent of ₹10,000 was due on 01 Oct 2026 and is now overdue.",
      referenceId: "rent_002",
      isRead: false,
      createdAt: "2026-10-02T10:00:00Z"
    }
  ],

  announcements: [
    {
      id: "ann_001",
      ownerId: "owner_001",
      title: "Water Tank Cleaning Notice",
      message: "Water supply will be temporarily turned off tomorrow between 10:00 AM and 1:00 PM for overhead tank cleaning and sanitization.",
      targetType: "PROPERTY", // ALL, PROPERTY, ROOM, TENANT
      targetId: "prop_001",
      createdAt: "2026-10-04T12:00:00Z"
    }
  ]
};
