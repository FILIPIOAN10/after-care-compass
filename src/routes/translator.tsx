import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Send } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { api, ApiError, type TranslatorResponse } from "@/lib/api";

export const Route = createFileRoute("/translator")({
  head: () => ({ meta: [{ title: "Traducător AI — After" }] }),
  component: Translator,
});

type Msg = { from: "you" | "after"; text: string };

const seed: Msg[] = [
  {
    from: "after",
    text: "Bună. Scrie aici orice termen, denumire de formular sau frază birocratică pe care nu o înțelegi. Îți explic pe înțelesul tuturor.",
  },
];

function Translator() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const suggestionsQuery = useQuery({
    queryKey: ["translator-suggestions"],
    queryFn: () => api<{ suggestions: string[] }>("/api/translator/suggestions"),
    staleTime: 5 * 60 * 1000,
  });

  const explain = useMutation({
    mutationFn: (term: string) =>
      api<TranslatorResponse>("/api/translator", { method: "POST", body: { term } }),
    onSuccess: (res) => {
      setMessages((m) => [...m, { from: "after", text: res.explanation }]);
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Nu am putut explica termenul."),
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = (raw?: string) => {
    const t = (raw ?? input).trim();
    if (!t) return;
    setMessages((m) => [...m, { from: "you", text: t }]);
    setInput("");
    explain.mutate(t);
  };

  const suggestions = suggestionsQuery.data?.suggestions ?? [
    "Certificat de deces",
    "Anexa 23",
    "Declarație succesorală",
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-3xl">Traducător de birocrație</h1>
            <p className="text-sm text-muted-foreground">
              Lipește orice termen, denumire de formular sau scrisoare. Îți explicăm cu blândețe.
            </p>
          </div>
        </div>

        <div className="rounded-4xl border border-border bg-surface p-4 md:p-6">
          <div ref={scrollRef} className="max-h-[480px] space-y-4 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed md:text-base ${
                    m.from === "you"
                      ? "bg-foreground text-background"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  {m.from === "after" && (
                    <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                      After
                    </p>
                  )}
                  {m.text}
                </div>
              </motion.div>
            ))}
            {explain.isPending && (
              <div className="flex justify-start">
                <div className="rounded-3xl border border-border bg-card px-5 py-3.5 text-sm text-muted-foreground">
                  După scrie…
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-card p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="ex. Adeverință de moștenitor"
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Termen de explicat"
            />
            <Button
              onClick={() => send()}
              disabled={explain.isPending || !input.trim()}
              className="h-10 rounded-xl"
            >
              Explică <Send className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          {suggestions.slice(0, 6).map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-surface-soft"
            >
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Încearcă
              </span>
              <p className="mt-1 text-foreground">{s}</p>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
