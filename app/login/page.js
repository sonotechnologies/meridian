"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logIn } from "../lib/auth";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailError =
    touched.email && !isValidEmail(email) ? "Enter a valid email address." : "";
  const passwordError =
    touched.password && !password ? "Password is required." : "";

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setFormError("");

    if (!isValidEmail(email) || !password) return;

    setLoading(true);
    try {
      await logIn({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setFormError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="logo-row">
          <div className="logo-mark">MB</div>
          <div className="logo-text">Meridian Bank</div>
        </div>
        <p className="subtitle">Meridian Bank access — this is a Hidden Bank</p>

        {formError && <div className="banner-error">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              className={emailError ? "invalid" : ""}
              autoComplete="email"
            />
            {emailError && <div className="field-error">{emailError}</div>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              className={passwordError ? "invalid" : ""}
              autoComplete="current-password"
            />
            {passwordError && <div className="field-error">{passwordError}</div>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="switch-link">
          Don't have an account? <Link href="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
