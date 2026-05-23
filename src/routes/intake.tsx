import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Send,
  Sparkles,
  CheckCircle2,
  Circle,
  MapPin,
  Clock,
  FileText,
  Upload,
  X,
  AlertTriangle,
  Mail,
  ShieldCheck,
  Loader2,
  Pencil,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/intake")({
  head: () => ({
    meta: [
      { title: "Începe — After" },
      {
        name: "description",
        content: "Spune-i lui After ce s-a întâmplat. Îți construim planul, documentele și pașii urgenți, pas cu pas.",
      },
    ],
  }),
  component: IntakePage,
});

// ===== Types =====

type ChatMsg = { role: "user" | "assistant"; content: string };

type UrgentStep = { title: string; what: string; where?: string; time?: string };
type PlanStep = UrgentStep;
type DocumentItem = { name: string; purpose: string; source?: string };

type Situation = {
  place: "hospital" | "home" | "care" | "public" | "abroad" | "unknown";
  nationality: "ro" | "eu" | "non_eu" | "unknown";
  hasMedicalCertificate: boolean;
  hasSpouse: boolean;
  hasMinorChildren: boolean;
  assets: string[];
  notes: string;
};

type Summary = {
  situation: Situation;
  urgentSteps: UrgentStep[];
  plan: PlanStep[];
  documents: DocumentItem[];
};

type Stage = "chat" | "confirm" | "urgent" | "upload" | "plan" | "approve";

const STAGE_ORDER: Stage[] = ["chat", "confirm", "urgent", "upload", "plan", "approve"];
const STAGE_LABEL: Record<Stage, string> = {
  chat: "Conversație",
  confirm: "Confirmare",
  urgent: "Pași urgenți",
  upload: "Documente",
  plan: "Plan generat",
  approve: "Aprobare",
};

const PLACE_LABEL: Record<Situation["place"], string> = {
  hospital: "La spital",
  home: "Acasă",
  care: "Centru de îngrijire",
  public: "Spațiu public / accident",
  abroad: "În străinătate",
  unknown: "Nespecificat",
};
const NAT_LABEL: Record<Situation["nationality"], string> = {
  ro: "Cetățean român",
  eu: "Cetățean UE / SEE",
  non_eu: "Cetățean non-UE",
  unknown: "Nespecificat",
};

// ===== Page =====

function IntakePage() {
  const [stage, setStage] = useState<Stage>("chat");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Îți transmitem condoleanțe. Sunt After și o să te ghidez cu calm. Ca să încep, poți să-mi spui unde a avut loc decesul? (spital, acasă, centru de îngrijire, spațiu public sau în străinătate)",
    },
  ]);
  const [summary, setSummary] = useState<Summary | null>(null);

  const goNext = () => {
    const i = STAGE_ORDER.indexOf(stage);
    if (i < STAGE_ORDER.length - 1) setStage(STAGE_ORDER[i + 1]);
  };
  const goBack = () => {
    const i = STAGE_ORDER.indexOf(stage);
    if (i > 0) setStage(STAGE_ORDER[i - 1]);
  };

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-3xl px-5 py-10 md:py-14">
        <StageBar stage={stage} />

        <AnimatePresence mode="wait">
          {stage === "chat" && (
            <StageChat
              key="chat"
              messages={messages}
              setMessages={setMessages}
              onContinue={goNext}
            />
          )}
          {stage === "confirm" && (
            <StageConfirm
              key="confirm"
              messages={messages}
              summary={summary}
              setSummary={setSummary}
              onBack={goBack}
              onContinue={goNext}
            />
          )}
          {stage === "urgent" && summary && (
            <StageUrgent
              key="urgent"
              summary={summary}
              onBack={goBack}
              onContinue={goNext}
            />
          )}
          {stage === "upload" && summary && (
            <StageUpload key="upload" summary={summary} onBack={goBack} onContinue={goNext} />
          )}
          {stage === "plan" && summary && (
            <StagePlan key="plan" summary={summary} onBack={goBack} onContinue={goNext} />
          )}
          {stage === "approve" && summary && (
            <StageApprove key="approve" summary={summary} onBack={goBack} />
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}

// ===== Stage bar =====

function StageBar({ stage }: { stage: Stage }) {
  const idx = STAGE_ORDER.indexOf(stage);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
        <span>
          Pas {idx + 1} din {STAGE_ORDER.length}
        </span>
        <span className="text-foreground/80">{STAGE_LABEL[stage]}</span>
      </div>
      <div className="mt-2 grid grid-cols-6 gap-1.5">
        {STAGE_ORDER.map((s, i) => (
          <span
            key={s}
            className={`h-1 rounded-full transition-colors ${
              i <= idx ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ===== Stage 1: Chat =====

function StageChat({
  messages,
  setMessages,
  onContinue,
}: {
  messages: ChatMsg[];
  setMessages: (updater: (prev: ChatMsg[]) => ChatMsg[]) => void;
  onContinue: () => void;
}) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const userTurns = messages.filter((m) => m.role === "user").length;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
  const aiSignaledDone = /Hai s[ăa] confirm[ăa]m|am tot ce ne trebuie/i.test(lastAssistant);
  const canContinue = (userTurns >= 4 || aiSignaledDone) && !isStreaming;

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setError(null);
    setInput("");
    const newHistory: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(() => newHistory);
    setIsStreaming(true);

    try {
      const resp = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "chat", messages: newHistory }),
      });

      if (resp.status === 429) throw new Error("Prea multe cereri. Mai încearcă în câteva secunde.");
      if (resp.status === 402) throw new Error("Creditele Lovable AI sunt epuizate.");
      if (!resp.ok || !resp.body) throw new Error("Nu am putut porni conversația. Mai încearcă.");

      // Insert empty assistant message we will fill.
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      let acc = "";

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              acc += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare necunoscută.");
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, setMessages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Spune-mi ce s-a întâmplat.</h1>
          <p className="text-sm text-muted-foreground">Câteva întrebări scurte. Răspunde cu propriile cuvinte.</p>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-6 max-h-[55vh] overflow-y-auto rounded-3xl border border-border bg-surface p-4 md:p-6"
      >
        <div className="space-y-4">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-relaxed md:text-base ${
                  m.role === "user"
                    ? "bg-foreground text-background"
                    : "border border-border bg-card text-foreground"
                }`}
              >
                {m.role === "assistant" && (
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">After</p>
                )}
                {m.content || (m.role === "assistant" && isStreaming ? "…" : "")}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card p-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Scrie aici…"
          disabled={isStreaming}
          className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Mesajul tău"
        />
        <Button onClick={send} disabled={!input.trim() || isStreaming} className="h-10 rounded-xl">
          {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {canContinue
            ? "Putem trece la confirmarea situației."
            : `Mai sunt câteva întrebări (${userTurns}/4 răspunsuri).`}
        </p>
        <Button
          onClick={onContinue}
          disabled={!canContinue}
          variant={canContinue ? "default" : "ghost"}
          className="rounded-full"
        >
          Continuă <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ===== Stage 2: Confirm =====

function StageConfirm({
  messages,
  summary,
  setSummary,
  onBack,
  onContinue,
}: {
  messages: ChatMsg[];
  summary: Summary | null;
  setSummary: (s: Summary) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [loading, setLoading] = useState(!summary);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (summary) return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch("/api/intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "summarize", messages }),
        });
        if (!resp.ok) throw new Error("Nu am putut construi rezumatul.");
        const data = (await resp.json()) as Summary;
        if (!cancelled) setSummary(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Eroare necunoscută.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [messages, summary, setSummary]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
    >
      <BackBtn onClick={onBack} />
      <h1 className="mt-4 font-display text-2xl md:text-3xl">Hai să confirmăm împreună.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Asta am înțeles din conversația noastră. Spune-mi dacă trebuie să corectez ceva.
      </p>

      {loading && (
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Construiesc rezumatul…
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {summary && (
        <div className="mt-6 space-y-4">
          <Card>
            <FieldRow label="Loc deces" value={PLACE_LABEL[summary.situation.place]} />
            <FieldRow label="Cetățenie" value={NAT_LABEL[summary.situation.nationality]} />
            <FieldRow
              label="Certificat medical"
              value={summary.situation.hasMedicalCertificate ? "Da, există deja" : "Nu încă"}
            />
            <FieldRow
              label="Familie"
              value={[
                summary.situation.hasSpouse ? "Soț/soție" : null,
                summary.situation.hasMinorChildren ? "Copii minori" : null,
              ]
                .filter(Boolean)
                .join(", ") || "Fără persoane în întreținere menționate"}
            />
            <FieldRow
              label="Bunuri menționate"
              value={summary.situation.assets.length ? summary.situation.assets.join(", ") : "Niciun bun menționat"}
            />
            {summary.situation.notes && (
              <p className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-sm text-foreground/80">{summary.situation.notes}</p>
            )}
          </Card>

          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Pencil className="h-3 w-3" /> Corectează prin conversație
          </button>
        </div>
      )}

      <div className="mt-10 flex justify-end">
        <Button disabled={!summary} onClick={onContinue} className="rounded-full">
          E corect, continuă <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ===== Stage 3: Urgent =====

function StageUrgent({
  summary,
  onBack,
  onContinue,
}: {
  summary: Summary;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDone((p) => {
      const n = new Set(p);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
    >
      <BackBtn onClick={onBack} />
      <span className="mt-4 inline-block rounded-full bg-warning/20 px-2.5 py-1 text-[10px] uppercase tracking-wider text-warning-foreground">
        Urgent · până la funeralii
      </span>
      <h1 className="mt-3 font-display text-2xl md:text-3xl">Pașii imediați.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Acești pași sunt obligatorii pentru ca înmormântarea să poată avea loc. Bifează când îi închei.
      </p>

      <ol className="mt-6 space-y-3">
        {summary.urgentSteps.map((s, i) => {
          const isDone = done.has(i);
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className={`rounded-2xl border border-border bg-card p-4 transition-opacity ${isDone ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggle(i)}
                  aria-pressed={isDone}
                  className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors ${
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </button>
                <div className="flex-1">
                  <h3 className={`font-display text-lg ${isDone ? "line-through decoration-1" : ""}`}>{s.title}</h3>
                  <p className="mt-1 text-sm text-foreground/80">{s.what}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {s.where && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {s.where}
                      </span>
                    )}
                    {s.time && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {s.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>

      <div className="mt-10 flex justify-end">
        <Button onClick={onContinue} className="rounded-full">
          Continuă cu documentele <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ===== Stage 4: Upload =====

function StageUpload({
  summary,
  onBack,
  onContinue,
}: {
  summary: Summary;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const added = Array.from(list).map((f) => ({ name: f.name, size: f.size }));
    setFiles((prev) => [...prev, ...added]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
    >
      <BackBtn onClick={onBack} />
      <h1 className="mt-4 font-display text-2xl md:text-3xl">Încarcă documentele pe care le ai.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Adaugă fotografii sau scanări. Pe restul ți le pregătim noi.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`mt-6 cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border bg-surface hover:bg-surface-soft"
        }`}
      >
        <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm">
          <span className="font-medium text-foreground">Dă click sau trage fișierele aici</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG — până la 10 MB / fișier</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm"
            >
              <span className="inline-flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{f.name}</span>
                <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
              </span>
              <button
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label="Elimină"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">După rezumatul tău, ai nevoie de:</p>
        <ul className="mt-3 space-y-2 text-sm">
          {summary.documents.map((d, i) => (
            <li key={i} className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {d.purpose}
                  {d.source ? ` · ${d.source}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button onClick={onContinue} className="text-sm text-muted-foreground hover:text-foreground">
          Sar peste — încarc mai târziu
        </button>
        <Button onClick={onContinue} className="rounded-full">
          Continuă <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ===== Stage 5: Plan =====

function StagePlan({
  summary,
  onBack,
  onContinue,
}: {
  summary: Summary;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
    >
      <BackBtn onClick={onBack} />
      <h1 className="mt-4 font-display text-2xl md:text-3xl">Planul tău personalizat.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Aceștia sunt pașii pe care îi vom face împreună în următoarele săptămâni.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg">Pe termen mediu</h2>
        <ol className="mt-3 space-y-3">
          {summary.plan.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-display">{s.title}</h3>
                  <p className="mt-1 text-sm text-foreground/80">{s.what}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {s.where && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {s.where}
                      </span>
                    )}
                    {s.time && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {s.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg">Documente pregătite pentru tine</h2>
        <p className="text-sm text-muted-foreground">Le poți revizui înainte să le trimitem.</p>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {summary.documents.map((d, i) => (
            <li key={i} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{d.purpose}</p>
                  {d.source && <p className="mt-1 text-[11px] text-muted-foreground">De la: {d.source}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 flex justify-end">
        <Button onClick={onContinue} className="rounded-full">
          Revizuiește și trimite <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ===== Stage 6: Approve =====

function StageApprove({ summary, onBack }: { summary: Summary; onBack: () => void }) {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const counts = useMemo(
    () => ({ urgent: summary.urgentSteps.length, plan: summary.plan.length, docs: summary.documents.length }),
    [summary],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
    >
      <BackBtn onClick={onBack} />
      <h1 className="mt-4 font-display text-2xl md:text-3xl">Gata. Verifică și aprobă.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Când apeși „Aprob și trimite", planul tău e activ și putem începe să te ajutăm pas cu pas.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Stat label="Pași urgenți" value={counts.urgent} />
        <Stat label="Pași în plan" value={counts.plan} />
        <Stat label="Documente" value={counts.docs} />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-foreground/80">
          Datele rămân doar la tine. Nu trimitem nimic mai departe fără confirmarea ta explicită pe fiecare pas.
        </p>
      </div>

      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-2 rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success-foreground"
          >
            <CheckCircle2 className="h-4 w-4" /> Planul a fost activat. Te ducem la tabloul de bord…
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">
          Mai vreau să schimb ceva
        </button>
        <Button
          disabled={sent}
          onClick={() => {
            setSent(true);
            setTimeout(() => navigate({ to: "/dashboard" }), 1100);
          }}
          className="rounded-full"
        >
          <Mail className="mr-2 h-4 w-4" /> Aprob și trimite
        </Button>
      </div>
    </motion.div>
  );
}

// ===== Bits =====

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> Înapoi
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">{children}</div>;
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2.5 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right text-sm text-foreground/90">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="font-display text-3xl">{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
