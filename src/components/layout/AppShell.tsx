import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { NavIcon } from "@/components/layout/NavIcon";
import { navTitle, primaryNav, secondaryNav, sectionFromPathname } from "@/components/layout/navConfig";
import { useAuth } from "@/hooks/useAuth";
import type { Business } from "@/types/business";

export function AppShell({ business, children }: { business: Business; children: ReactNode }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const section = sectionFromPathname(pathname);
  const base = `/businesses/${business.id}`;
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {navOpen ? (
          <button type="button" className="fixed inset-0 z-30 bg-foreground/20 md:hidden" aria-label="Close navigation" onClick={() => setNavOpen(false)} />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-border bg-surface transition-transform md:static md:translate-x-0 ${
            navOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
            <Link to="/" className="flex min-w-0 items-center gap-2.5" onClick={() => setNavOpen(false)}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-contrast shadow-[0_7px_18px_rgba(33,64,214,0.22)]">
                S
              </span>
              <span className="truncate font-semibold tracking-[-0.02em]">SEO Pilot</span>
            </Link>
          </div>

          <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-3" aria-label="SEO Pilot">
            {primaryNav.map((item) => (
              <ShellNavLink key={item.path} to={`${base}/${item.path}`} icon={item.icon} label={item.label} onClick={() => setNavOpen(false)} />
            ))}
            <div className="my-2 border-t border-border" />
            {secondaryNav.map((item) => (
              <ShellNavLink key={item.path} to={`${base}/${item.path}`} icon={item.icon} label={item.label} onClick={() => setNavOpen(false)} />
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-xl">
            <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border text-sm font-semibold md:hidden"
                  onClick={() => setNavOpen(true)}
                  aria-label="Open navigation"
                >
                  ☰
                </button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{navTitle(section)}</p>
                  <p className="truncate text-xs text-muted">{business.name}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden min-h-9 items-center rounded-full border border-[#abefc6] bg-[#ecfdf3] px-3 text-xs font-semibold text-success sm:inline-flex">
                  No decisions needed
                </span>
                <span className="hidden text-sm text-muted lg:inline">{user?.email}</span>
                <Link to="/" className="text-sm font-medium text-muted hover:text-foreground">
                  Businesses
                </Link>
                <button type="button" onClick={() => logout()} className="text-sm font-medium text-muted transition hover:text-foreground">
                  Sign out
                </button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">
            <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function ShellNavLink({ to, icon, label, onClick }: { to: string; icon: Parameters<typeof NavIcon>[0]["name"]; label: string; onClick: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
          isActive ? "bg-foreground text-white shadow-sm" : "text-muted hover:bg-black/[0.04] hover:text-foreground"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? "text-[#aebcff]" : ""}>
            <NavIcon name={icon} />
          </span>
          {label}
        </>
      )}
    </NavLink>
  );
}
