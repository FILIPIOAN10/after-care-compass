import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Settings, ExternalLink, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getApiBase,
  getStoredApiUrl,
  hasBuildTimeApiUrl,
  pingApi,
  setStoredApiUrl,
} from "@/lib/api";

type Status = "checking" | "online" | "offline";

function isLikelyMixedContentBlocked() {
  if (typeof window === "undefined") return false;
  return window.location.protocol === "https:" && getApiBase().startsWith("http://");
}

export function ApiConnectivity() {
  const [status, setStatus] = useState<Status>("checking");
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string>("");
  const [savedTick, setSavedTick] = useState(0);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();
    setStatus("checking");
    pingApi(controller.signal).then((ok) => {
      if (aborted) return;
      setStatus(ok ? "online" : "offline");
      if (ok) {
        setShowOnlineToast(true);
        const t = setTimeout(() => setShowOnlineToast(false), 1500);
        return () => clearTimeout(t);
      }
    });
    return () => {
      aborted = true;
      controller.abort();
    };
  }, [savedTick]);

  useEffect(() => {
    const onChange = () => setSavedTick((n) => n + 1);
    if (typeof window === "undefined") return;
    window.addEventListener("after:api-url-changed", onChange);
    return () => window.removeEventListener("after:api-url-changed", onChange);
  }, []);

  useEffect(() => {
    if (open) setUrl(getStoredApiUrl() ?? getApiBase());
  }, [open]);

  if (status !== "offline") {
    // Mic indicator efemer la conectare reușită (după o reconfigurare).
    return (
      <AnimatePresence>
        {showOnlineToast && (
          <motion.div
            key="online"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed left-1/2 top-20 z-30 -translate-x-1/2 rounded-full border border-success/30 bg-success/15 px-4 py-1.5 text-xs text-success-foreground shadow-soft"
          >
            <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Conectat la backend
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  const isMixed = isLikelyMixedContentBlocked();

  return (
    <>
      <div className="border-b border-warning/30 bg-warning/15 text-warning-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="flex-1">
            <strong>Backend indisponibil.</strong>{" "}
            {isMixed
              ? "Site-ul rulează pe HTTPS dar API-ul este pe HTTP — browser-ul blochează cererile."
              : "Aplicația nu poate contacta serverul la "}
            {!isMixed && (
              <code className="rounded bg-warning/30 px-1.5 py-0.5 text-xs">{getApiBase()}</code>
            )}
            {hasBuildTimeApiUrl()
              ? " (setat la compilare prin VITE_API_URL)."
              : " Setează un URL accesibil mai jos."}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-warning-foreground/30 bg-card"
            onClick={() => setOpen(true)}
          >
            <Settings className="mr-1 h-3.5 w-3.5" /> Setări API
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-5 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Setări API"
          >
            <motion.div
              initial={{ scale: 0.96, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl border border-border bg-card p-7 shadow-lift"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl">Setări API</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Spune-i frontend-ului unde rulează backend-ul tău Spring Boot.
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-surface-soft"
                  aria-label="Închide"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-2 rounded-2xl bg-surface p-4 text-xs text-muted-foreground">
                <p>
                  <strong className="text-foreground">Vrei să rulezi local?</strong> Pornește
                  backend-ul cu{" "}
                  <code className="rounded bg-card px-1.5 py-0.5">./mvnw spring-boot:run</code> (sau{" "}
                  <code className="rounded bg-card px-1.5 py-0.5">.\\mvnw.cmd</code> pe Windows) și
                  folosește URL-ul implicit{" "}
                  <code className="rounded bg-card px-1.5 py-0.5">http://localhost:8090</code>.
                </p>
                <p>
                  <strong className="text-foreground">Vrei să deploiezi gratuit?</strong> Repo-ul
                  are <code className="rounded bg-card px-1.5 py-0.5">render.yaml</code> —{" "}
                  <a
                    href="https://render.com/deploy"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                  >
                    Deploy pe Render <ExternalLink className="h-3 w-3" />
                  </a>
                  . După deploy, copiază URL-ul aici (ex:{" "}
                  <code className="rounded bg-card px-1.5 py-0.5">
                    https://after-api.onrender.com
                  </code>
                  ).
                </p>
              </div>

              <div className="mt-6">
                <Label className="text-xs text-muted-foreground">Adresa backend-ului</Label>
                <Input
                  className="mt-2 h-12 rounded-xl font-mono text-sm"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://after-api.onrender.com"
                  autoFocus
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Valoarea curentă: <code>{getApiBase()}</code>
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => {
                    setStoredApiUrl(null);
                    setOpen(false);
                  }}
                >
                  Resetează
                </Button>
                <Button
                  className="rounded-full"
                  onClick={() => {
                    const trimmed = url.trim();
                    if (!trimmed) {
                      setStoredApiUrl(null);
                    } else {
                      setStoredApiUrl(trimmed);
                    }
                    setOpen(false);
                  }}
                >
                  Salvează și încearcă din nou
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
