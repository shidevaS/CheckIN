"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { BookOpen, Bot, LoaderCircle, RotateCcw, Send, Sparkles, UserRound } from "lucide-react";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";

type TutorMessage = { id: string; role: "assistant" | "user"; text: string };
const STARTERS = [
  "Explain fractions with a simple example",
  "Help me understand how Python loops work",
  "What is the difference between AI and machine learning?",
  "Help me with this math problem",
  "Give me a coding exercise",
];

export default function TutorClient() {
  const [messages, setMessages] = useState<TutorMessage[]>([
    { id: "welcome", role: "assistant", text: "Hi! Tell me what you are learning. I'll break it into clear steps and help you work it out." },
  ]);
  const [prompt, setPrompt] = useState("");
  const [topic, setTopic] = useState("");
  const [kind, setKind] = useState("concept_explain");
  const [level, setLevel] = useState("beginner");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const transcriptEnd = useRef<HTMLDivElement>(null);

  useEffect(() => transcriptEnd.current?.scrollIntoView({ behavior: "smooth" }), [messages, busy]);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const question = prompt.trim();
    if (!question || busy) return;
    setPrompt("");
    setError("");
    setMessages((items) => [...items, { id: crypto.randomUUID(), role: "user", text: question }]);
    setBusy(true);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question, topic: topic.trim() || undefined, kind, difficultyLevel: level }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The tutor could not answer right now.");
      setMessages((items) => [...items, { id: crypto.randomUUID(), role: "assistant", text: data.response }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to reach the tutor. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <p className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--accent))]"><Sparkles size={16} aria-hidden="true" /> Your study companion</p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">AI Tutor</h1>
        <p className="max-w-2xl text-muted-foreground">Ask a question, get a step-by-step explanation, and keep the learning in your hands.</p>
      </header>

      <section aria-label="Tutor conversation" className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-end gap-3 border-b border-border bg-muted/40 p-4">
          <label className="min-w-[155px] flex-1 space-y-1.5 text-xs font-medium text-muted-foreground">
            Subject
            <Select value={kind} onChange={(event) => setKind(event.target.value)} aria-label="Choose subject">
              <option value="concept_explain">School subjects</option>
              <option value="math_help">Mathematics</option>
              <option value="coding">Coding</option>
              <option value="ai">AI and machine learning</option>
              <option value="essay">Writing</option>
            </Select>
          </label>
          <label className="min-w-[155px] flex-1 space-y-1.5 text-xs font-medium text-muted-foreground">
            Learning level
            <Select value={level} onChange={(event) => setLevel(event.target.value)} aria-label="Choose learning level">
              <option value="beginner">Starting out</option>
              <option value="intermediate">Building confidence</option>
              <option value="advanced">Going deeper</option>
            </Select>
          </label>
          <label className="min-w-[155px] flex-1 space-y-1.5 text-xs font-medium text-muted-foreground">
            Topic <span className="font-normal">(optional)</span>
            <Input value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={120} placeholder="e.g. photosynthesis" />
          </label>
          <Button type="button" variant="ghost" size="sm" onClick={() => { setMessages([{ id: crypto.randomUUID(), role: "assistant", text: "What would you like to learn today?" }]); setError(""); }} aria-label="Start a new conversation" title="Start a new conversation">
            <RotateCcw size={16} aria-hidden="true" /> New chat
          </Button>
        </div>

        <div className="h-[min(56vh,560px)] min-h-[340px] space-y-5 overflow-y-auto p-4 sm:p-6" role="log" aria-live="polite" aria-relevant="additions text">
          {messages.map((message) => (
            <article key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${message.role === "assistant" ? "bg-[rgb(var(--accent)/0.12)] text-[rgb(var(--accent))]" : "bg-muted text-foreground"}`}>
                {message.role === "assistant" ? <Bot size={18} aria-hidden="true" /> : <UserRound size={18} aria-hidden="true" />}
              </span>
              <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-6 ${message.role === "assistant" ? "bg-muted/70" : "bg-[rgb(var(--accent))] text-white"}`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>
            </article>
          ))}
          {busy && <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Thinking through your question…</div>}
          <div ref={transcriptEnd} />
        </div>

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 px-4 pb-4 sm:px-6" aria-label="Suggested questions">
            {STARTERS.map((starter) => (
              <button key={starter} type="button" onClick={() => setPrompt(starter)} className="rounded-full border border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                {starter}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={sendMessage} className="border-t border-border p-4 sm:p-5">
          {error && <p className="mb-3 text-sm text-destructive" role="alert">{error}</p>}
          <div className="flex items-end gap-3">
            <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={4000} rows={2} placeholder="Ask a question or describe what you're stuck on…" aria-label="Your question" className="min-h-[64px] resize-y" />
            <Button type="submit" size="icon" disabled={busy || !prompt.trim()} aria-label="Send question" title="Send question" className="h-11 w-11 shrink-0">
              {busy ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
            </Button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><BookOpen size={13} aria-hidden="true" /> AI can make mistakes. Check important answers with a teacher.</p>
        </form>
      </section>
    </div>
  );
}
