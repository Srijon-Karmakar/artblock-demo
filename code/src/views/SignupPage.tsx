import { AuthCard } from "../components/auth/AuthCard";
import { SignupForm } from "../components/auth/SignupForm";

export const SignupPage = () => (
  <div className="auth-page">
    <AuthCard
      title="Create your account"
      subtitle="Choose whether you are joining as a visitor or creator, then complete email confirmation."
    >
      <SignupForm />
    </AuthCard>
  </div>
);
