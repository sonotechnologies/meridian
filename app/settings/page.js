"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "../components/TopNav";
import { getCurrentUser, updateCurrentUser, updatePassword } from "../lib/auth";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return value.replace(/\D/g, "").length >= 7;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileTouched, setProfileTouched] = useState({});
  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwTouched, setPwTouched] = useState({});
  const [pwMsg, setPwMsg] = useState(null);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/login");
      return;
    }
    setUser(current);
    setFullName(current.fullName);
    setEmail(current.email);
    setPhone(current.phone);
  }, [router]);

  if (!user) return null;

  const profileErrors = {
    fullName:
      profileTouched.fullName && !fullName.trim() ? "Full name is required." : "",
    email:
      profileTouched.email && !isValidEmail(email) ? "Enter a valid email address." : "",
    phone:
      profileTouched.phone && !isValidPhone(phone) ? "Enter a valid phone number." : "",
  };

  const profileValid = fullName.trim() && isValidEmail(email) && isValidPhone(phone);

  function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileTouched({ fullName: true, email: true, phone: true });
    setProfileMsg(null);
    if (!profileValid) return;

    setSavingProfile(true);
    const updated = updateCurrentUser({
      fullName: fullName.trim(),
      phone: phone.trim(),
      // Note: email is kept as the account key in this demo, so it's
      // displayed but not changed here to avoid breaking the session lookup.
    });
    setTimeout(() => {
      setSavingProfile(false);
      if (updated) {
        setUser(updated);
        setProfileMsg({ type: "ok", text: "Profile updated successfully." });
      } else {
        setProfileMsg({ type: "err", text: "Could not update profile." });
      }
    }, 500);
  }

  const pwErrors = {
    currentPassword:
      pwTouched.currentPassword && !currentPassword ? "Enter your current password." : "",
    newPassword:
      pwTouched.newPassword && newPassword.length < 8
        ? "New password must be at least 8 characters."
        : "",
    confirmNewPassword:
      pwTouched.confirmNewPassword && confirmNewPassword !== newPassword
        ? "Passwords don't match."
        : "",
  };

  const pwValid =
    currentPassword && newPassword.length >= 8 && confirmNewPassword === newPassword;

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwTouched({ currentPassword: true, newPassword: true, confirmNewPassword: true });
    setPwMsg(null);
    if (!pwValid) return;

    setSavingPw(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setPwMsg({ type: "ok", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPwTouched({});
    } catch (err) {
      setPwMsg({ type: "err", text: err.message || "Could not change password." });
    } finally {
      setSavingPw(false);
    }
  }

  const initials = user.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="dash-wrap">
      <TopNav />

      <div className="dash-content">
        <div className="profile-header">
          <div className="avatar-circle">{initials}</div>
          <div>
            <div className="profile-header-name">{user.fullName}</div>
            <div className="profile-header-email">{user.email}</div>
          </div>
        </div>
        <div className="greeting-sub">Manage your profile and security settings</div>

        <div className="panel">
          <h2>Profile information</h2>
          <p className="panel-sub">Update your personal details.</p>

          {profileMsg && (
            <div className={profileMsg.type === "ok" ? "banner-success" : "banner-error"}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} noValidate>
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => setProfileTouched((t) => ({ ...t, fullName: true }))}
                className={profileErrors.fullName ? "invalid" : ""}
              />
              {profileErrors.fullName && (
                <div className="field-error">{profileErrors.fullName}</div>
              )}
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} disabled />
              <div className="field-hint">
                Email is used as your account ID in this demo and can't be changed here.
              </div>
            </div>

            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setProfileTouched((t) => ({ ...t, phone: true }))}
                className={profileErrors.phone ? "invalid" : ""}
              />
              {profileErrors.phone && (
                <div className="field-error">{profileErrors.phone}</div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={savingProfile}>
              {savingProfile ? (
                <>
                  <span className="spinner" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2>Change password</h2>
          <p className="panel-sub">Choose a new password for your account.</p>

          {pwMsg && (
            <div className={pwMsg.type === "ok" ? "banner-success" : "banner-error"}>
              {pwMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} noValidate>
            <div className="field">
              <label htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onBlur={() => setPwTouched((t) => ({ ...t, currentPassword: true }))}
                className={pwErrors.currentPassword ? "invalid" : ""}
                autoComplete="current-password"
              />
              {pwErrors.currentPassword && (
                <div className="field-error">{pwErrors.currentPassword}</div>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setPwTouched((t) => ({ ...t, newPassword: true }))}
                  className={pwErrors.newPassword ? "invalid" : ""}
                  autoComplete="new-password"
                />
                {pwErrors.newPassword && (
                  <div className="field-error">{pwErrors.newPassword}</div>
                )}
              </div>

              <div className="field">
                <label htmlFor="confirmNewPassword">Confirm new password</label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  onBlur={() => setPwTouched((t) => ({ ...t, confirmNewPassword: true }))}
                  className={pwErrors.confirmNewPassword ? "invalid" : ""}
                  autoComplete="new-password"
                />
                {pwErrors.confirmNewPassword && (
                  <div className="field-error">{pwErrors.confirmNewPassword}</div>
                )}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={savingPw}>
              {savingPw ? (
                <>
                  <span className="spinner" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2>Account details</h2>
          <div className="settings-grid">
            <div className="settings-row">
              <span className="settings-row-label">Account type</span>
              <span className="settings-row-value">Demo checking</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Member since</span>
              <span className="settings-row-value">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Currency</span>
              <span className="settings-row-value">USD ($)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
