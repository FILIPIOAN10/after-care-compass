import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShieldCheck, KeyRound, Eye, Lock, Activity } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { api, ApiError, type ActivityEntry } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["login", "register"]).optional(),
});

export const Route = createFileRoute("/security")({
  head: () => ({ meta: [{ title: "Autentificare — After" }] }),
  validateSearch: searchSchema,
  component: Security,
});

const ICONS_BY_KIND: Record<string, typeof KeyRound> = {
  LOGIN: KeyRound,
  VIEW: Eye,
  UPLOAD: Lock,
  TASK_UPDATE: ShieldCheck,
  NOTE: Activity,
  INVITE: Activity,
  SECURITY: ShieldCheck,
};

function safeNavigate(navigate: ReturnType<typeof useNavigate>, target: string | undefined) {
  const path = target && target.startsWith("/") ? target : "/dashboard";
  // Cast to satisfy TanStack Router's typed navigate when target comes from URL search.
  navigate({ to: path as "/dashboard" });
}

function Security() {
  const { redirect: redirectTo, mode } = useSearch({ from: "/security" });
  const navigate = useNavigate();
  const auth = useAuth();
  const [tab, setTab] = useState<"login" | "register">(mode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showTfa, setShowTfa] = useState(false);
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated && !showTfa && !submitting) {
      safeNavigate(navigate, redirectTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated]);

  const activityQuery = useQuery({
    queryKey: ["activity"],
    queryFn: () => api<ActivityEntry[]>("/api/activity?limit=8"),
    enabled: auth.isAuthenticated,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (tab === "register") {
        if (fullName.trim().length < 2) {
          toast.error("Te rugăm să introduci numele tău complet.");
          setSubmitting(false);
          return;
        }
        if (password.length < 8) {
          toast.error("Parola trebuie să aibă cel puțin 8 caractere.");
          setSubmitting(false);
          return;
        }
        await auth.register(fullName.trim(), email.trim(), password);
        toast.success("Bine ai venit. Ți-am pregătit un dosar gol.");
        setShowTfa(true);
      } else {
        await auth.login(email.trim(), password);
        toast.success("Te-ai autentificat cu succes.");
        setShowTfa(true);
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "A apărut o eroare neașteptată.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    const value = code.join("");
    if (value.length !== 6) {
      toast.error("Introdu cele 6 cifre.");
      return;
    }
    setVerifying(true);
    try {
      await api<void>("/api/auth/2fa/verify", { method: "POST", body: { code: value } });
      toast.success("Verificare reușită.");
      setShowTfa(false);
      safeNavigate(navigate, redirectTo);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Codul nu este valid.");
    } finally {
      setVerifying(false);
    }
  };

  const audit = useMemo(() => activityQuery.data ?? [], [activityQuery.data]);

  return (
    <PageShell>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:py-16 lg:grid-cols-[1fr_1.1fr]">
        {/* Sign in / Register */}
        <section className="rounded-4xl border border-border bg-card p-7 shadow-soft md:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Securizat cu autentificare în doi pași
          </span>

          <div className="mt-5 flex items-center gap-2 rounded-full border border-border bg-surface p-1 text-sm">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 rounded-full px-3 py-1.5 transition-colors ${
                tab === "login" ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              Intră în cont
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`flex-1 rounded-full px-3 py-1.5 transition-colors ${
                tab === "register" ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              Cont nou
            </button>
          </div>

          <h1 className="mt-6 font-display text-3xl">
            {tab === "register"
              ? "Creează contul familiei tale"
              : "Autentifică-te pentru a continua"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Informațiile tale sunt private — doar tu și persoanele alese de tine le văd.
          </p>

          <form className="mt-8 space-y-4" onSubmit={submit}>
            {tab === "register" && (
              <div>
                <Label className="text-xs text-muted-foreground">Numele tău complet</Label>
                <Input
                  className="mt-2 h-12 rounded-xl"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Andrei Popescu"
                  autoComplete="name"
                  required
                />
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input
                className="mt-2 h-12 rounded-xl"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@exemplu.ro"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Parolă</Label>
              <Input
                className="mt-2 h-12 rounded-xl"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "register" ? "Cel puțin 8 caractere" : "••••••••"}
                autoComplete={tab === "register" ? "new-password" : "current-password"}
                required
                minLength={8}
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-xl text-base"
            >
              {submitting
                ? "Te rugăm să aștepți…"
                : tab === "register"
                  ? "Creează contul"
                  : "Continuă în siguranță"}
            </Button>
          </form>
        </section>

        {/* Audit */}
        <section>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-2xl">Jurnal de activitate</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {auth.isAuthenticated
              ? "O înregistrare imutabilă a ce s-a întâmplat în dosarul tău."
              : "Autentifică-te pentru a vedea istoricul activității din dosarul tău."}
          </p>

          {auth.isAuthenticated && audit.length > 0 && (
            <ol className="relative mt-6 space-y-3 border-l border-border pl-6">
              {audit.map((a) => {
                const Icon = ICONS_BY_KIND[a.kind] ?? Activity;
                return (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[31px] top-3 grid h-6 w-6 place-items-center rounded-full border border-border bg-background text-muted-foreground">
                      <Icon className="h-3 w-3" />
                    </span>
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <p className="text-sm">
                        <span className="font-medium">{a.actor}</span> {a.message}.
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(a.createdAt).toLocaleString("ro-RO")}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {auth.isAuthenticated && audit.length === 0 && !activityQuery.isLoading && (
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
              Niciun eveniment înregistrat încă.
            </div>
          )}

          <div className="mt-6 rounded-3xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-success" />
              <p className="text-sm">
                Datele sunt criptate la repaus și protejate prin controale de acces conforme GDPR.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* 2FA modal */}
      <AnimatePresence>
        {showTfa && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-5 backdrop-blur-sm"
            onClick={() => setShowTfa(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Verificare în doi pași"
          >
            <motion.div
              initial={{ scale: 0.96, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-lift"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-2xl">Confirmă că ești tu</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                În dezvoltare, orice cod din 6 cifre este acceptat (ex: 123456).
              </p>
              <div className="mt-6 flex justify-between gap-2">
                {code.map((c, i) => (
                  <input
                    key={i}
                    value={c}
                    maxLength={1}
                    inputMode="numeric"
                    aria-label={`Cifra ${i + 1}`}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      const next = [...code];
                      next[i] = v.slice(-1);
                      setCode(next);
                      const nextEl = document.getElementById(
                        `otp-${i + 1}`,
                      ) as HTMLInputElement | null;
                      if (v && nextEl) nextEl.focus();
                    }}
                    id={`otp-${i}`}
                    className="h-14 w-12 rounded-xl border border-border bg-background text-center text-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                ))}
              </div>
              <Button
                onClick={verifyOtp}
                disabled={verifying}
                className="mt-6 h-12 w-full rounded-xl"
              >
                {verifying ? "Verificăm…" : "Verifică și continuă"}
              </Button>
              <button
                onClick={() => {
                  setShowTfa(false);
                  safeNavigate(navigate, redirectTo);
                }}
                className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Sari peste acum
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
