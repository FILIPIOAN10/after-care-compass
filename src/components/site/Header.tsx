import { Link, useRouter } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { LogOut } from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Planul meu" },
  { to: "/documents", label: "Documente" },
  { to: "/translator", label: "Traducător" },
  { to: "/family", label: "Familie" },
];

export function Header() {
  const auth = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigare principală">
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
          {auth.isAuthenticated ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {auth.user?.fullName}
              </span>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  auth.logout();
                  router.navigate({ to: "/" });
                }}
              >
                <LogOut className="mr-1.5 h-4 w-4" /> Ieși
              </Button>
            </>
          ) : (
            <>
              <Link to="/onboarding" className="hidden sm:block">
                <Button variant="ghost" className="rounded-full">
                  Începe
                </Button>
              </Link>
              <Link to="/security">
                <Button variant="outline" className="rounded-full">
                  Autentificare
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
