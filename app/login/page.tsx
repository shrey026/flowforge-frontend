import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in – FlowForge",
  description: "Log in to your FlowForge account.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Log in to continue to FlowForge."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
