import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

type FeaturedCreator = {
  slug: string;
  displayName: string;
  headline: string;
  category: string;
  monthlySupporters: number;
  startingPrice: number;
  initials: string;
};

type CreatorSpotlightSectionProps = {
  creators: FeaturedCreator[];
  isLoading: boolean;
};

const categoryThemes = [
  {
    aura: "linear-gradient(135deg, rgba(255, 111, 76, 0.9), rgba(255, 196, 107, 0.65))",
    surface: "linear-gradient(160deg, rgba(35, 19, 17, 0.96), rgba(89, 42, 28, 0.92))"
  },
  {
    aura: "linear-gradient(135deg, rgba(6, 221, 214, 0.88), rgba(35, 120, 180, 0.64))",
    surface: "linear-gradient(160deg, rgba(17, 27, 38, 0.96), rgba(23, 64, 86, 0.92))"
  },
  {
    aura: "linear-gradient(135deg, rgba(244, 154, 109, 0.86), rgba(236, 219, 191, 0.68))",
    surface: "linear-gradient(160deg, rgba(47, 32, 26, 0.96), rgba(110, 74, 56, 0.92))"
  },
  {
    aura: "linear-gradient(135deg, rgba(199, 125, 255, 0.84), rgba(255, 87, 145, 0.7))",
    surface: "linear-gradient(160deg, rgba(28, 18, 42, 0.96), rgba(78, 28, 78, 0.92))"
  }
];

export const CreatorSpotlightSection = ({
  creators,
  isLoading
}: CreatorSpotlightSectionProps) => {
  const [activeSlug, setActiveSlug] = useState<string | null>(creators[0]?.slug ?? null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const heroCardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (creators.length === 0) {
      setActiveSlug(null);
      return;
    }

    setActiveSlug((current) =>
      current && creators.some((creator) => creator.slug === current) ? current : creators[0].slug
    );
  }, [creators]);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = heroCardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const mx = (x - centerX) / centerX;
    const my = (y - centerY) / centerY;

    card.style.setProperty("--mx", mx.toFixed(3));
    card.style.setProperty("--my", my.toFixed(3));
    card.style.setProperty("--amx", Math.abs(mx).toFixed(3));
    card.style.setProperty("--amy", Math.abs(my).toFixed(3));
  };

  const handleMouseLeave = () => {
    const card = heroCardRef.current;
    if (!card) return;
    card.style.setProperty("--mx", "0");
    card.style.setProperty("--my", "0");
  };

  const activeIndex = Math.max(
    creators.findIndex((creator) => creator.slug === activeSlug),
    0
  );
  const activeCreator = creators[activeIndex] ?? null;
  const theme = categoryThemes[activeIndex % categoryThemes.length];

  const stackedCreators = useMemo(() => {
    if (!activeCreator) {
      return creators;
    }

    return [
      activeCreator,
      ...creators.filter((creator) => creator.slug !== activeCreator.slug)
    ];
  }, [activeCreator, creators]);

  return (
    <section
      className={`creator-spotlight landing-width reveal ${isVisible ? "visible" : ""}`}
      id="features"
      ref={sectionRef}
    >
      <div className="creator-spotlight__header">
        <div>
          <span className="eyebrow">Discover creators</span>
          <h2>Profiles that feel alive before you even open them.</h2>
        </div>
        <p className="section-note">
          Instead of a plain grid, the section now behaves like a curated spotlight with
          live creators pulled from the current dataset.
        </p>
      </div>

      {isLoading || !activeCreator ? (
        <div className="creator-spotlight__skeleton">
          <div className="creator-spotlight__skeleton-main">
            <div className="skeleton-line skeleton-small" />
            <div className="skeleton-line skeleton-large" />
            <div className="skeleton-line" />
          </div>
          <div className="creator-spotlight__skeleton-side">
            {Array.from({ length: 3 }).map((_, index) => (
              <article className="creator-card-skeleton" key={`creator-spotlight-skeleton-${index}`}>
                <div className="skeleton-line skeleton-small" />
                <div className="skeleton-line skeleton-large" />
                <div className="skeleton-line" />
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="creator-spotlight__stage" style={buildThemeStyle(theme)}>
          <div className="creator-spotlight__backdrop" aria-hidden="true">
            <span className="creator-spotlight__glow creator-spotlight__glow--one" />
            <span className="creator-spotlight__glow creator-spotlight__glow--two" />
            <span className="creator-spotlight__mesh" />
          </div>

          <div className="creator-spotlight__rail" aria-label="Featured creators">
            {stackedCreators.map((creator, index) => {
              const isActive = creator.slug === activeCreator.slug;

              return (
                <button
                  className={`creator-spotlight__selector ${
                    isActive ? "creator-spotlight__selector--active" : ""
                  }`}
                  key={creator.slug}
                  onClick={() => setActiveSlug(creator.slug)}
                  onFocus={() => setActiveSlug(creator.slug)}
                  onMouseEnter={() => setActiveSlug(creator.slug)}
                  style={{ "--creator-order": index } as CSSProperties}
                  type="button"
                >
                  <span className="creator-spotlight__selector-category">{creator.category}</span>
                  <strong>{creator.displayName}</strong>
                  <small>{formatSupporters(creator.monthlySupporters)}</small>
                </button>
              );
            })}
          </div>

          <article
            className="creator-spotlight__hero"
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            ref={heroCardRef}
          >
            <div className="creator-spotlight__shimmer" aria-hidden="true" />
            <div aria-hidden="true" className="creator-spotlight__monogram">
              {activeCreator.initials}
            </div>

            <div className="creator-spotlight__identity">
              <span className="creator-spotlight__avatar">{activeCreator.initials}</span>
              <div>
                <p>{activeCreator.category}</p>
                <h3>{activeCreator.displayName}</h3>
              </div>
            </div>

            <div className="creator-spotlight__title-block">
              <span className="creator-spotlight__kicker">Editorial spotlight</span>
              <h4>{activeCreator.headline}</h4>
            </div>

            <div className="creator-spotlight__footer">
              <div className="creator-spotlight__meta">
                <article>
                  <span>Starting at</span>
                  <strong>${activeCreator.startingPrice}/mo</strong>
                </article>
                <article>
                  <span>Community size</span>
                  <strong>{formatSupporters(activeCreator.monthlySupporters)}</strong>
                </article>
              </div>

              <Link className="creator-spotlight__cta" to={`/creators/${activeCreator.slug}`}>
                View profile
              </Link>
            </div>
          </article>

          <div className="creator-spotlight__echoes" aria-hidden="true">
            {stackedCreators.slice(1, 4).map((creator, index) => (
              <article className="creator-spotlight__echo-card" key={`${creator.slug}-echo`}>
                <span>{creator.category}</span>
                <strong>{creator.initials}</strong>
                <small>{creator.displayName}</small>
                <em>{`0${index + 2}`}</em>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

function formatSupporters(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k supporters`;
  }

  return `${value} supporters`;
}

function buildThemeStyle(theme: { aura: string; surface: string }) {
  return {
    "--creator-aura": theme.aura,
    "--creator-surface": theme.surface
  } as CSSProperties;
}
