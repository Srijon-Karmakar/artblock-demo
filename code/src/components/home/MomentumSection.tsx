import { useEffect, useRef } from "react";

const momentumStats = [
  { label: "Creator pages", value: "12.4k" },
  { label: "Renewal rate", value: "74%" },
  { label: "Time to launch", value: "18 min" }
];

const momentumSteps = [
  {
    title: "Lead with identity",
    body: "Open with voice, visuals, and why the work matters before asking for payment."
  },
  {
    title: "Make support legible",
    body: "Frame tiers, drops, and access so membership feels premium instead of transactional."
  },
  {
    title: "Keep the loop warm",
    body: "Turn the first pledge into an ongoing relationship through private publishing and direct access."
  }
];

export const MomentumSection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return undefined;
    }

    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(rect.height - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / travel, 0), 1);
      section.style.setProperty("--momentum-progress", progress.toFixed(4));
    };

    const scheduleUpdate = () => {
      if (frame !== 0) {
        return;
      }

      frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);

      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <section className="momentum-stage" ref={sectionRef}>
      <div className="momentum-stage__sticky">
        <div className="momentum-ambient" aria-hidden="true" />

        <article className="momentum-sheet">
          <div className="momentum-sheet__intro">
            <span className="eyebrow">Why ArtBlock fits</span>
            <h2>From first visit to recurring support, the page should keep rising in value.</h2>
            <p>
              ArtBlock is strongest when the experience moves like one clean system:
              identity, membership offer, and ongoing access all building toward a direct
              creator-to-audience relationship.
            </p>
          </div>

          <div className="momentum-sheet__grid">
            <div className="momentum-metrics">
              {momentumStats.map((stat) => (
                <article className="momentum-metric" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </article>
              ))}
            </div>

            <div className="momentum-track">
              {momentumSteps.map((step, index) => (
                <article className="momentum-step" key={step.title}>
                  <span>{`0${index + 1}`}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
