import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, KeyRound, Eye, Lock, Activity } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/security")({
  head: () => ({ meta: [{ title: "Sign in — After" }] }),
  component: Security,
});

const audit = [
  { t: "Andrei signed in from Bucharest", time: "Today · 09:21", icon: KeyRound },
  { t: "Av. Mihai Stan viewed Succession file", time: "Yesterday · 16:04", icon: Eye },
  { t: "Marriage certificate uploaded by Elena", time: "13 May · 11:12", icon: Lock },
  { t: "2FA enabled for the family account", time: "10 May · 08:40", icon: ShieldCheck },
];

function Security() {
  const [showTfa, setShowTfa] = useState(false);
  return (
    <PageShell>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:py-16 lg:grid-cols-[1fr_1.1fr]">
        {/* Sign in */}
        <section className="rounded-4xl border border-border bg-card p-7 shadow-soft md:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Secured by ROeID
          </span>
          <h1 className="mt-4 font-display text-3xl">Sign in to continue</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your information is private to you and the people you choose.</p>

          <div className="mt-8 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Email or CNP</Label>
              <Input className="mt-2 h-12 rounded-xl" placeholder="you@example.com" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Password</Label>
              <Input type="password" className="mt-2 h-12 rounded-xl" placeholder="••••••••" />
            </div>
            <Button onClick={() => setShowTfa(true)} className="h-12 w-full rounded-xl text-base">
              Continue securely
            </Button>
            <button className="w-full rounded-xl border border-border bg-background py-3 text-sm hover:bg-surface-soft">
              Use ROeID app instead
            </button>
          </div>
        </section>

        {/* Audit */}
        <section>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-2xl">Activity & audit log</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">An immutable record of who did what, when.</p>

          <ol className="relative mt-6 space-y-3 border-l border-border pl-6">
            {audit.map((a, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[31px] top-3 grid h-6 w-6 place-items-center rounded-full border border-border bg-background text-muted-foreground">
                  <a.icon className="h-3 w-3" />
                </span>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm">{a.t}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-3xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-success" />
              <p className="text-sm">All data is encrypted at rest with AES-256 and protected by GDPR-aligned access controls.</p>
            </div>
          </div>
        </section>
      </div>

      {/* 2FA modal */}
      <AnimatePresence>
        {showTfa && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-5 backdrop-blur-sm"
            onClick={() => setShowTfa(false)}
            role="dialog" aria-modal="true" aria-label="Two factor verification"
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
              <h3 className="mt-4 font-display text-2xl">Verify it's you</h3>
              <p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit code we sent to your phone.</p>
              <div className="mt-6 flex justify-between gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    maxLength={1}
                    inputMode="numeric"
                    aria-label={`Digit ${i + 1}`}
                    className="h-14 w-12 rounded-xl border border-border bg-background text-center text-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                ))}
              </div>
              <Button className="mt-6 h-12 w-full rounded-xl">Verify and continue</Button>
              <button onClick={() => setShowTfa(false)} className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
