"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "../lib/auth";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7;
}

function passwordScore(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

const STRENGTH_COLORS = ["#e5e7eb", "#dc2626", "#f59e0b", "#eab308", "#16a34a"];
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordScore(password), [password]);

  const errors = {
    fullName: touched.fullName && !fullName.trim() ? "Full name is required." : "",
    email:
      touched.email && !isValidEmail(email) ? "Enter a valid email address." : "",
    phone:
      touched.phone && !isValidPhone(phone)
        ? "Enter a valid phone number."
        : "",
    password:
      touched.password && strength < 3
        ? "Use at least 8 characters with a number and an uppercase letter."
        : "",
    confirmPassword:
      touched.confirmPassword && confirmPassword !== password
        ? "Passwords don't match."
        : "",
    agreed: touched.agreed && !agreed ? "You must agree to continue." : "",
  };

  const isValid =
    fullName.trim() &&
    isValidEmail(email) &&
    isValidPhone(phone) &&
    strength >= 3 &&
    confirmPassword === password &&
    agreed;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      agreed: true,
    });
    setFormError("");

    if (!isValid) return;

    setLoading(true);
    try {
      await signUp({ fullName, email, phone, password });
      router.push("/dashboard");
    } catch (err) {
      setFormError(err.message || "Unable to create account.");
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
        <p className="subtitle">Create your account</p>

        {formError && <div className="banner-error">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
              className={errors.fullName ? "invalid" : ""}
              autoComplete="name"
            />
            {errors.fullName && <div className="field-error">{errors.fullName}</div>}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              className={errors.email ? "invalid" : ""}
              autoComplete="email"
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              className={errors.phone ? "invalid" : ""}
              autoComplete="tel"
            />
            {errors.phone && <div className="field-error">{errors.phone}</div>}
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
              className={errors.password ? "invalid" : ""}
              autoComplete="new-password"
            />
            <div className="pw-strength">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="pw-strength-bar"
                  style={{
                    background: i <= strength ? STRENGTH_COLORS[strength] : "#e5e7eb",
                  }}
                />
              ))}
            </div>
            {password && (
              <div className="field-hint">{STRENGTH_LABELS[strength]}</div>
            )}
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
              className={errors.confirmPassword ? "invalid" : ""}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <div className="field-error">{errors.confirmPassword}</div>
            )}
          </div>

          <label className="terms-row">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setTouched((t) => ({ ...t, agreed: true }));
              }}
            />
            <span>
              I understand this is a bank application, that
              banking services are provided.
            </span>
          </label>
          {errors.agreed && <div className="field-error">{errors.agreed}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="switch-link">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>

        <p className="hint">
          Stored only in your browser's local storage — nothing is sent to a
          server.
        </p>
      </div>
    </div>
  );
}
