"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = authApi.getToken();
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return <>{children}</>;
}