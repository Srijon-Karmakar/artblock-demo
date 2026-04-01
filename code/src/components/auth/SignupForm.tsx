import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { isSupabaseConfigured } from "../../lib/env";
import type { AppRole } from "../../lib/supabase.types";
import { useAuth } from "../../providers/AuthProvider";
import { AuthMessage } from "./AuthMessage";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must contain at least 8 characters."),
  role: z.enum(["visitor", "creator"])
});

const roleOptions: { label: string; description: string; value: AppRole }[] = [
  {
    label: "Visitor",
    description: "Browse, follow creators, and join the platform as an audience member.",
    value: "visitor"
  },
  {
    label: "Creator",
    description: "Publish your identity, grow your reach, and prepare for monetization flows.",
    value: "creator"
  }
];

export const SignupForm = () => {
  const { signUp, error } = useAuth();
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "creator" as AppRole
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = signupSchema.safeParse(formState);

    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Enter valid details.");
      return;
    }

    setFieldError(null);
    setSuccessMessage(null);
    setSubmitting(true);
    const result = await signUp(parsed.data);
    setSubmitting(false);

    if (result.error) {
      return;
    }

    setSuccessMessage(
      "Account created. Check your inbox for a confirmation link, then continue to your dashboard."
    );
  };

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      {!isSupabaseConfigured ? (
        <AuthMessage
          kind="info"
          message="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env before using authentication."
        />
      ) : null}

      {fieldError ? <AuthMessage kind="error" message={fieldError} /> : null}
      {error ? <AuthMessage kind="error" message={error} /> : null}
      {successMessage ? <AuthMessage kind="info" message={successMessage} /> : null}

      <label>
        Full Name
        <input
          autoComplete="name"
          name="fullName"
          onChange={(event) =>
            setFormState((current) => ({ ...current, fullName: event.target.value }))
          }
          placeholder="Aarav Sharma"
          type="text"
          value={formState.fullName}
        />
      </label>

      <label>
        Email
        <input
          autoComplete="email"
          name="email"
          onChange={(event) =>
            setFormState((current) => ({ ...current, email: event.target.value }))
          }
          placeholder="hello@artblock.com"
          type="email"
          value={formState.email}
        />
      </label>

      <label>
        Password
        <input
          autoComplete="new-password"
          name="password"
          onChange={(event) =>
            setFormState((current) => ({ ...current, password: event.target.value }))
          }
          placeholder="Minimum 8 characters"
          type="password"
          value={formState.password}
        />
      </label>

      <fieldset className="role-picker">
        <legend>Select account role</legend>
        <div className="role-picker__grid">
          {roleOptions.map((option) => (
            <label
              className={`role-option ${formState.role === option.value ? "role-option--active" : ""}`}
              key={option.value}
            >
              <input
                checked={formState.role === option.value}
                name="role"
                onChange={() => setFormState((current) => ({ ...current, role: option.value }))}
                type="radio"
                value={option.value}
              />
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button className="solid-button solid-button--large" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>

      {!isSupabaseConfigured ? (
        <p className="auth-form__hint">
          You likely updated <code>.env.example</code>. Create <code>code/.env</code> instead, then
          restart the dev server.
        </p>
      ) : null}

      <p className="auth-form__switch">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
};
