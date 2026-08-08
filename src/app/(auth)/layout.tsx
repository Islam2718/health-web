"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRegister = pathname.startsWith("/register");

  return (
    <div className="relative min-h-screen flex-1 overflow-x-hidden">
      <motion.div
        animate={{ x: isRegister ? "100%" : "0%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-y-0 left-0 w-full lg:w-1/2"
      >
        <AuthBrandPanel className="h-full" />
      </motion.div>

      <motion.div
        animate={{ x: isRegister ? "-100%" : "0%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-y-0 right-0 flex w-full overflow-y-auto lg:w-1/2"
      >
        {children}
      </motion.div>
    </div>
  );
}
