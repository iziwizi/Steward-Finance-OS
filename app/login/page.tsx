import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your financial operating system"
      footerLink={{
        text: "Don't have an account?",
        linkText: "Sign up",
        href: "/signup",
      }}
    >
      {error === "confirmation_failed" && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
          That confirmation or reset link is invalid or has expired. Please try again below.
        </p>
      )}

      <LoginForm />
    </AuthLayout>
  );
}
