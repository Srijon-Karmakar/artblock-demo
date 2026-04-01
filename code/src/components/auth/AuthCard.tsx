import type { PropsWithChildren } from "react";

type AuthCardProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export const AuthCard = ({ title, subtitle, children }: AuthCardProps) => (
  <section className="auth-card">
    <div className="auth-card__header">
      <span className="section-heading__eyebrow">Secure Access</span>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
    {children}
  </section>
);
