import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Hospital,
  Home,
  Plane,
  HeartPulse,
  Sparkles,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";
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
  type DocumentResponse,
  type OnboardingRequest,
  type PlaceOfDeath,
} from "@/lib/api";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Începe — After" },
      { name: "description", content: "Un chestionar scurt și blând pentru a-ți construi planul." },
    ],
  }),
  component: Onboarding,
});

const placeOptions: { id: PlaceOfDeath; label: string; icon: typeof Hospital }[] = [
  { id: "HOSPITAL", label: "La spital", icon: Hospital },
  { id: "HOME", label: "Acasă", icon: Home },
  { id: "ABROAD", label: "În străinătate", icon: Plane },
  { id: "CARE_FACILITY", label: "Într-un centru de îngrijire", icon: HeartPulse },
];

const steps = ["Locul", "Documente", "Detalii", "Context"] as const;

type YesNoUnknown = "yes" | "no" | "unknown";

const questions: {
  key: keyof Omit<
    OnboardingRequest,
    "placeOfDeath" | "deceasedName" | "deceasedCnp" | "deathDate" | "deathPlace" | "maritalStatus"
  >;
  label: string;
}[] = [
  { key: "wasRetired", label: "Era pensionar/ă?" },
  { key: "ownedProperty", label: "Deținea o proprietate?" },
  { key: "ownedVehicle", label: "Deținea un autovehicul?" },
  { key: "wasCompanyAdmin", label: "Era asociat/administrator de firmă?" },
  { key: "hasSurvivingFamily", label: "Există soț/soție supraviețuitor sau copii?" },
];

function Onboarding() {
  const auth = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [place, setPlace] = useState<PlaceOfDeath | "">("");
  const [deceasedName, setDeceasedName] = useState("");
  const [deceasedCnp, setDeceasedCnp] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [deathPlace, setDeathPlace] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [answers, setAnswers] = useState<Record<string, YesNoUnknown>>({});

  // Pentru pasul „Documente" avem nevoie de un cont. Dacă nu există, deschidem flow-ul de înregistrare.
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated && step >= 1) {
      toast.info("Creează un cont rapid ca să-ți salvăm documentele.");
      navigate({ to: "/security", search: { redirect: "/onboarding", mode: "register" } });
    }
  }, [auth.loading, auth.isAuthenticated, step, navigate]);

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: () => api<DocumentResponse[]>("/api/documents"),
    enabled: auth.isAuthenticated,
  });

  const uploadMutation = useMutation({
    mutationFn: async (input: { file: File; name: string; category: string }) => {
      const fd = new FormData();
      fd.append("file", input.file);
      fd.append("name", input.name);
      fd.append("category", input.category);
      return api<DocumentResponse>("/api/documents", { method: "POST", body: fd });
    },
    onSuccess: (d) => {
      toast.success(`„${d.name}” a fost încărcat.`);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Încărcarea a eșuat."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api<void>(`/api/documents/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const submitMutation = useMutation({
    mutationFn: (req: OnboardingRequest) =>
      api<unknown>("/api/cases/me/onboarding", { method: "POST", body: req }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Planul tău este pregătit.");
      navigate({ to: "/dashboard" });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Nu am putut salva răspunsurile."),
  });

  const next = () => {
    if (step === 0 && !place) {
      toast.error("Te rugăm să alegi unde a avut loc decesul.");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const progress = ((step + 1) / steps.length) * 100;

  const finish = () => {
    if (!place) {
      toast.error("Selectează unde a avut loc decesul.");
      setStep(0);
      return;
    }
    if (!auth.isAuthenticated) {
      navigate({ to: "/security", search: { redirect: "/onboarding", mode: "register" } });
      return;
    }
    const req: OnboardingRequest = {
      placeOfDeath: place,
      deceasedName: deceasedName || undefined,
      deceasedCnp: deceasedCnp || undefined,
      deathDate: deathDate || undefined,
      deathPlace: deathPlace || undefined,
      maritalStatus: maritalStatus || undefined,
      wasRetired: answers["wasRetired"] === "yes",
      ownedProperty: answers["ownedProperty"] === "yes",
      ownedVehicle: answers["ownedVehicle"] === "yes",
      wasCompanyAdmin: answers["wasCompanyAdmin"] === "yes",
      hasSurvivingFamily: answers["hasSurvivingFamily"] === "yes",
    };
    submitMutation.mutate(req);
  };

  const uploadedDocs = useMemo(() => documentsQuery.data ?? [], [documentsQuery.data]);

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-2xl px-5 py-12 md:py-20">
        {/* progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Pasul {step + 1} din {steps.length}
            </span>
            <span>{steps[step]}</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {step === 0 && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Condoleanțele noastre pentru pierderea ta.
                </p>
                <h1 className="mt-2 font-display text-3xl md:text-4xl">Unde a avut loc decesul?</h1>
                <p className="mt-3 text-muted-foreground">
                  Ne ajută să pregătim documentele potrivite. Poți schimba mai târziu.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {placeOptions.map((o) => {
                    const selected = place === o.id;
                    return (
                      <button
                        key={o.id}
                        onClick={() => setPlace(o.id)}
                        className={`group flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                          selected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border bg-card hover:border-foreground/20"
                        }`}
                      >
                        <span
                          className={`grid h-11 w-11 place-items-center rounded-xl ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                        >
                          <o.icon className="h-5 w-5" />
                        </span>
                        <span className="font-medium">{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h1 className="font-display text-3xl md:text-4xl">Încarcă ce ai la îndemână</h1>
                <p className="mt-3 text-muted-foreground">
                  Adaugă documentele primite. Sunt stocate în siguranță în Centrul de documente.
                </p>
                <div className="mt-8 space-y-3">
                  {["Certificat de deces", "Carte de identitate", "Alt document"].map((d) => (
                    <label
                      key={d}
                      className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-border bg-card p-5 transition-colors hover:border-foreground/30"
                    >
                      <div className="flex items-center gap-4">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-muted-foreground">
                          <FileText className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-medium">{d}</p>
                          <p className="text-xs text-muted-foreground">
                            PDF, JPG sau HEIC · până la 25MB
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1.5 text-xs">
                        <Upload className="h-3.5 w-3.5" /> Adaugă fișier
                      </span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          uploadMutation.mutate({
                            file: f,
                            name: d,
                            category: d.includes("identitate") ? "Identitate" : "Identitate",
                          });
                          e.target.value = "";
                        }}
                      />
                    </label>
                  ))}
                </div>

                {uploadedDocs.length > 0 && (
                  <div className="mt-6 space-y-2 rounded-2xl border border-border bg-surface p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Deja încărcate
                    </p>
                    {uploadedDocs.slice(0, 5).map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between rounded-xl bg-card p-3 text-sm"
                      >
                        <span className="truncate">{d.name}</span>
                        <button
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => deleteMutation.mutate(d.id)}
                          aria-label="Șterge"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-6 text-xs text-muted-foreground">
                  Poți sări peste și adăuga documentele mai târziu din Centrul de documente.
                </p>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Confirmă datele de mai jos
                </div>
                <h1 className="mt-3 font-display text-3xl md:text-4xl">
                  Câteva detalii despre persoana iubită
                </h1>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Nume complet</Label>
                    <Input
                      className="mt-2 h-12 rounded-xl"
                      value={deceasedName}
                      onChange={(e) => setDeceasedName(e.target.value)}
                      placeholder="Ex: Maria Popescu"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">CNP</Label>
                    <Input
                      className="mt-2 h-12 rounded-xl"
                      value={deceasedCnp}
                      onChange={(e) => setDeceasedCnp(e.target.value)}
                      placeholder="13 cifre"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Data decesului</Label>
                    <Input
                      type="date"
                      className="mt-2 h-12 rounded-xl"
                      value={deathDate}
                      onChange={(e) => setDeathDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Locul decesului</Label>
                    <Input
                      className="mt-2 h-12 rounded-xl"
                      value={deathPlace}
                      onChange={(e) => setDeathPlace(e.target.value)}
                      placeholder="Ex: București"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Stare civilă</Label>
                    <Input
                      className="mt-2 h-12 rounded-xl"
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      placeholder="Ex: Căsătorit(ă), Văduv(ă), Necăsătorit(ă)"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="font-display text-3xl md:text-4xl">Câteva întrebări în plus</h1>
                <p className="mt-3 text-muted-foreground">
                  Acestea îți modelează cronologia personală. Nu există răspunsuri greșite.
                </p>
                <div className="mt-8 space-y-3">
                  {questions.map((q) => {
                    const current = answers[q.key];
                    return (
                      <div
                        key={q.key}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
                      >
                        <p className="text-sm md:text-base">{q.label}</p>
                        <div className="flex gap-2">
                          {(
                            [
                              { v: "yes", l: "Da" },
                              { v: "no", l: "Nu" },
                              { v: "unknown", l: "Nu știu" },
                            ] as { v: YesNoUnknown; l: string }[]
                          ).map((c) => {
                            const active = current === c.v;
                            return (
                              <button
                                key={c.v}
                                onClick={() => setAnswers((a) => ({ ...a, [q.key]: c.v }))}
                                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                                  active
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-border bg-background hover:bg-surface-soft"
                                }`}
                              >
                                {c.l}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0} className="rounded-full">
            <ArrowLeft className="mr-1 h-4 w-4" /> Înapoi
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={next} className="h-11 rounded-full px-6">
              Continuă <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={finish}
              disabled={submitMutation.isPending}
              className="h-11 rounded-full px-6"
            >
              {submitMutation.isPending ? (
                "Salvăm…"
              ) : (
                <>
                  Vezi planul meu <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  );
}
