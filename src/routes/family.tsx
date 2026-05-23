import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  UserPlus,
  CheckCircle2,
  Upload,
  MessageCircle,
  KeyRound,
  Eye,
  Trash2,
  ShieldCheck,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import {
  api,
  ApiError,
  type ActivityEntry,
  type ActivityKind,
  type FamilyMember,
  type MemberRole,
} from "@/lib/api";

export const Route = createFileRoute("/family")({
  head: () => ({ meta: [{ title: "Familie — After" }] }),
  component: Family,
});

const roleLabel: Record<MemberRole, string> = {
  ADMIN: "Familie · Administrator",
  FAMILY: "Familie",
  LAWYER: "Avocat",
  CAREGIVER: "Îngrijitor · Doar vizualizare",
};

const roleColor: Record<MemberRole, string> = {
  ADMIN: "bg-primary/15 text-primary",
  FAMILY: "bg-muted text-foreground",
  LAWYER: "bg-success/15 text-success-foreground",
  CAREGIVER: "bg-warning/20 text-warning-foreground",
};

const iconForKind: Record<ActivityKind, typeof Upload> = {
  UPLOAD: Upload,
  TASK_UPDATE: CheckCircle2,
  NOTE: MessageCircle,
  LOGIN: KeyRound,
  VIEW: Eye,
  INVITE: UserPlus,
  SECURITY: ShieldCheck,
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Family() {
  const auth = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("FAMILY");

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      navigate({ to: "/security", search: { redirect: "/family", mode: "login" } });
    }
  }, [auth.loading, auth.isAuthenticated, navigate]);

  const membersQuery = useQuery({
    queryKey: ["family-members"],
    queryFn: () => api<FamilyMember[]>("/api/family/members"),
    enabled: auth.isAuthenticated,
  });

  const activityQuery = useQuery({
    queryKey: ["activity"],
    queryFn: () => api<ActivityEntry[]>("/api/activity?limit=12"),
    enabled: auth.isAuthenticated,
  });

  const invite = useMutation({
    mutationFn: (input: { name: string; email: string; role: MemberRole }) =>
      api<FamilyMember>("/api/family/members", { method: "POST", body: input }),
    onSuccess: (m) => {
      toast.success(`Invitație trimisă către ${m.name}.`);
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      setOpen(false);
      setName("");
      setEmail("");
      setRole("FAMILY");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Invitația nu a putut fi creată."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api<void>(`/api/family/members/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Accesul a fost eliminat.");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Nu am putut elimina."),
  });

  const members = membersQuery.data ?? [];
  const activity = activityQuery.data ?? [];

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
      <div className="mx-auto max-w-5xl px-5 py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl">Mergeți împreună pe acest drum</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Invită membri ai familiei, avocatul tău sau un îngrijitor. Tu decizi ce poate vedea
              fiecare.
            </p>
          </div>
          <Button className="h-11 rounded-full px-5" onClick={() => setOpen(true)}>
            <UserPlus className="mr-1.5 h-4 w-4" /> Invită pe cineva
          </Button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <section>
            <h2 className="font-display text-xl">Persoane cu acces</h2>
            <ul className="mt-4 space-y-3">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft"
                >
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-full font-medium ${roleColor[m.role]}`}
                  >
                    {initials(m.name)}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {roleLabel[m.role]} · {m.email}
                    </p>
                    {m.status === "PENDING" && (
                      <span className="mt-1 inline-flex rounded-full bg-warning/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-warning-foreground">
                        Invitație în așteptare
                      </span>
                    )}
                  </div>
                  {m.role !== "ADMIN" && (
                    <button
                      className="rounded-full border border-border bg-background p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Elimină"
                      onClick={() => {
                        if (confirm(`Elimini accesul lui ${m.name}?`)) remove.mutate(m.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
              {members.length === 0 && !membersQuery.isLoading && (
                <li className="rounded-3xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                  Nimeni invitat încă.
                </li>
              )}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl">Activitate recentă</h2>
            <ol className="mt-4 space-y-3">
              {activity.map((a) => {
                const Icon = iconForKind[a.kind] ?? MessageCircle;
                return (
                  <li
                    key={a.id}
                    className="flex gap-4 rounded-3xl border border-border bg-card p-4"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-soft text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{a.actor}</span> {a.message}.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.createdAt).toLocaleString("ro-RO")}
                      </p>
                    </div>
                  </li>
                );
              })}
              {activity.length === 0 && !activityQuery.isLoading && (
                <li className="rounded-3xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                  Niciun eveniment recent.
                </li>
              )}
            </ol>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-5 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.form
              initial={{ scale: 0.96, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim() || !email.trim()) {
                  toast.error("Completează numele și emailul.");
                  return;
                }
                invite.mutate({ name: name.trim(), email: email.trim(), role });
              }}
              className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-lift"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl">Invită pe cineva</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-surface-soft"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Persoana invitată va primi un email cu instrucțiuni pentru a se alătura.
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Nume</Label>
                  <Input
                    className="mt-2 h-11 rounded-xl"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Elena Popescu"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input
                    type="email"
                    className="mt-2 h-11 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@exemplu.ro"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Rol</Label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as MemberRole)}
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="FAMILY">Familie</option>
                    <option value="LAWYER">Avocat</option>
                    <option value="CAREGIVER">Îngrijitor (doar vizualizare)</option>
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={invite.isPending}
                className="mt-6 h-11 w-full rounded-xl"
              >
                {invite.isPending ? "Trimitem…" : "Trimite invitația"}
              </Button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
