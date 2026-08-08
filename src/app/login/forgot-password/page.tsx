import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password | Ibnocare",
  description: "Reset your Ibnocare account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
