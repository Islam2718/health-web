"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRegister = pathname.startsWith("/register");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // The left/right slide-swap only makes sense on the desktop split panel,
  // where each pane is 50% wide so a 100% shift swaps them into place. Below
  // lg both panes are full width and the brand panel renders empty (it's
  // `hidden lg:flex`), so sliding by 100% there pushed the form fully
  // off-screen instead of swapping — keep mobile panes pinned at x:0.
  const brandX = isDesktop && isRegister ? "100%" : "0%";
  const formX = isDesktop && isRegister ? "-100%" : "0%";

  return (
    <div className="relative min-h-screen flex-1 overflow-x-hidden">
      <motion.div
        animate={{ x: brandX }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-y-0 left-0 w-full lg:w-1/2"
      >
        <AuthBrandPanel className="h-full" />
      </motion.div>

      <motion.div
        animate={{ x: formX }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-y-0 right-0 flex w-full overflow-y-auto lg:w-1/2"
      >
        {children}
      </motion.div>
    </div>
  );
}
