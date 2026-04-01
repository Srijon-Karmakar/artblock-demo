import { SectionHeading } from "../common/SectionHeading";

const features = [
  "Supabase email/password auth with user role metadata",
  "Protected dashboard and auth state bootstrap",
  "Profiles table, trigger, and RLS policies for PostgreSQL",
  "Responsive landing page with header, CTA, about, and footer",
  "Clear environment setup for deployment and local development",
  "Type-safe frontend integration with a database contract"
];

export const FeaturesSection = () => (
  <section className="content-section" id="features">
    <SectionHeading
      eyebrow="Core Features"
      title="What the first production slice already covers."
      description="The current scope is focused: solid auth, clean information architecture, and a baseline frontend that can grow into the larger system from your HLD."
    />

    <div className="pill-grid">
      {features.map((feature) => (
        <div className="pill-card" key={feature}>
          {feature}
        </div>
      ))}
    </div>
  </section>
);
