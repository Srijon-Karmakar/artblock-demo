import { useEffect } from "react";
import { type Theme, useTheme } from "../../providers/ThemeProvider";

type ThemeOption = {
  value: Theme;
  label: string;
  description: string;
  bg: string;
  card: string;
  bar: string;
  border: string;
};

const OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "White",
    description: "Clean & bright",
    bg: "#f8f8f7",
    card: "#ffffff",
    bar: "#111111",
    border: "rgba(17,17,17,0.1)"
  },
  {
    value: "dark",
    label: "Dark",
    description: "Easy on the eyes",
    bg: "#0a0a0b",
    card: "rgba(255,255,255,0.07)",
    bar: "#f2f2f5",
    border: "rgba(255,255,255,0.08)"
  },
  {
    value: "amoled",
    label: "AMOLED",
    description: "Pure black",
    bg: "#000000",
    card: "rgba(255,255,255,0.04)",
    bar: "#f2f2f5",
    border: "rgba(255,255,255,0.055)"
  }
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const ThemeSheet = ({ isOpen, onClose }: Props) => {
  const { theme, setTheme } = useTheme();

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (value: Theme) => {
    setTheme(value);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="sheet-backdrop"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        aria-label="Appearance settings"
        aria-modal="true"
        className="theme-sheet"
        role="dialog"
      >
        {/* Drag handle */}
        <div aria-hidden="true" className="theme-sheet__handle" />

        <div className="theme-sheet__head">
          <h2 className="theme-sheet__title">Appearance</h2>
          <button
            aria-label="Close"
            className="theme-sheet__close"
            onClick={onClose}
            type="button"
          >
            <svg fill="none" height="20" viewBox="0 0 24 24" width="20">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <p className="theme-sheet__subtitle">Choose how ArtBlock looks for you.</p>

        <div className="theme-sheet__options">
          {OPTIONS.map((opt) => {
            const isActive = theme === opt.value;
            return (
              <button
                aria-pressed={isActive}
                className={`theme-option${isActive ? " theme-option--active" : ""}`}
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                type="button"
              >
                {/* Mini mockup preview */}
                <div
                  className="theme-option__preview"
                  style={{ background: opt.bg, border: `1.5px solid ${opt.border}` }}
                >
                  <div
                    className="theme-option__card"
                    style={{ background: opt.card, border: `1px solid ${opt.border}` }}
                  >
                    <div className="theme-option__dot" style={{ background: opt.bar, opacity: 0.6 }} />
                    <div className="theme-option__bars">
                      <div className="theme-option__bar" style={{ background: opt.bar, opacity: 0.85, width: "70%" }} />
                      <div className="theme-option__bar" style={{ background: opt.bar, opacity: 0.4, width: "45%" }} />
                    </div>
                  </div>
                </div>

                <span className="theme-option__label">{opt.label}</span>
                <span className="theme-option__desc">{opt.description}</span>

                {isActive ? (
                  <span aria-hidden="true" className="theme-option__check">
                    <svg fill="none" height="14" viewBox="0 0 24 24" width="14">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
