"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CalendarDays, FileText, FlaskConical, LogIn, LogOut, Menu, Sparkles, User } from "lucide-react";
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

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const role = user?.type?.toUpperCase() ?? "";
  // Matches the dashboard sidebar's own patient-vs-other-role gating.
  const isPatient = role === "PATIENT" || role === "USER";

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
                    <DropdownMenuItem render={<Link href="/dashboard?tab=appointments" />}>
                      <CalendarDays className="size-4 text-primary" />
                      Appointments
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/dashboard?tab=prescriptions" />}>
                      <FileText className="size-4 text-primary" />
                      Prescriptions
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/dashboard?tab=diagnostic-reports" />}>
                      <FlaskConical className="size-4 text-primary" />
                      Diagnostic Reports
                    </DropdownMenuItem>
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
                        render={<Link href="/dashboard?tab=appointments" onClick={() => setOpen(false)} />}
                      >
                        <CalendarDays /> Appointments
                      </Button>
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link href="/dashboard?tab=prescriptions" onClick={() => setOpen(false)} />}
                      >
                        <FileText /> Prescriptions
                      </Button>
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link href="/dashboard?tab=diagnostic-reports" onClick={() => setOpen(false)} />}
                      >
                        <FlaskConical /> Diagnostic Reports
                      </Button>
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
