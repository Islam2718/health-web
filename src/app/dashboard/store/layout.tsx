"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ClipboardList,
  LayoutDashboard,
  Pill,
  Receipt,
  ShoppingCart,
  Store,
} from "lucide-react";
import { Logo } from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
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
import { useAuth } from "@/context/auth-context";
import { StoreProvider } from "@/context/store-context";
import { OrderInvoicePrintArea } from "@/components/dashboard/store/order-invoice-print-area";

const navItems = [
  { label: "Dashboard", href: "/dashboard/store", icon: LayoutDashboard },
  { label: "Shop", href: "/dashboard/store/shop", icon: Store },
  { label: "Products", href: "/dashboard/store/products", icon: Pill },
  { label: "Stock", href: "/dashboard/store/stock", icon: Receipt },
  { label: "POS", href: "/dashboard/store/pos", icon: ShoppingCart },
  { label: "Orders", href: "/dashboard/store/orders", icon: ClipboardList },
];

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
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
    <StoreProvider>
      <div className="store-shell">
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <Link href="/dashboard/store" className="flex items-center px-2 py-1.5">
                <Logo size="sm" className="group-data-[collapsible=icon]:[&_span]:hidden" />
              </Link>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Store Panel</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => {
                      const isActive =
                        item.href === "/dashboard/store"
                          ? pathname === "/dashboard/store"
                          : pathname.startsWith(item.href);
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
          </Sidebar>

          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-5" />
              <p className="text-sm font-medium text-foreground">Store Panel</p>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                className="ml-auto text-muted-foreground hover:text-foreground"
                render={<Link href="/dashboard" />}
              >
                <ArrowLeft />
                Back to Dashboard
              </Button>
            </header>
            <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
          </SidebarInset>
        </SidebarProvider>

        <OrderInvoicePrintArea />
      </div>
    </StoreProvider>
  );
}
