import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Clock,
  FileWarning,
  Hourglass,
  MapPin,
  Bell,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  api,
  ApiError,
  type CaseResponse,
  type Task,
  type TaskPhase,
  type TaskStatus,
} from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Planul tău — After" }] }),
  component: Dashboard,
});

const statusMeta: Record<TaskStatus, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  DONE: { label: "Finalizat", icon: CheckCircle2, cls: "bg-success/15 text-success-foreground" },
  PENDING: { label: "În lucru", icon: Clock, cls: "bg-primary/10 text-primary" },
  WAITING: { label: "În așteptare", icon: Hourglass, cls: "bg-muted text-muted-foreground" },
  MISSING: {
    label: "Lipsește un document",
    icon: FileWarning,
    cls: "bg-warning/20 text-warning-foreground",
  },
};

const phaseMeta: Record<TaskPhase, { title: string; subtitle: string }> = {
  IMMEDIATE: { title: "Imediat", subtitle: "Acestea închid hârtiile de urgență." },
  THIS_WEEK: { title: "Săptămâna aceasta", subtitle: "Planifică-le când te simți pregătit." },
  LONG_TERM: {
    title: "Pe termen lung",
    subtitle: "Succesiunea cere timp. Îți reamintim cu blândețe.",
  },
};

function Dashboard() {
  const auth = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      navigate({ to: "/security", search: { redirect: "/dashboard", mode: "login" } });
    }
  }, [auth.loading, auth.isAuthenticated, navigate]);

  const caseQuery = useQuery({
    queryKey: ["case"],
    queryFn: () => api<CaseResponse>("/api/cases/me"),
    enabled: auth.isAuthenticated,
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api<Task[]>("/api/tasks"),
    enabled: auth.isAuthenticated,
  });

  const updateStatus = useMutation({
    mutationFn: (input: { id: string; status: TaskStatus }) =>
      api<Task>(`/api/tasks/${input.id}/status`, {
        method: "PATCH",
        body: { status: input.status },
      }),
    onSuccess: (t) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["case"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      toast.success(`„${t.title}” → ${statusMeta[t.status].label}`);
      setOpenTask((prev) => (prev && prev.id === t.id ? t : prev));
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Nu am putut actualiza."),
  });

  const updateNote = useMutation({
    mutationFn: (input: { id: string; note: string }) =>
      api<Task>(`/api/tasks/${input.id}/note`, { method: "PATCH", body: { note: input.note } }),
    onSuccess: (t) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Nota a fost salvată.");
      setOpenTask(t);
    },
  });

  const grouped = useMemo(() => {
    const out: Record<TaskPhase, Task[]> = { IMMEDIATE: [], THIS_WEEK: [], LONG_TERM: [] };
    for (const t of tasksQuery.data ?? []) out[t.phase].push(t);
    return out;
  }, [tasksQuery.data]);

  const caseInfo = caseQuery.data;
  const total = caseInfo?.totalTasks ?? 0;
  const done = caseInfo?.completedTasks ?? 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isEmpty = !tasksQuery.isLoading && (tasksQuery.data?.length ?? 0) === 0;

  if (auth.loading || !auth.isAuthenticated) {
    return (
      <PageShell>
        <div className="mx-auto max-w-6xl px-5 py-16 text-sm text-muted-foreground">
          Se încarcă…
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        {/* Header card */}
        <div className="rounded-4xl border border-border bg-surface p-7 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {caseInfo ? `Plan pentru familia ${caseInfo.familyName}` : "Planul tău"}
              </p>
              <h1 className="mt-2 font-display text-3xl md:text-4xl">
                Bine ai revenit, {auth.user?.fullName?.split(" ")[0] ?? "prieten drag"}.
              </h1>
              <p className="mt-2 max-w-xl text-muted-foreground">
                {total === 0 ? (
                  "Completează chestionarul scurt ca să-ți pregătim un plan personalizat."
                ) : (
                  <>
                    Ai finalizat{" "}
                    <span className="text-foreground">
                      {done} din {total}
                    </span>{" "}
                    pași. Ia-ți timpul de care ai nevoie — ținem planul actualizat pentru tine.
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/translator">
                <Button variant="outline" className="rounded-full">
                  <Bell className="mr-1.5 h-4 w-4" /> Întreabă-mă orice
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>

        {isEmpty && (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
            <h2 className="font-display text-2xl">Planul tău e gol</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Spune-ne pe scurt ce s-a întâmplat ca să-ți construim cronologia personalizată.
            </p>
            <Link to="/onboarding" className="mt-4 inline-block">
              <Button className="rounded-full">Începe chestionarul</Button>
            </Link>
          </div>
        )}

        {/* Sections */}
        <div className="mt-10 space-y-12">
          {(["IMMEDIATE", "THIS_WEEK", "LONG_TERM"] as TaskPhase[]).map((phase, si) => {
            const list = grouped[phase];
            if (list.length === 0) return null;
            const meta = phaseMeta[phase];
            return (
              <section key={phase}>
                <div className="mb-4 flex items-baseline justify-between">
                  <div>
                    <h2 className="font-display text-2xl">{meta.title}</h2>
                    <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {list.map((t, i) => {
                    const m = statusMeta[t.status];
                    return (
                      <motion.button
                        key={t.id}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.4, delay: si * 0.05 + i * 0.04 }}
                        onClick={() => {
                          setOpenTask(t);
                          setNoteDraft(t.note ?? "");
                        }}
                        className="group flex flex-col rounded-3xl border border-border bg-card p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${m.cls}`}
                          >
                            <m.icon className="h-3.5 w-3.5" /> {m.label}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <h3 className="mt-4 font-display text-lg leading-snug text-balance">
                          {t.title}
                        </h3>
                        {t.place && (
                          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" /> {t.place}
                          </p>
                        )}
                        {t.note && (
                          <p className="mt-4 rounded-xl bg-warning/15 px-3 py-2 text-xs text-warning-foreground line-clamp-2">
                            {t.note}
                          </p>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Task detail drawer */}
      {openTask && (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-foreground/30 p-0 backdrop-blur-sm sm:place-items-center sm:p-5"
          onClick={() => setOpenTask(null)}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-t-3xl border border-border bg-card p-7 shadow-lift sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${statusMeta[openTask.status].cls}`}
                >
                  {statusMeta[openTask.status].label}
                </span>
                <h3 className="mt-3 font-display text-2xl">{openTask.title}</h3>
                {openTask.place && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {openTask.place}
                  </p>
                )}
              </div>
              <button
                onClick={() => setOpenTask(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-surface-soft"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {openTask.description && (
              <p className="mt-5 text-sm leading-relaxed text-foreground/90">
                {openTask.description}
              </p>
            )}

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Schimbă statusul
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["DONE", "PENDING", "WAITING", "MISSING"] as TaskStatus[]).map((s) => {
                  const active = openTask.status === s;
                  return (
                    <button
                      key={s}
                      disabled={updateStatus.isPending}
                      onClick={() => updateStatus.mutate({ id: openTask.id, status: s })}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background hover:bg-surface-soft"
                      }`}
                    >
                      {statusMeta[s].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Notițele tale
              </p>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Adaugă o notă personală — ex: numele funcționarului, ora vizitei…"
                rows={3}
                className="mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={updateNote.isPending || noteDraft === (openTask.note ?? "")}
                  onClick={() => updateNote.mutate({ id: openTask.id, note: noteDraft })}
                >
                  {updateNote.isPending ? "Salvăm…" : "Salvează nota"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </PageShell>
  );
}
