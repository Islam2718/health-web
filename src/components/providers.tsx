"use client";

import { AuthProvider } from "@/context/auth-context";
import { AdminAuthProvider } from "@/context/admin-auth-context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        {children}
        <Toaster position="top-right" richColors />
      </AdminAuthProvider>
    </AuthProvider>
  );
}
