import { createFileRoute } from "@tanstack/react-router";

// Server route proxying to the Lovable AI Gateway.
// Two modes:
//   { mode: "chat", messages }       -> SSE stream (proxies upstream stream)
//   { mode: "summarize", messages }  -> JSON { situation, urgentSteps, plan, documents }
//
// Keeping the system prompt + API key on the server.

const SYSTEM_PROMPT = `Ești "After", un asistent calm care ajută familiile din România imediat după ce o persoană dragă a decedat.
Scop: să afli cu blândețe, în 4-6 schimburi scurte, informațiile minime pentru a construi un plan personalizat.
Ton: cald, simplu, fără jargon juridic, propoziții scurte. Niciodată nu cere date care pot fi amânate.

Întreabă pe rând:
1. Unde a avut loc decesul (spital / acasă / centru de îngrijire / spațiu public sau accident / străinătate).
2. Cetățenia persoanei decedate (română / UE / non-UE).
3. Dacă există un certificat medical constatator obținut deja.
4. Dacă persoana avea soț/soție, copii minori, sau persoane în întreținere.
5. Bunuri importante de care familia știe: locuință, autovehicul, conturi bancare, pensie/salariu activ.

Reguli:
- O singură întrebare per mesaj. Confirmă scurt răspunsul primit înainte să treci la următoarea întrebare.
- Nu da liste lungi. Nu da sfaturi încă — doar ascultă și întreabă.
- Când ai informațiile minime, încheie cu un mesaj scurt care spune: "Am tot ce ne trebuie. Hai să confirmăm împreună." și NU mai pune întrebări.`;

const SUMMARIZE_TOOL = {
  type: "function" as const,
  function: {
    name: "build_intake_summary",
    description: "Construiește un rezumat structurat al situației și un plan personalizat pentru familie.",
    parameters: {
      type: "object",
      properties: {
        situation: {
          type: "object",
          properties: {
            place: {
              type: "string",
              enum: ["hospital", "home", "care", "public", "abroad", "unknown"],
              description: "Unde a avut loc decesul.",
            },
            nationality: {
              type: "string",
              enum: ["ro", "eu", "non_eu", "unknown"],
              description: "Cetățenia persoanei decedate.",
            },
            hasMedicalCertificate: { type: "boolean" },
            hasSpouse: { type: "boolean" },
            hasMinorChildren: { type: "boolean" },
            assets: {
              type: "array",
              items: { type: "string", enum: ["home", "vehicle", "bank", "pension", "salary", "other"] },
            },
            notes: { type: "string", description: "Maxim 2 propoziții cu nuanțe importante." },
          },
          required: ["place", "nationality", "hasMedicalCertificate", "hasSpouse", "hasMinorChildren", "assets", "notes"],
          additionalProperties: false,
        },
        urgentSteps: {
          type: "array",
          description: "3-6 pași OBLIGATORII până la funeralii.",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              what: { type: "string" },
              where: { type: "string" },
              time: { type: "string" },
            },
            required: ["title", "what"],
            additionalProperties: false,
          },
        },
        plan: {
          type: "array",
          description: "5-10 pași după funeralii (succesiune, pensii, mașină, bănci etc.).",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              what: { type: "string" },
              where: { type: "string" },
              time: { type: "string" },
            },
            required: ["title", "what"],
            additionalProperties: false,
          },
        },
        documents: {
          type: "array",
          description: "Documente de care familia are nevoie să le pregătească sau să le ridice.",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              purpose: { type: "string" },
              source: { type: "string", description: "De unde se ridică." },
            },
            required: ["name", "purpose"],
            additionalProperties: false,
          },
        },
      },
      required: ["situation", "urgentSteps", "plan", "documents"],
      additionalProperties: false,
    },
  },
};

export const Route = createFileRoute("/api/intake")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: { mode?: string; messages?: Array<{ role: string; content: string }> };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }

        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) {
          return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
        }
        // Defensive cap.
        if (messages.length > 40) {
          return new Response(JSON.stringify({ error: "too many messages" }), { status: 400 });
        }

        const mode = body.mode === "summarize" ? "summarize" : "chat";

        if (mode === "chat") {
          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              stream: true,
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
            }),
          });

          if (!upstream.ok || !upstream.body) {
            const text = await upstream.text().catch(() => "");
            return new Response(JSON.stringify({ error: "ai_gateway_error", status: upstream.status, detail: text }), {
              status: upstream.status === 429 || upstream.status === 402 ? upstream.status : 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(upstream.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          });
        }

        // summarize mode -- structured output via tool calling
        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content:
                  "Pe baza conversației, completează rezumatul situației și construiește planul personalizat. Răspunde DOAR prin tool calling. Toate textele sunt în limba română.",
              },
              ...messages,
            ],
            tools: [SUMMARIZE_TOOL],
            tool_choice: { type: "function", function: { name: "build_intake_summary" } },
          }),
        });

        if (!upstream.ok) {
          const text = await upstream.text().catch(() => "");
          return new Response(JSON.stringify({ error: "ai_gateway_error", status: upstream.status, detail: text }), {
            status: upstream.status === 429 || upstream.status === 402 ? upstream.status : 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const json = (await upstream.json()) as {
          choices?: Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }> } }>;
        };

        const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
        if (!args) {
          return new Response(JSON.stringify({ error: "no_tool_call" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(args);
        } catch {
          return new Response(JSON.stringify({ error: "invalid_tool_args" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(parsed), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
