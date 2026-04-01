import { AuthCard } from "../components/auth/AuthCard";
import { LoginForm } from "../components/auth/LoginForm";

export const LoginPage = () => (
  <div className="auth-page">
    <AuthCard
      title="Login to your ArtBlock account"
      subtitle="Use your registered email and password to continue."
    >
      <LoginForm />
    </AuthCard>
  </div>
);
