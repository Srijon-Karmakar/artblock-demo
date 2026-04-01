import { SectionHeading } from "../common/SectionHeading";

const items = [
  {
    title: "Mobile-first navigation",
    body: "The layout prioritizes touch targets, stacked content, and readable forms before scaling upward."
  },
  {
    title: "Role-aware onboarding",
    body: "Visitors and creators follow the same auth surface, but the system stores role metadata and gates the dashboard accordingly."
  },
  {
    title: "Production-oriented baseline",
    body: "Supabase auth, PostgreSQL-backed profiles, RLS policies, and route protection are wired in from day one."
  }
];

export const AboutSection = () => (
  <section className="content-section" id="about">
    <SectionHeading
      eyebrow="About"
      title="A minimal system with real backend boundaries."
      description="This foundation keeps the frontend clean while letting Supabase handle authentication, profile storage, and row-level access control."
    />

    <div className="feature-grid">
      {items.map((item) => (
        <article className="feature-card" key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  </section>
);
