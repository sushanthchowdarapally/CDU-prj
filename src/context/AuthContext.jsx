import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('pg_manager_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('pg_manager_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pg_manager_auth_user');
    }
  }, [user]);

  const login = (email, password, allUsers = []) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Find matching user from users list
    const foundUser = allUsers.find(
      (u) =>
        (u.email.toLowerCase() === cleanEmail ||
         (u.secondaryEmail && u.secondaryEmail.toLowerCase() === cleanEmail)) &&
        u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      return { success: true, user: foundUser };
    }

    // Default demo fallback checks
    if (cleanEmail === 'owner@example.com' && password === 'Password123') {
      const demoOwner = {
        id: "owner_001",
        name: "Rajesh Sharma",
        email: "owner@example.com",
        phone: "+91 98450 12345",
        role: "OWNER"
      };
      setUser(demoOwner);
      return { success: true, user: demoOwner };
    }

    if ((cleanEmail === 'tenant@example.com' || cleanEmail === 'rahul@example.com') && (password === 'Password123' || password === 'Welcome@123')) {
      const demoTenant = {
        id: "user_002",
        name: "Rahul Kumar",
        email: "rahul@example.com",
        phone: "+91 98765 43210",
        role: "TENANT"
      };
      setUser(demoTenant);
      return { success: true, user: demoTenant };
    }

    return { success: false, message: 'Invalid email or password' };
  };

  const loginDirectly = (userData) => {
    setUser(userData);
  };

  const register = (userData) => {
    setUser(userData);
    return { success: true, user: userData };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isOwner: user?.role === 'OWNER',
        isTenant: user?.role === 'TENANT',
        login,
        loginDirectly,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
