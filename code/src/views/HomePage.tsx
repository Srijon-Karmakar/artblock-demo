import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getSupabaseClient } from "../lib/supabase";
import type { Database } from "../lib/supabase.types";
import heroVideo1 from "../public/videos/hero-1.mp4";
import heroVideo2 from "../public/videos/hero-2.mp4";
import heroVideo3 from "../public/videos/hero-3.mp4";
import heroVideo4 from "../public/videos/hero-4.mp4";
import heroVideo5 from "../public/videos/hero-5.mp4";

const heroVideos = [heroVideo1, heroVideo2, heroVideo3, heroVideo4, heroVideo5];

const portalRadius = 110;
const transitionMs = 1100;

const proofItems = [
  "Live creator pages",
  "Recurring memberships",
  "Direct audience access",
  "Member-only publishing"
];

const featureRows = [
  {
    eyebrow: "Create on your terms",
    title: "Give creators a home that feels owned, not rented.",
    body:
      "ArtBlock centers the creator page first: warm editorial presentation, clear membership offers, and publishing surfaces built around direct fan support.",
    points: [
      "Public profile and tier stack",
      "Long-form creator storytelling",
      "Clean mobile conversion path"
    ]
  },
  {
    eyebrow: "Build real community",
    title: "Move people from audience to membership.",
    body:
      "The product language is about belonging, access, and recurring support. Fans should feel like insiders, not just customers checking out a paywall.",
    points: [
      "Posts layered by access",
      "Persistent member identity",
      "Room for DMs, drops, and notifications next"
    ]
  },
  {
    eyebrow: "Grow into a business",
    title: "Treat memberships like a serious creator revenue stream.",
    body:
      "This foundation already uses real auth, creator records, and Postgres-backed data so the rest of the platform can grow without reworking the basics later.",
    points: [
      "Supabase-backed creator data",
      "Role-aware auth and redirects",
      "Ready for subscriptions and publishing CRUD"
    ]
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description:
      "Launch your creative presence and start building an audience with no upfront cost.",
    highlight: false,
    cta: "Get started free",
    features: [
      "1 membership tier",
      "Public creator page",
      "Up to 50 members",
      "8% platform fee",
      "Community support"
    ]
  },
  {
    name: "Creator",
    price: "$15",
    period: "/month",
    description:
      "For creators ready to build a serious membership business and grow their fanbase.",
    highlight: true,
    cta: "Start Creator plan",
    features: [
      "Up to 5 membership tiers",
      "Analytics dashboard",
      "Priority support",
      "5% platform fee",
      "Custom branding",
      "Patron messaging"
    ]
  },
  {
    name: "Pro",
    price: "$35",
    period: "/month",
    description:
      "For professional creators with a dedicated fanbase and serious revenue goals.",
    highlight: false,
    cta: "Go Pro",
    features: [
      "Unlimited membership tiers",
      "Advanced analytics",
      "Dedicated account support",
      "3% platform fee",
      "Custom domain + branding",
      "Early feature access"
    ]
  }
];

type FeaturedCreator = {
  slug: string;
  displayName: string;
  headline: string;
  category: string;
  monthlySupporters: number;
  startingPrice: number;
  initials: string;
};

const fallbackCreators: FeaturedCreator[] = [
  {
    slug: "naia-sol",
    displayName: "Naia Sol",
    headline: "Visual journals, behind-the-scenes process notes, and monthly studio drops.",
    category: "Illustration",
    monthlySupporters: 1800,
    startingPrice: 9,
    initials: "NS"
  },
  {
    slug: "kira-vale",
    displayName: "Kira Vale",
    headline: "Short films, annotated scripts, and member-only production diaries.",
    category: "Film",
    monthlySupporters: 940,
    startingPrice: 12,
    initials: "KV"
  },
  {
    slug: "iris-noor",
    displayName: "Iris Noor",
    headline: "Editorial photography releases, archive scans, and private critique sessions.",
    category: "Photography",
    monthlySupporters: 620,
    startingPrice: 15,
    initials: "IN"
  },
  {
    slug: "rafi-nova",
    displayName: "Rafi Nova",
    headline: "Live demos, early mixes, and a closer relationship with the audience funding the work.",
    category: "Music",
    monthlySupporters: 430,
    startingPrice: 8,
    initials: "RN"
  }
];

const showcaseCategories = ["Illustration", "Film", "Photography", "Music"];
const startingPriceScale = [8, 10, 12, 15];

const toFeaturedCreator = (
  row: Database["public"]["Views"]["public_member_profiles"]["Row"],
  index: number
): FeaturedCreator | null => {
  if (!row.creator_slug || !row.full_name) {
    return null;
  }

  const nameParts = row.full_name
    .split(" ")
    .map((value) => value.trim())
    .filter(Boolean);
  const initials = nameParts
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() ?? "")
    .join("") || "AB";

  return {
    slug: row.creator_slug,
    displayName: row.full_name,
    headline: row.headline ?? row.bio ?? "Independent creator building directly with supporters on ArtBlock.",
    category: showcaseCategories[index % showcaseCategories.length],
    monthlySupporters: Math.max(
      Number(row.subscriber_count ?? 0),
      Number(row.follower_count ?? 0),
      120 + index * 85
    ),
    startingPrice: startingPriceScale[index % startingPriceScale.length],
    initials
  };
};

const loadFeaturedCreators = async () => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return fallbackCreators;
  }

  const { data, error } = await supabase
    .from("public_member_profiles")
    .select("*")
    .eq("role", "creator")
    .limit(8);

  if (error) {
    return fallbackCreators;
  }

  const liveCreators = ((data ?? []) as Database["public"]["Views"]["public_member_profiles"]["Row"][])
    .map((row, index) => toFeaturedCreator(row, index))
    .filter((row): row is FeaturedCreator => row !== null)
    .slice(0, 4);

  if (liveCreators.length === 0) {
    return fallbackCreators;
  }

  const seen = new Set(liveCreators.map((creator) => creator.slug));
  const merged = [...liveCreators];

  for (const fallback of fallbackCreators) {
    if (merged.length >= 4) {
      break;
    }

    if (!seen.has(fallback.slug)) {
      merged.push(fallback);
      seen.add(fallback.slug);
    }
  }

  return merged;
};

export const HomePage = () => {
  const [creators, setCreators] = useState<FeaturedCreator[]>(fallbackCreators);
  const [isLoading, setIsLoading] = useState(true);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const portalRingRef = useRef<HTMLDivElement>(null);
  const currentSlot = useRef<"a" | "b">("a");
  const videoIndexRef = useRef(0);
  const shuffledRef = useRef<string[]>([]);
  const cursorRef = useRef({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const transitioningRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    const ring = portalRingRef.current;

    if (!hero || !videoA || !videoB) {
      return undefined;
    }

    const rect = hero.getBoundingClientRect();
    const startX = rect.width / 2;
    const startY = rect.height / 2;
    cursorRef.current = {
      x: startX,
      y: startY,
      clientX: rect.left + startX,
      clientY: rect.top + startY
    };

    const shuffled = [...heroVideos].sort(() => Math.random() - 0.5);
    shuffledRef.current = shuffled;

    videoA.src = shuffled[0];
    videoA.load();
    void videoA.play().catch(() => undefined);
    videoA.style.zIndex = "1";
    videoA.style.clipPath = "none";

    videoB.src = shuffled[1 % shuffled.length];
    videoB.load();
    void videoB.play().catch(() => undefined);
    videoB.style.zIndex = "2";
    videoB.style.clipPath = "circle(0px at 50% 50%)";

    currentSlot.current = "a";
    videoIndexRef.current = 0;

    const getCurrentVideo = () => (currentSlot.current === "a" ? videoA : videoB);
    const getNextVideo = () => (currentSlot.current === "a" ? videoB : videoA);

    const positionRing = (clientX: number, clientY: number) => {
      if (!ring) {
        return;
      }

      ring.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
      ring.style.opacity = "1";
    };

    const showPortal = (x: number, y: number) => {
      if (transitioningRef.current) {
        return;
      }

      const nextVideo = getNextVideo();
      nextVideo.style.transition = "none";
      nextVideo.style.clipPath = `circle(${portalRadius}px at ${x}px ${y}px)`;
    };

    const hidePortal = () => {
      if (transitioningRef.current) {
        return;
      }

      const nextVideo = getNextVideo();
      nextVideo.style.transition = "clip-path 0.4s ease";
      nextVideo.style.clipPath = "circle(0px at 50% 50%)";

      if (ring) {
        ring.style.opacity = "0";
      }
    };

    const doTransition = () => {
      if (transitioningRef.current) {
        return;
      }

      transitioningRef.current = true;
      const isCurrentA = currentSlot.current === "a";
      const currentVideo = getCurrentVideo();
      const nextVideo = getNextVideo();
      const { x, y } = cursorRef.current;

      nextVideo.style.transition = `clip-path ${transitionMs}ms cubic-bezier(0.77, 0, 0.175, 1)`;
      nextVideo.style.clipPath = `circle(200vmax at ${x}px ${y}px)`;

      if (ring) {
        ring.style.opacity = "0";
      }

      timeoutRef.current = window.setTimeout(() => {
        nextVideo.style.zIndex = "1";
        nextVideo.style.transition = "none";
        nextVideo.style.clipPath = "none";

        const nextVideoIndex = (videoIndexRef.current + 2) % shuffledRef.current.length;
        currentVideo.style.zIndex = "2";
        currentVideo.style.clipPath = `circle(0px at ${x}px ${y}px)`;
        currentVideo.src = shuffledRef.current[nextVideoIndex];
        currentVideo.load();
        void currentVideo.play().catch(() => undefined);

        videoIndexRef.current = (videoIndexRef.current + 1) % shuffledRef.current.length;
        currentSlot.current = isCurrentA ? "b" : "a";
        transitioningRef.current = false;

        showPortal(cursorRef.current.x, cursorRef.current.y);
        positionRing(cursorRef.current.clientX, cursorRef.current.clientY);
      }, transitionMs + 60);
    };

    const onMove = (event: MouseEvent) => {
      const currentRect = hero.getBoundingClientRect();
      const x = event.clientX - currentRect.left;
      const y = event.clientY - currentRect.top;

      cursorRef.current = { x, y, clientX: event.clientX, clientY: event.clientY };
      showPortal(x, y);
      positionRing(event.clientX, event.clientY);
    };

    const onEnter = (event: MouseEvent) => {
      onMove(event);
    };

    const onClick = () => {
      doTransition();
    };

    showPortal(startX, startY);
    positionRing(rect.left + startX, rect.top + startY);

    hero.addEventListener("mousemove", onMove, { passive: true });
    hero.addEventListener("mouseenter", onEnter);
    hero.addEventListener("mouseleave", hidePortal);
    hero.addEventListener("click", onClick);

    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseenter", onEnter);
      hero.removeEventListener("mouseleave", hidePortal);
      hero.removeEventListener("click", onClick);

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadCreators = async () => {
      try {
        const items = await loadFeaturedCreators();
        if (!cancelled) {
          setCreators(items);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCreators();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

    const handleScroll = () => {
      if (!parallaxRef.current) {
        return;
      }

      const rect = parallaxRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        parallaxRef.current.style.setProperty("--parallax-y", `${progress * 88}px`);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const featuredCreatorHref = creators[0] ? `/creators/${creators[0].slug}` : "/signup";

  return (
    <div className="landing-page">
      <section className="video-hero" ref={heroRef}>
        <video
          aria-hidden="true"
          autoPlay
          className="video-layer"
          loop
          muted
          playsInline
          ref={videoARef}
        />
        <video
          aria-hidden="true"
          autoPlay
          className="video-layer"
          loop
          muted
          playsInline
          ref={videoBRef}
        />
        <div aria-hidden="true" className="portal-ring" ref={portalRingRef} />

        <div className="video-hero-content">
          <span className="eyebrow-chip-light">Premium Creator Platform</span>
          <h1 className="video-hero-title">
            Your creative world,
            <br />
            <span className="title-accent">beautifully supported.</span>
          </h1>
          <p className="video-hero-subtext">
            ArtBlock is where creators and fans build something lasting.
            <br />
            Direct access, recurring support, and editorial presentation for your best work.
          </p>

          <div className="hero-actions-centered">
            <Link className="button-rust-large" to="/signup">
              Start your page
            </Link>
            <Link className="button-ghost-large" to={featuredCreatorHref}>
              Explore creators
            </Link>
          </div>

          <div className="hero-proof-row">
            {proofItems.map((item) => (
              <span className="proof-pill-light" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div aria-hidden="true" className="scroll-hint">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>

        <p aria-hidden="true" className="hero-click-hint">
          Click anywhere to explore
        </p>
      </section>

      <div className="parallax-bridge" ref={parallaxRef}>
        <div className="parallax-inner landing-width">
          <p className="parallax-eyebrow">Why ArtBlock</p>
          <h2 className="parallax-headline">
            Where creativity meets
            <br />
            real community.
          </h2>
        </div>
      </div>

      <section className="editorial-band panel landing-width" id="about">
        <div>
          <span className="eyebrow">Why it feels better</span>
          <h2>Less dashboard chrome. More story, trust, and conversion.</h2>
        </div>
        <p>
          The strongest creator platforms do not feel like enterprise SaaS first. They feel
          like a polished home for people, work, and fandom. ArtBlock pushes in that
          direction.
        </p>
      </section>

      <section className="creator-showcase landing-width" id="features">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Discover creators</span>
            <h2>Live creator cards with stronger editorial presentation</h2>
          </div>
          <p className="section-note">
            Featured profiles are pulled from the live creator dataset when available.
          </p>
        </div>

        {isLoading ? (
          <div className="bento-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <article
                className={`bento-item card creator-card-skeleton ${
                  index === 0 ? "bento-item-large" : ""
                }`}
                key={`skeleton-${index}`}
              >
                <div className="skeleton-line skeleton-small" />
                <div className="skeleton-line skeleton-large" />
                <div className="skeleton-line" />
              </article>
            ))}
          </div>
        ) : (
          <div className="bento-grid">
            {creators.map((creator, index) => (
              <article
                className={`bento-item card creator-card reveal ${
                  index === 0 ? "bento-item-large" : index === 1 ? "bento-item-tall" : ""
                }`}
                key={creator.slug}
              >
                <div className="creator-card-top">
                  <span className="creator-category">{creator.category}</span>
                  <span className="creator-supporters">
                    {formatSupporters(creator.monthlySupporters)}
                  </span>
                </div>

                <div className="creator-card-identity">
                  <span className="creator-avatar">{creator.initials}</span>
                  <div className="creator-card-info">
                    <h3>{creator.displayName}</h3>
                    <p>{creator.headline}</p>
                  </div>
                </div>

                <div className="creator-card-bottom">
                  <div className="stack-list">
                    <span>From ${creator.startingPrice}/month</span>
                  </div>
                  <Link className="text-link" to={`/creators/${creator.slug}`}>
                    View profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="pricing-section reveal landing-width" id="pricing">
        <div className="pricing-header">
          <span className="eyebrow">Simple pricing</span>
          <h2>Grow with a plan that fits</h2>
          <p>Start free. Upgrade when you are ready. No hidden fees, no surprises.</p>
        </div>

        <div className="pricing-grid">
          {pricingPlans.map((plan) => (
            <article
              className={`pricing-card ${plan.highlight ? "pricing-card-featured" : ""}`}
              key={plan.name}
            >
              {plan.highlight ? <span className="pricing-badge">Most popular</span> : null}
              <h3>{plan.name}</h3>
              <div className="pricing-price">
                <span className="pricing-amount">{plan.price}</span>
                <span className="pricing-period">{plan.period}</span>
              </div>
              <p>{plan.description}</p>
              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link className={plan.highlight ? "button-rust-full" : "button-outline-teal"} to="/signup">
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-columns landing-width">
        {featureRows.map((feature) => (
          <article className="feature-panel panel reveal" key={feature.title}>
            <span className="eyebrow">{feature.eyebrow}</span>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
            <ul className="clean-list">
              {feature.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="quote-panel panel landing-width">
        <div className="quote-mark">&ldquo;</div>
        <div>
          <p className="quote-copy">
            A creator platform should make the relationship feel direct, premium, and alive.
            That means less template energy and more confidence in the page, copy, and
            membership offer.
          </p>
          <p className="quote-author">ArtBlock product direction</p>
        </div>
      </section>

      <section className="cta-panel panel landing-width" id="cta">
        <div>
          <span className="eyebrow">Next step</span>
          <h2>Ready to build something your audience will actually support?</h2>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" to="/signup">
            Create your account
          </Link>
          <Link className="button button-secondary" to="/login">
            Log in
          </Link>
        </div>
      </section>
    </div>
  );
};

function formatSupporters(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k supporters`;
  }

  return `${value} supporters`;
}
