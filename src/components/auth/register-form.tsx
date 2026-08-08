"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { SocialButtons } from "@/components/auth/social-buttons";
import { apiFetch, ApiError, type LoginApiResponse } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";
import { completePendingBooking } from "@/lib/complete-pending-booking";
import { cn, getPasswordStrength, type PasswordStrengthLabel } from "@/lib/utils";

const strengthBarClass: Record<PasswordStrengthLabel, string> = {
  Weak: "bg-destructive",
  Medium: "bg-amber-500",
  Strong: "bg-primary",
};

const strengthTextClass: Record<PasswordStrengthLabel, string> = {
  Weak: "text-destructive",
  Medium: "text-amber-600",
  Strong: "text-primary",
};

const strengthBarsFilled: Record<PasswordStrengthLabel, number> = {
  Weak: 1,
  Medium: 2,
  Strong: 3,
};

const registerSchema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    phone: z.string().optional(),
    email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { applySession } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const passwordValue = watch("password") ?? "";
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (values: RegisterValues) => {
    const phone = values.phone?.trim();
    const email = values.email?.trim();

    // Phone is checked first, then email — at least one is required.
    if (!phone) {
      if (!email) {
        toast.error("Please provide either a phone number or an email address.");
        return;
      }
    }

    try {
      const data = await apiFetch<LoginApiResponse>("/register", {
        method: "POST",
        body: {
          name: values.name,
          phone: phone || undefined,
          email: email || undefined,
          password: values.password,
          password_confirmation: values.confirmPassword,
        },
      });

      // Register already returns a token + user, same as login — no need
      // to make the user sign in again.
      applySession(data);
      toast.success(data.message ?? "Account created successfully");

      const handled = await completePendingBooking(data.token);
      router.push(handled ? "/dashboard?tab=appointments" : "/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { errors?: Record<string, string[]> } | null;
        const firstFieldError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
        toast.error(firstFieldError ?? err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
      <div className="mx-auto w-full max-w-sm">
        <Link href="/" className="lg:hidden">
          <Logo className="mb-8" />
        </Link>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Join Ibnocare to manage your care in one place.
              </p>

              <div className="mt-6">
                <SocialButtons />
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your full name" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="01XXXXXXXXX" {...register("phone")} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="you@example.com" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  <p className="text-xs text-muted-foreground">Provide at least a phone number or an email.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                  {passwordValue && (
                    <div className="pt-0.5">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1.5 flex-1 rounded-full bg-secondary transition-colors",
                              i < strengthBarsFilled[strength.label] && strengthBarClass[strength.label]
                            )}
                          />
                        ))}
                      </div>
                      <p className={cn("mt-1 text-xs font-medium", strengthTextClass[strength.label])}>
                        {strength.label} password
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  <UserPlus />
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
              </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
