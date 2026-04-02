import { useEffect, useRef, useState } from "react";

const consoleModes = [
  {
    id: "launch",
    label: "Launch Surface",
    wordmark: "ARTBLOCK",
    eyebrow: "Creator page system",
    title: "Shape the page before you ask for support.",
    body:
      "Lead with story, visual identity, and a clear membership proposition so the first visit already feels intentional.",
    stats: [
      { label: "Setup flow", value: "18 min" },
      { label: "Hero variants", value: "12" }
    ],
    points: ["Story-first profile layout", "Offer stack with tiers", "Mobile conversion path"]
  },
  {
    id: "memberships",
    label: "Member Engine",
    wordmark: "MEMBER",
    eyebrow: "Recurring support loop",
    title: "Keep memberships active after the first conversion.",
    body:
      "Private posts, direct messaging, and structured access make support feel like belonging instead of a one-time checkout.",
    stats: [
      { label: "Renewal rate", value: "74%" },
      { label: "Member touchpoints", value: "5" }
    ],
    points: ["Member-only publishing", "Upgrade moments in context", "Closer creator-to-fan contact"]
  },
  {
    id: "insights",
    label: "Operator View",
    wordmark: "SIGNAL",
    eyebrow: "Business visibility",
    title: "Give creators a clearer read on momentum.",
    body:
      "The product should surface what is converting, what is retaining, and where the next revenue move should happen.",
    stats: [
      { label: "Live metrics", value: "24/7" },
      { label: "Signals tracked", value: "9" }
    ],
    points: ["Support trend snapshots", "Publishing confidence cues", "Retention-first product decisions"]
  }
];

export const SignalConsole = () => {
  const [activeId, setActiveId] = useState(consoleModes[0].id);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const activeMode = consoleModes.find((mode) => mode.id === activeId) ?? consoleModes[0];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`signal-console signal-console--${activeMode.id} reveal ${isVisible ? "visible" : ""}`}
      aria-label="ArtBlock experience console"
      ref={sectionRef}
    >
      <div className="signal-console__surface">
        <div aria-hidden="true" className="signal-console__halo signal-console__halo--one" />
        <div aria-hidden="true" className="signal-console__halo signal-console__halo--two" />

        <div className="signal-console__header">
          <span className="eyebrow">Explore the system</span>
          <p>
            Tap through the core parts of ArtBlock and preview a cleaner, fuller-screen product
            rhythm after the hero moment.
          </p>
        </div>

        <div className="signal-console__tabs" aria-label="Experience modes">
          {consoleModes.map((mode, index) => {
            const isActive = mode.id === activeMode.id;

            return (
              <button
                className={`signal-console__tab ${isActive ? "signal-console__tab--active" : ""}`}
                aria-pressed={isActive}
                key={mode.id}
                onClick={() => setActiveId(mode.id)}
                type="button"
              >
                <small>{`0${index + 1}`}</small>
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        <div className="signal-console__body">
          <article className="signal-console__panel">
            <div aria-hidden="true" className="signal-console__watermark">
              {activeMode.wordmark}
            </div>

            <div className="signal-console__copy">
              <span className="signal-console__eyebrow">{activeMode.eyebrow}</span>
              <h3>{activeMode.title}</h3>
              <p>{activeMode.body}</p>
            </div>
          </article>

          <div className="signal-console__rail">
            <div className="signal-console__stats">
              {activeMode.stats.map((stat) => (
                <article className="signal-console__stat" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </article>
              ))}
            </div>

            <ul className="signal-console__points">
              {activeMode.points.map((point, index) => (
                <li key={point}>
                  <small>{`0${index + 1}`}</small>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
