import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create your account – FlowForge",
  description: "Create a FlowForge account to start managing your projects.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Start organizing your team's work with FlowForge."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
