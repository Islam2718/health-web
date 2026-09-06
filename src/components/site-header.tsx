"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Ambulance,
  CalendarDays,
  ClipboardList,
  Droplet,
  FileText,
  FlaskConical,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Pill,
  Receipt,
  ShoppingCart,
  Sparkles,
  Store,
  User,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { careLinks } from "@/lib/mock-data";
import { useAuth } from "@/context/auth-context";
import { getRoles } from "@/lib/doctor-profile";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isBloodDonor, hasAmbulance, hasStore } = useAuth();
  // The API represents multi-role accounts as a comma-separated type string
  // (e.g. "USER,DOCTOR") — a plain `type === "USER"` check fails for those,
  // which was hiding these links entirely for every doctor account. Matches
  // the dashboard sidebar's own role parsing.
  const roles = getRoles(user?.type);
  const isPatient = roles.includes("PATIENT") || roles.includes("USER");
  const isDoctor = roles.includes("DOCTOR");

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-5 xl:flex xl:gap-6">
          {careLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group relative whitespace-nowrap py-1.5 text-sm font-medium"
              >
                <span
                  className={cn(
                    "transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {link.label}
                </span>
                <span
                  className={cn(
                    "absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100",
                    isActive && "scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="flex items-center gap-2 rounded-full border border-border py-1 pr-3 pl-1 transition-colors hover:border-primary/40" />
                }
              >
                <UserAvatar name={user?.name ?? "U"} imageUrl={user?.profileImage} gender={user?.gender} size="sm" />
                <span className="max-w-32 truncate text-sm font-medium text-foreground">{user?.name ?? ""}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem render={<Link href="/dashboard" />}>
                  <User className="size-4 text-primary" />
                  Profile
                </DropdownMenuItem>
                {isPatient && (
                  <>
                    <DropdownMenuItem
                      render={<Link href={`/dashboard?tab=${isDoctor ? "my-appointments" : "appointments"}`} />}
                    >
                      <CalendarDays className="size-4 text-primary" />
                      {isDoctor ? "My Appointments" : "Appointments"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={<Link href={`/dashboard?tab=${isDoctor ? "my-prescriptions" : "prescriptions"}`} />}
                    >
                      <FileText className="size-4 text-primary" />
                      {isDoctor ? "My Prescriptions" : "Prescriptions"}
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/dashboard?tab=diagnostic-reports" />}>
                      <FlaskConical className="size-4 text-primary" />
                      Diagnostic Reports
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/dashboard?tab=posts" />}>
                      <MessageCircle className="size-4 text-primary" />
                      My Posts
                    </DropdownMenuItem>
                    {isBloodDonor && (
                      <DropdownMenuItem render={<Link href="/dashboard?tab=blood-donor" />}>
                        <Droplet className="size-4 text-primary" />
                        Blood Donor
                      </DropdownMenuItem>
                    )}
                    {hasAmbulance && (
                      <DropdownMenuItem render={<Link href="/dashboard?tab=ambulances" />}>
                        <Ambulance className="size-4 text-primary" />
                        My Ambulances
                      </DropdownMenuItem>
                    )}
                    {hasStore && (
                      <>
                        <DropdownMenuItem render={<Link href="/dashboard?tab=store" />}>
                          <Store className="size-4 text-primary" />
                          Shop
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href="/dashboard?tab=store-products" />}>
                          <Pill className="size-4 text-primary" />
                          Products
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href="/dashboard?tab=store-stock" />}>
                          <Receipt className="size-4 text-primary" />
                          Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href="/dashboard?tab=pos" />}>
                          <ShoppingCart className="size-4 text-primary" />
                          POS
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href="/dashboard?tab=store-orders" />}>
                          <ClipboardList className="size-4 text-primary" />
                          My Orders
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={async () => {
                    await logout();
                    router.push("/login");
                  }}
                >
                  <LogOut className="size-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
                <LogIn /> Sign In
              </Button>
              <Button nativeButton={false} render={<Link href="/register" />}>
                <Sparkles /> Get Started
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {careLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                      isActive ? "bg-secondary text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <link.icon className="size-4 text-primary" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 flex flex-col gap-2 px-4">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/dashboard" onClick={() => setOpen(false)} />}
                  >
                    <User /> Profile
                  </Button>
                  {isPatient && (
                    <>
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={
                          <Link
                            href={`/dashboard?tab=${isDoctor ? "my-appointments" : "appointments"}`}
                            onClick={() => setOpen(false)}
                          />
                        }
                      >
                        <CalendarDays /> {isDoctor ? "My Appointments" : "Appointments"}
                      </Button>
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={
                          <Link
                            href={`/dashboard?tab=${isDoctor ? "my-prescriptions" : "prescriptions"}`}
                            onClick={() => setOpen(false)}
                          />
                        }
                      >
                        <FileText /> {isDoctor ? "My Prescriptions" : "Prescriptions"}
                      </Button>
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link href="/dashboard?tab=diagnostic-reports" onClick={() => setOpen(false)} />}
                      >
                        <FlaskConical /> Diagnostic Reports
                      </Button>
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link href="/dashboard?tab=posts" onClick={() => setOpen(false)} />}
                      >
                        <MessageCircle /> My Posts
                      </Button>
                      {isBloodDonor && (
                        <Button
                          variant="outline"
                          nativeButton={false}
                          render={<Link href="/dashboard?tab=blood-donor" onClick={() => setOpen(false)} />}
                        >
                          <Droplet /> Blood Donor
                        </Button>
                      )}
                      {hasAmbulance && (
                        <Button
                          variant="outline"
                          nativeButton={false}
                          render={<Link href="/dashboard?tab=ambulances" onClick={() => setOpen(false)} />}
                        >
                          <Ambulance /> My Ambulances
                        </Button>
                      )}
                      {hasStore && (
                        <>
                          <Button
                            variant="outline"
                            nativeButton={false}
                            render={<Link href="/dashboard?tab=store" onClick={() => setOpen(false)} />}
                          >
                            <Store /> Shop
                          </Button>
                          <Button
                            variant="outline"
                            nativeButton={false}
                            render={<Link href="/dashboard?tab=store-products" onClick={() => setOpen(false)} />}
                          >
                            <Pill /> Products
                          </Button>
                          <Button
                            variant="outline"
                            nativeButton={false}
                            render={<Link href="/dashboard?tab=store-stock" onClick={() => setOpen(false)} />}
                          >
                            <Receipt /> Stock
                          </Button>
                          <Button
                            variant="outline"
                            nativeButton={false}
                            render={<Link href="/dashboard?tab=pos" onClick={() => setOpen(false)} />}
                          >
                            <ShoppingCart /> POS
                          </Button>
                          <Button
                            variant="outline"
                            nativeButton={false}
                            render={<Link href="/dashboard?tab=store-orders" onClick={() => setOpen(false)} />}
                          >
                            <ClipboardList /> My Orders
                          </Button>
                        </>
                      )}
                    </>
                  )}
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={async () => {
                      await logout();
                      setOpen(false);
                      router.push("/login");
                    }}
                  >
                    <LogOut /> Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/login" onClick={() => setOpen(false)} />}
                  >
                    <LogIn /> Sign In
                  </Button>
                  <Button nativeButton={false} render={<Link href="/register" onClick={() => setOpen(false)} />}>
                    <Sparkles /> Get Started
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
