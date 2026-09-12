/**
 * Global User & Profile Context
 * Manages logged-in user state, circular profile photo, profile settings modal, and persistent local updates.
 */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  updateAvatar: (newUrl: string | null) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  logout: () => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const defaultUser: UserProfile = {
  id: "user-1",
  name: "Vishnu",
  email: "user@mpss.com",
  role: "Garment Quality Auditor",
  avatarUrl: null,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("user_profile");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(defaultUser);
      }
    } else {
      // Default to logged-in user Vishnu for demonstration
      setUser(defaultUser);
    }
  }, []);

  useEffect(() => {
    if (isMounted && user) {
      localStorage.setItem("user_profile", JSON.stringify(user));
    }
  }, [user, isMounted]);

  const updateAvatar = (newUrl: string | null) => {
    setUser((prev) => (prev ? { ...prev, avatarUrl: newUrl } : null));
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user_profile");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  };

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        updateAvatar,
        updateProfile,
        logout,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
