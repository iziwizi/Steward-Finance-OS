import { AuthLayout } from "@/components/auth-layout";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Start your journey"
      subtitle="Create your steward account in seconds"
      footerLink={{
        text: "Already have an account?",
        linkText: "Sign in",
        href: "/login",
      }}
    >
      <SignupForm />
    </AuthLayout>
  );
}
