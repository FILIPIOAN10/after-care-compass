import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CheckCircle2, Clock, FileWarning, Hourglass, MapPin, Bell, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Your plan — After" }] }),
  component: Dashboard,
});

type Status = "done" | "pending" | "waiting" | "missing";
const statusMeta: Record<Status, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  done: { label: "Completed", icon: CheckCircle2, cls: "bg-success/15 text-success-foreground" },
  pending: { label: "Pending", icon: Clock, cls: "bg-primary/10 text-primary" },
  waiting: { label: "Waiting", icon: Hourglass, cls: "bg-muted text-muted-foreground" },
  missing: { label: "Needs a document", icon: FileWarning, cls: "bg-warning/20 text-warning-foreground" },
};

const sections: { title: string; subtitle: string; tasks: { title: string; place: string; status: Status; note?: string }[] }[] = [
  {
    title: "Right away",
    subtitle: "These help close the immediate paperwork.",
    tasks: [
      { title: "Register the death at the local council", place: "Primăria Sector 2", status: "done" },
      { title: "Request the official death certificate", place: "Starea Civilă", status: "pending" },
      { title: "Notify the employer", place: "By email or letter", status: "missing", note: "We still need one document to continue." },
    ],
  },
  {
    title: "This week",
    subtitle: "Plan these when you feel ready.",
    tasks: [
      { title: "Cancel the ID card and passport", place: "Evidența Persoanelor", status: "waiting" },
      { title: "Notify the family doctor", place: "Cabinet medical", status: "pending" },
      { title: "Apply for the funeral allowance", place: "Casa de Pensii", status: "pending" },
    ],
  },
  {
    title: "Long-term",
    subtitle: "Succession takes time. We'll remind you gently.",
    tasks: [
      { title: "Open the succession file", place: "Notar public", status: "waiting" },
      { title: "Transfer vehicle ownership", place: "DRPCIV", status: "waiting" },
      { title: "Update utility contracts", place: "Furnizori", status: "waiting" },
    ],
  },
];

function Dashboard() {
  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        {/* Header card */}
        <div className="rounded-4xl border border-border bg-surface p-7 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Plan for the Popescu family</p>
              <h1 className="mt-2 font-display text-3xl md:text-4xl">Welcome back, Andrei.</h1>
              <p className="mt-2 max-w-xl text-muted-foreground">
                You've completed <span className="text-foreground">4 of 12</span> steps. Take your time —
                we'll keep your plan up to date.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm hover:bg-surface-soft">
                <Bell className="h-4 w-4" /> Reminders
              </button>
            </div>
          </div>
          <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "33%" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>

        {/* Sections */}
        <div className="mt-10 space-y-12">
          {sections.map((sec, si) => (
            <section key={sec.title}>
              <div className="mb-4 flex items-baseline justify-between">
                <div>
                  <h2 className="font-display text-2xl">{sec.title}</h2>
                  <p className="text-sm text-muted-foreground">{sec.subtitle}</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {sec.tasks.map((t, i) => {
                  const m = statusMeta[t.status];
                  return (
                    <motion.button
                      key={t.title}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.4, delay: (si * 0.05) + (i * 0.04) }}
                      className="group flex flex-col rounded-3xl border border-border bg-card p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${m.cls}`}>
                          <m.icon className="h-3.5 w-3.5" /> {m.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <h3 className="mt-4 font-display text-lg leading-snug text-balance">{t.title}</h3>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {t.place}
                      </p>
                      {t.note && (
                        <p className="mt-4 rounded-xl bg-warning/15 px-3 py-2 text-xs text-warning-foreground">
                          {t.note}
                        </p>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
