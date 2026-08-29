"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logOut } from "../lib/auth";

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logOut();
    router.push("/login");
  }

  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <>
      <div className="topbar">
        <div className="logo-row">
          <div className="logo-mark">MB</div>
          <div className="logo-text">Meridian Bank</div>
        </div>
        <div className="topbar-right">
          <nav className="nav-tabs">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-tab ${pathname === l.href ? "active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button className="logout-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
      <nav className="mobile-nav">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "active" : ""}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
