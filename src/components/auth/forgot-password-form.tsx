"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Eye, EyeOff, KeyRound, Send, ShieldCheck, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { apiFetch, ApiError } from "@/lib/api-client";
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

const identifierSchema = z.object({
  identifier: z.string().min(3, "Enter your email or phone number"),
});
type IdentifierValues = z.infer<typeof identifierSchema>;

const otpSchema = z.object({
  otp: z.string().min(1, "Enter the OTP code"),
});
type OtpValues = z.infer<typeof otpSchema>;

const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

function extractErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    const body = err.body as { errors?: Record<string, string[]> } | null;
    const firstFieldError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    return firstFieldError ?? err.message;
  }
  return fallback;
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const identifierForm = useForm<IdentifierValues>({ resolver: zodResolver(identifierSchema) });
  const otpForm = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const passwordValue = passwordForm.watch("password") ?? "";
  const strength = getPasswordStrength(passwordValue);

  const sendOtp = async (values: IdentifierValues) => {
    try {
      const data = await apiFetch<{ message: string; otp: number | string }>("/auth/otp-send", {
        method: "POST",
        body: { identifier: values.identifier },
      });
      setIdentifier(values.identifier);
      setDevOtp(String(data.otp));
      toast.success(data.message ?? "OTP sent successfully");
      setStep(2);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not send OTP. Please try again."));
    }
  };

  const verifyOtp = async (values: OtpValues) => {
    try {
      const data = await apiFetch<{ message: string }>("/auth/otp-verify", {
        method: "POST",
        body: { identifier, otp: values.otp },
      });
      toast.success(data.message ?? "OTP verified");
      setStep(3);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Invalid or expired OTP. Please try again."));
    }
  };

  const resetPassword = async (values: PasswordValues) => {
    try {
      const data = await apiFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: { identifier, password: values.password },
      });
      toast.success(data.message ?? "Password reset successful");
      router.push("/login");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not reset password. Please try again."));
    }
  };

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <Link href="/">
          <Logo className="mb-8 justify-center" />
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <button
            onClick={() => (step === 1 ? router.push("/login") : setStep((s) => (s - 1) as 1 | 2 | 3))}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {step === 1 ? "Back to sign in" : "Back"}
          </button>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step-1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Reset your password</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Enter your email or phone number and we&apos;ll send you an OTP code.
                </p>

                <form onSubmit={identifierForm.handleSubmit(sendOtp)} className="mt-8 space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="identifier">Email or Phone</Label>
                    <Input
                      id="identifier"
                      placeholder="you@example.com or 01XXXXXXXXX"
                      {...identifierForm.register("identifier")}
                    />
                    {identifierForm.formState.errors.identifier && (
                      <p className="text-xs text-destructive">
                        {identifierForm.formState.errors.identifier.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={identifierForm.formState.isSubmitting}>
                    <Send />
                    {identifierForm.formState.isSubmitting ? "Sending..." : "Send OTP"}
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Enter OTP</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  We sent a code to <span className="font-medium text-foreground">{identifier}</span>
                </p>

                {devOtp && (
                  <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-dashed border-primary/40 bg-secondary/50 px-4 py-3 text-xs text-muted-foreground">
                    <Sparkles className="size-4 shrink-0 text-primary" />
                    <span>
                      SMS/Email delivery isn&apos;t connected yet — your OTP is{" "}
                      <span className="font-semibold text-foreground">{devOtp}</span>.
                    </span>
                  </div>
                )}

                <form onSubmit={otpForm.handleSubmit(verifyOtp)} className="mt-6 space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="otp">OTP Code</Label>
                    <Input id="otp" placeholder="Enter the code" {...otpForm.register("otp")} />
                    {otpForm.formState.errors.otp && (
                      <p className="text-xs text-destructive">{otpForm.formState.errors.otp.message}</p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={otpForm.formState.isSubmitting}>
                    <ShieldCheck />
                    {otpForm.formState.isSubmitting ? "Verifying..." : "Verify OTP"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => identifierForm.handleSubmit(sendOtp)()}
                    className="w-full text-center text-sm font-medium text-primary hover:underline"
                  >
                    Resend OTP
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Set a new password</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Choose a new password for your account.</p>

                <form onSubmit={passwordForm.handleSubmit(resetPassword)} className="mt-8 space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10"
                        {...passwordForm.register("password")}
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
                    {passwordForm.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {passwordForm.formState.errors.password.message}
                      </p>
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
                      {...passwordForm.register("confirmPassword")}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={passwordForm.formState.isSubmitting}>
                    <KeyRound />
                    {passwordForm.formState.isSubmitting ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
