import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Send } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/translator")({
  head: () => ({ meta: [{ title: "AI translator — After" }] }),
  component: Translator,
});

type Msg = { from: "you" | "after"; text: string };

const seed: Msg[] = [
  { from: "you", text: "Certificat constatator pentru succesiune" },
  {
    from: "after",
    text:
      "This is a document a notary issues at the start of succession. It confirms who the heirs are and what assets exist, and it's usually required before ownership can be legally transferred. You don't need to prepare it yourself — your notary will produce it from the documents you've already uploaded.",
  },
];

function Translator() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");

  const send = () => {
    const t = input.trim();
    if (!t) return;
    setMessages((m) => [...m, { from: "you", text: t }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { from: "after", text: "In plain language: this is a step that helps prove your role. We'll guide you through it when it's needed — there's nothing to do right now." },
      ]);
    }, 600);
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-3xl">Bureaucracy translator</h1>
            <p className="text-sm text-muted-foreground">Paste any term, form name, or letter. We'll explain it kindly.</p>
          </div>
        </div>

        <div className="rounded-4xl border border-border bg-surface p-4 md:p-6">
          <div className="space-y-4">
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
                    <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">After</p>
                  )}
                  {m.text}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-card p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="e.g. Adeverință de moștenitor"
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Term to explain"
            />
            <Button onClick={send} className="h-10 rounded-xl">
              Explain <Send className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          {["Certificat de deces", "Anexa 23", "Declarație succesorală"].map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-surface-soft"
            >
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Try</span>
              <p className="mt-1 text-foreground">{s}</p>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
