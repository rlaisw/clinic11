"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

type UserRole = "doctor" | "nurse" | "admin" | null;

interface UserContextType {
  role: UserRole;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  role: null,
  isLoading: true,
});

function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken") || localStorage.getItem("token");
  }
  return null;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const currentToken = getToken();
    setToken(currentToken);
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!token) {
        setRole(null);
        setIsLoading(false);
        return;
      }
      try {
        const response = await apiClient.get("/auth/user/");
        setRole(response.data.role || null);
      } catch {
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [token]);

  useEffect(() => {
    const handleStorage = () => {
      const currentToken = getToken();
      setToken(currentToken);
      setIsLoading(true);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth:login", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth:login", handleStorage);
    };
  }, []);

  return (
    <UserContext.Provider value={{ role, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

export function useUserRole() {
  const { role } = useUser();
  return role;
}