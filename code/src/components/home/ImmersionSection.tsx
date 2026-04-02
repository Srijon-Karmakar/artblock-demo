import { useEffect, useRef } from "react";

type ImmersionScene = {
  id: string;
  brand: string;
  words: [string, string];
  fragments: Array<{ label: string; accent?: boolean }>;
  caption: string;
  detailEyebrow: string;
  detailTitle: string;
  detailBody: string;
  points: string[];
  variant: "default" | "inverse";
  phase: "base" | "first" | "second";
};

const immersionScenes: ImmersionScene[] = [
  {
    id: "creator-space",
    brand: "Feature 01",
    words: ["LIVE", "PAGES"],
    fragments: [
      { label: "Live creator pages", accent: true },
      { label: "Own the presentation" },
      { label: "Lead with the work", accent: true },
      { label: "Launch fast on mobile" }
    ],
    caption:
      "The default scene should introduce ArtBlock through live creator pages that feel owned, editorial, and ready to convert from the first visit.",
    detailEyebrow: "Live creator pages",
    detailTitle: "The page should feel like the creator's home, not borrowed platform real estate.",
    detailBody:
      "This first state is about identity and presentation: work up front, clear hierarchy, and a mobile-first layout that makes the creator feel established instantly.",
    points: ["Profile-first storytelling", "Editorial layout on mobile", "Clear value before any paywall"],
    variant: "default",
    phase: "base"
  },
  {
    id: "member-access",
    brand: "Feature 02",
    words: ["MEMBER", "POSTS"],
    fragments: [
      { label: "Member-only publishing", accent: true },
      { label: "Private drops and notes" },
      { label: "Recurring memberships", accent: true },
      { label: "Premium access layers" }
    ],
    caption:
      "The first circle should completely shift the context into member-only publishing, where the palette flips and the message becomes access, tiers, and recurring value.",
    detailEyebrow: "Member-only publishing",
    detailTitle: "Private content should feel like a premium relationship, not just hidden posts.",
    detailBody:
      "When the first reveal takes over, ArtBlock should talk about the inner circle: member-only posts, tiered access, and the reasons supporters keep coming back.",
    points: ["First circle swaps the palette", "Recurring memberships take focus", "Private publishing leads the story"],
    variant: "inverse",
    phase: "first"
  },
  {
    id: "direct-support",
    brand: "Feature 03",
    words: ["DIRECT", "ACCESS"],
    fragments: [
      { label: "Direct audience access", accent: true },
      { label: "Messages stay personal" },
      { label: "Support feels closer", accent: true },
      { label: "Community without distance" }
    ],
    caption:
      "The second circle should bring in a new context again, then restore the default palette around direct audience access and a closer creator-to-supporter relationship.",
    detailEyebrow: "Direct audience access",
    detailTitle: "The platform should end on closeness: messages, trust, and support without platform distance.",
    detailBody:
      "After the member-only moment, the final state shifts into direct access: creators keep the relationship, supporters stay near the work, and the default colors return with the core promise.",
    points: ["Second circle restores the default palette", "Direct access becomes the message", "Ends on the ArtBlock relationship layer"],
    variant: "default",
    phase: "second"
  }
];

export const ImmersionSection = () => {
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
      const phaseOne = Math.min(Math.max((progress - 0.12) / 0.34, 0), 1);
      const phaseTwo = Math.min(Math.max((progress - 0.56) / 0.26, 0), 1);
      const contentScene = phaseTwo >= 0.4 ? "second" : phaseOne >= 0.4 ? "first" : "base";
      const baseContent = contentScene === "base" ? 1 : 0;
      const firstContent = contentScene === "first" ? 1 : 0;
      const secondContent = contentScene === "second" ? 1 : 0;

      section.style.setProperty("--immersion-progress", progress.toFixed(4));
      section.style.setProperty("--immersion-phase-one", phaseOne.toFixed(4));
      section.style.setProperty("--immersion-phase-two", phaseTwo.toFixed(4));
      section.style.setProperty("--immersion-content-base", baseContent.toFixed(4));
      section.style.setProperty("--immersion-content-first", firstContent.toFixed(4));
      section.style.setProperty("--immersion-content-second", secondContent.toFixed(4));
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
    <section
      aria-label="Animated palette transition"
      className="immersion-stage"
      id="about"
      ref={sectionRef}
    >
      <div className="immersion-stage__sticky">
        {immersionScenes.map((scene) => (
          <ImmersionLayer key={scene.id} scene={scene} />
        ))}
      </div>
    </section>
  );
};

const ImmersionLayer = ({ scene }: { scene: ImmersionScene }) => (
  <div
    className={`immersion-layer immersion-layer--${scene.variant} immersion-layer--${scene.phase}`}
  >
    <div className="immersion-orbit immersion-orbit--left">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
    <div className="immersion-orbit immersion-orbit--right">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>

    <div className="immersion-field">
      <p className="immersion-brand">{scene.brand}</p>

      <h2 className="immersion-wordmark">
        <span>{scene.words[0]}</span>
        <span>{scene.words[1]}</span>
      </h2>

      <div className="immersion-fragments">
        {scene.fragments.map((fragment) => (
          <span
            className={`immersion-fragment${fragment.accent ? " immersion-fragment--accent" : ""}`}
            key={fragment.label}
          >
            {fragment.label}
          </span>
        ))}
      </div>

      <p className="immersion-caption">{scene.caption}</p>

      <article className="immersion-panel">
        <div className="immersion-panel__eyebrow">{scene.detailEyebrow}</div>
        <div className="immersion-panel__copy">
          <h3>{scene.detailTitle}</h3>
          <p>{scene.detailBody}</p>
        </div>
        <ul className="immersion-panel__list">
          {scene.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </article>
    </div>
  </div>
);
