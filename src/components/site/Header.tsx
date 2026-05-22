import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/documents", label: "Documents" },
  { to: "/translator", label: "Translator" },
  { to: "/family", label: "Family" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-soft hover:text-foreground"
              activeProps={{ className: "bg-surface-soft text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/onboarding" className="hidden sm:block">
            <Button variant="ghost" className="rounded-full">Begin</Button>
          </Link>
          <Link to="/security">
            <Button variant="outline" className="rounded-full">Sign in</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
