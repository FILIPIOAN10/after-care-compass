import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, CheckCircle2, Upload, MessageCircle } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/family")({
  head: () => ({ meta: [{ title: "Familie — After" }] }),
  component: Family,
});

const members = [
  { name: "Andrei Popescu", role: "Familie · Administrator", color: "bg-primary/15 text-primary" },
  { name: "Elena Popescu", role: "Familie", color: "bg-muted text-foreground" },
  { name: "Av. Mihai Stan", role: "Avocat", color: "bg-success/15 text-success-foreground" },
  { name: "Dana (îngrijitor)", role: "Îngrijitor · Doar vizualizare", color: "bg-warning/20 text-warning-foreground" },
];

const activity = [
  { who: "Elena", what: "a încărcat Certificatul de căsătorie", when: "acum 2 ore", icon: Upload },
  { who: "Av. Mihai Stan", what: "a marcat Dosarul de succesiune ca fiind în lucru", when: "ieri", icon: CheckCircle2 },
  { who: "Andrei", what: "a lăsat o notă la Ajutorul de înmormântare", when: "acum 2 zile", icon: MessageCircle },
];

function Family() {
  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-5 py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl">Mergeți împreună pe acest drum</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Invită membri ai familiei, avocatul tău sau un îngrijitor. Tu decizi ce poate vedea fiecare.
            </p>
          </div>
          <Button className="h-11 rounded-full px-5">
            <UserPlus className="mr-1.5 h-4 w-4" /> Invită pe cineva
          </Button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <section>
            <h2 className="font-display text-xl">Persoane cu acces</h2>
            <ul className="mt-4 space-y-3">
              {members.map((m) => (
                <li key={m.name} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft">
                  <span className={`grid h-11 w-11 place-items-center rounded-full font-medium ${m.color}`}>
                    {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.role}</p>
                  </div>
                  <button className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-surface-soft">Gestionează</button>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl">Activitate recentă</h2>
            <ol className="mt-4 space-y-3">
              {activity.map((a, i) => (
                <li key={i} className="flex gap-4 rounded-3xl border border-border bg-card p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-soft text-muted-foreground">
                    <a.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm"><span className="font-medium">{a.who}</span> {a.what}.</p>
                    <p className="text-xs text-muted-foreground">{a.when}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
