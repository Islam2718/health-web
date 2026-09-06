"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Ambulance,
  Building2,
  Factory,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Pill,
  PillBottle,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import { Logo } from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminAuth } from "@/context/admin-auth-context";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Doctors", href: "/admin/doctors", icon: Stethoscope },
  { label: "Patients", href: "/admin/patients", icon: UserRound },
  { label: "Hospitals", href: "/admin/hospitals", icon: Building2 },
  { label: "Diagnostic Centres", href: "/admin/diagnostic-centres", icon: FlaskConical },
  { label: "Ambulance Service", href: "/admin/ambulances", icon: Ambulance },
  { label: "Medical Store", href: "/admin/medical-stores", icon: Pill },
  { label: "Medicine Companies", href: "/admin/medicine-companies", icon: Factory },
  { label: "Medicines", href: "/admin/medicines", icon: PillBottle },
  { label: "Users", href: "/admin/users", icon: Users },
];

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const { admin, isAuthenticated, isLoading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="size-8 rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/admin" className="flex items-center px-2 py-1.5">
            <Logo size="sm" className="group-data-[collapsible=icon]:[&_span]:hidden" />
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Avatar>
              {admin?.profileImage && <AvatarImage src={admin.profileImage} alt={admin.name} />}
              <AvatarFallback>{admin?.name?.charAt(0).toUpperCase() ?? "A"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{admin?.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{admin?.email ?? admin?.phone}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="justify-start text-sidebar-foreground hover:text-destructive"
            onClick={async () => {
              await logout();
              router.push("/admin/login");
            }}
          >
            <LogOut />
            <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <p className="text-sm font-medium text-foreground">Admin Panel</p>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
