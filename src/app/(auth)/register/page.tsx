import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account | Ibnocare",
  description: "Create your Ibnocare account as a patient or healthcare provider.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
