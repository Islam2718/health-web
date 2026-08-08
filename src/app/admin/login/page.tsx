"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "motion/react";
import { AlertCircle, Eye, EyeOff, KeyRound, LogIn, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { AdminLoginBackground } from "@/components/admin/admin-login-background";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAdminAuth } from "@/context/admin-auth-context";

const TEST_CREDENTIALS = { identifier: "01710001337", password: "123456" };

const validationSchema = Yup.object({
  identifier: Yup.string().required("Phone or email is required"),
  password: Yup.string().min(4, "Password must be at least 4 characters").required("Password is required"),
});

function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { login } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const formik = useFormik({
    initialValues: { identifier: "", password: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setAuthError(null);
      const result = await login(values.identifier, values.password);
      setSubmitting(false);
      if (!result.success) {
        setAuthError(result.message ?? "Invalid credentials. Please try again.");
        return;
      }
      router.push(searchParams.get("from") || "/admin");
    },
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <AdminLoginBackground />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-white/10 bg-card/95 shadow-2xl backdrop-blur-xl">
          <CardHeader className="items-center gap-3 text-center">
            <Link href="/" className="w-fit">
              <Logo />
            </Link>
            <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <ShieldCheck className="size-3.5" />
              Admin Console
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Sign in to Admin Console</h1>
              <p className="text-sm text-muted-foreground">Restricted access — authorized personnel only.</p>
            </div>
          </CardHeader>

          <CardContent>
            <button
              type="button"
              onClick={() => {
                formik.setValues(TEST_CREDENTIALS);
                setAuthError(null);
              }}
              className="mb-6 flex w-full items-center gap-2.5 rounded-xl border border-dashed border-primary/40 bg-secondary/50 px-4 py-3 text-left text-xs text-muted-foreground transition-colors hover:border-primary/70 hover:bg-secondary"
            >
              <Sparkles className="size-4 shrink-0 text-primary" />
              <span>
                <span className="font-semibold text-foreground">Test credentials</span> —{" "}
                {TEST_CREDENTIALS.identifier} / {TEST_CREDENTIALS.password}. Tap to autofill.
              </span>
            </button>

            <form onSubmit={formik.handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="identifier">Phone or Email</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  placeholder="01710001337"
                  value={formik.values.identifier}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete="username"
                />
                {formik.touched.identifier && formik.errors.identifier && (
                  <p className="text-xs text-destructive">{formik.errors.identifier}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    autoComplete="current-password"
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
                {formik.touched.password && formik.errors.password && (
                  <p className="text-xs text-destructive">{formik.errors.password}</p>
                )}
              </div>

              {authError && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={formik.isSubmitting}>
                <LogIn />
                {formik.isSubmitting ? "Signing in..." : "Sign In to Admin"}
              </Button>
            </form>

            <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground">
              <KeyRound className="size-3.5" />
              <Link href="/" className="font-semibold text-primary hover:underline">
                Back to main site
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
