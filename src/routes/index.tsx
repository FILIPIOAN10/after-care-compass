import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, HeartHandshake, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "After — When grief comes first, not paperwork" },
      { name: "description", content: "After guides Romanian families step-by-step through the legal and administrative process following a loss." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grain opacity-60" />
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 md:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Quiet, secure, and made for Romania
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-balance md:text-6xl">
              When someone dies, families should grieve —
              <span className="text-muted-foreground"> not coordinate bureaucracy.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground text-pretty md:text-lg">
              After guides families step-by-step through the legal and administrative process that
              follows a loss, with calm language and gentle reminders.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/onboarding">
                <Button size="lg" className="h-12 rounded-full px-6 text-base">
                  Start guidance <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="ghost" className="h-12 rounded-full px-6 text-base">
                  Learn more
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No account required to begin · Takes 4 minutes</p>
          </motion.div>

          {/* Hero card preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-16 max-w-3xl"
          >
            <div className="rounded-4xl border border-border bg-card p-2 shadow-lift">
              <div className="rounded-[calc(var(--radius)+16px)] bg-surface p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Your next step</p>
                    <p className="mt-1 font-display text-2xl">Register the death at the local council</p>
                  </div>
                  <span className="rounded-full bg-success/15 px-3 py-1 text-xs text-success-foreground">Day 1–3</span>
                </div>
                <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "34%" }}
                    transition={{ duration: 1.2, delay: 0.6 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {[
                    { t: "Death certificate", s: "Uploaded" },
                    { t: "Notify employer", s: "Pending" },
                    { t: "Begin succession", s: "Waiting" },
                  ].map((c) => (
                    <div key={c.t} className="rounded-2xl border border-border bg-card p-4">
                      <p className="text-sm font-medium">{c.t}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{c.s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-border/60 bg-surface/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-8 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> GDPR compliant</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> End-to-end encrypted</span>
          <span className="inline-flex items-center gap-2"><HeartHandshake className="h-4 w-4 text-primary" /> Built with bereavement counselors</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> ROeID compatible</span>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl md:text-4xl">A gentler path through paperwork</h2>
          <p className="mt-3 text-muted-foreground">
            Every screen answers one question: <em>what should I do next?</em>
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            { icon: Sparkles, title: "Tell us what happened", body: "A short, kind questionnaire shapes a plan specific to your family." },
            { icon: FileText, title: "Upload documents once", body: "We read what's needed and pre-fill forms for institutions." },
            { icon: CheckCircle2, title: "Follow a calm timeline", body: "Tasks appear when you need them — never more than a few at a time." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-3xl border border-border bg-card p-7 shadow-soft"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <blockquote className="rounded-4xl border border-border bg-surface px-8 py-12 text-center md:px-16 md:py-16">
          <p className="font-display text-2xl leading-snug md:text-3xl text-balance">
            “After felt like a quiet hand on my shoulder. It told me only what I needed,
            and only when I was ready.”
          </p>
          <footer className="mt-6 text-sm text-muted-foreground">— Ioana, Cluj-Napoca</footer>
        </blockquote>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-28">
        <div className="overflow-hidden rounded-4xl bg-foreground px-8 py-14 text-background md:px-16 md:py-20">
          <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="font-display text-3xl md:text-4xl text-balance">
                Begin when you're ready. Pause whenever you need.
              </h2>
              <p className="mt-3 max-w-xl text-background/70">
                Your progress is saved privately. You can invite a family member or lawyer at any time.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link to="/onboarding">
                <Button size="lg" variant="secondary" className="h-12 rounded-full px-6 text-base">
                  Start guidance
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
