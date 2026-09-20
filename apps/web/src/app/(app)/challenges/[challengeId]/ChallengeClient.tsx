"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea, Label } from "@/components/ui";

interface ChallengeClientProps {
  initialChallenge: any;
  initialSubmission: any;
  sessionUser: { sub: string; name: string; role: string };
}

export default function ChallengeClient({ initialChallenge, initialSubmission, sessionUser }: ChallengeClientProps) {
  const [challenge] = useState(initialChallenge);
  const [submission, setSubmission] = useState(initialSubmission);
  const [answer, setAnswer] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; score: number; xp: number; feedback?: string } | null>(null);
  const [codingOutput, setCodingOutput] = useState("");

  const quiz = challenge.options ? JSON.parse(challenge.options) : null;
  const isSubmitted = !!submission;

  useEffect(() => {
    if (quiz) setQuizAnswers(new Array(quiz.length).fill(-1));
  }, [quiz]);

  const handleQuizChange = (idx: number, ans: number) => {
    setQuizAnswers((prev) => { const n = [...prev]; n[idx] = ans; return n; });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    let payload: any = { challengeId: challenge.id };

    if (challenge.kind === "QUIZ" && quiz) {
      if (quizAnswers.some((a) => a === -1)) {
        alert("Please answer all questions");
        setIsSubmitting(false);
        return;
      }
      payload.answers = quizAnswers;
    } else if (challenge.kind === "CODING") {
      payload.code = answer;
    } else if (challenge.kind === "PROMPT_AI") {
      payload.prompt = answer;
    } else {
      payload.content = answer;
    }

    try {
      const res = await fetch(`/api/challenges/${challenge.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.score !== undefined || data.xpAwarded !== undefined) {
        const passed = data.passed ?? (data.score !== undefined && data.score >= 70) ?? true;
        setResult({ passed, score: data.score ?? 100, xp: data.xpAwarded ?? challenge.xp, feedback: data.feedback });
        setSubmission({ ...data, status: passed ? "APPROVED" : "REJECTED", xpAwarded: data.xpAwarded ?? challenge.xp });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const runCode = () => {
    if (!answer.trim()) { setCodingOutput("// No code to run"); return; }
    setCodingOutput("// Running in sandbox...\n// (connect /api/code/run for real execution)");
  };

  const badgeStyle = (kind: string) => ({
    backgroundColor: kind === "CODING" ? "rgb(var(--accent))" : kind === "QUIZ" ? "rgb(var(--primary))" : kind === "PROMPT_AI" ? "rgb(var(--primary)/0.8)" : "rgb(var(--muted))",
    color: kind === "CODING" || kind === "QUIZ" || kind === "PROMPT_AI" ? "white" : "inherit",
  });

  return (
    <div className="space-y-6">
      <header>
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/challenges" className="hover:underline">Challenges</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{challenge.title}</span>
        </nav>

        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={badgeStyle(challenge.kind)}>
            {challenge.kind}
          </span>
          <Badge tone={challenge.difficulty === "BEGINNER" ? "neutral" : challenge.difficulty === "INTERMEDIATE" ? "teal" : "gold"}>
            {challenge.difficulty}
          </Badge>
          <Badge tone={challenge.cadence === "DAILY" ? "gold" : challenge.cadence === "WEEKLY" ? "teal" : "neutral"}>
            {challenge.cadence}
          </Badge>
          {challenge.strand && <Badge tone="neutral">{challenge.strand}</Badge>}
        </div>

        <h1 className="font-serif text-3xl font-semibold tracking-tight">{challenge.title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{challenge.prompt}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>+{challenge.xp} XP</span>
          {challenge.cadence === "DAILY" && <span>Resets daily</span>}
          {challenge.cadence === "WEEKLY" && <span>Resets weekly</span>}
          {challenge.cadence === "MONTHLY" && <span>Resets monthly</span>}
        </div>
      </header>

      {submission && (
        <Card className={submission.status === "APPROVED" ? "border-green-500/50 bg-green-50/50" : submission.status === "REJECTED" ? "border-red-500/50 bg-red-50/50" : "border-yellow-500/50 bg-yellow-50/50"}>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {submission.status === "APPROVED" ? "🎉" : submission.status === "REJECTED" ? "😔" : "⏳"}
              </span>
              <div>
                <p className="font-semibold">
                  {submission.status === "APPROVED" && "Challenge Complete!"}
                  {submission.status === "REJECTED" && "Not Quite There"}
                  {submission.status === "SUBMITTED" && "Submitted — Awaiting Review"}
                  {submission.status === "UNDER_REVIEW" && "Under Review"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {submission.status === "APPROVED" && `+${submission.xpAwarded || challenge.xp} XP earned!`}
                  {submission.status === "REJECTED" && "Try again or improve your answer."}
                  {submission.status === "SUBMITTED" && "An admin will review your submission."}
                  {submission.status === "UNDER_REVIEW" && "An admin is reviewing your submission."}
                </p>
              </div>
            </div>
            {submission.feedback && (
              <div className="mt-3 p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">Feedback:</p>
                <p className="text-sm text-muted-foreground mt-1">{submission.feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!submission && (
        <div className="space-y-6">
          {challenge.kind === "QUIZ" && quiz && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Quiz: {quiz.length} Questions</CardTitle>
                <CardDescription>Score 70%+ to pass and earn XP.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {quiz.map((q: any, i: number) => (
                  <div key={i} className="space-y-2 p-4 rounded-lg bg-muted/50">
                    <p className="font-medium">{i + 1}. {q.prompt}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt: string, oi: number) => (
                        <button
                          key={oi}
                          onClick={() => handleQuizChange(i, oi)}
                          disabled={isSubmitted}
                          className={`text-left p-3 rounded-lg border transition-all ${
                            quizAnswers[i] === oi
                              ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.1)]"
                              : "border-border hover:border-[rgb(var(--primary))/0.5]"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <Button onClick={handleSubmit} disabled={quizAnswers.some((a) => a === -1) || isSubmitting} className="w-full" size="lg">
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              </CardContent>
            </Card>
          )}

          {challenge.kind === "CODING" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-lg">Code Editor</CardTitle>
                  <Button variant="outline" size="sm" onClick={runCode}>▶ Run</Button>
                </div>
                <CardDescription>Write your solution. Starter code provided below.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  defaultValue={challenge.starter || "// Write your solution here"}
                  className="w-full h-96 font-mono text-sm p-4 rounded-lg border border-border bg-zinc-950 text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring resize-none"
                  spellCheck={false}
                />
                {codingOutput && (
                  <div className="p-4 rounded-lg bg-zinc-950 border border-border text-zinc-100 font-mono text-sm whitespace-pre-wrap">
                    {codingOutput}
                  </div>
                )}
                <Button onClick={handleSubmit} disabled={isSubmitting || !answer.trim()} className="w-full" size="lg">
                  {isSubmitting ? "Submitting..." : "Submit Code"}
                </Button>
              </CardContent>
            </Card>
          )}

          {(challenge.kind === "PROMPT_AI" || challenge.kind === "PRACTICE" || challenge.kind === "BADGE_TASK") && (
            <Card>
              <CardContent className="space-y-4 pt-5">
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={challenge.starter || "Your response..."}
                  className="min-h-[200px] font-mono text-sm"
                  rows={10}
                />
                <Button onClick={handleSubmit} disabled={isSubmitting || !answer.trim()} className="w-full" size="lg">
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Challenge Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">XP Reward</span>
                <span className="font-medium">+{challenge.xp} XP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{challenge.kind.toLowerCase().replace("_", " ")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Difficulty</span>
                <span className="font-medium">{challenge.difficulty}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cadence</span>
                <span className="font-medium">{challenge.cadence}</span>
              </div>
              {challenge.strand && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Strand</span>
                  <span className="font-medium">{challenge.strand}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {result && (
        <div className={`p-4 rounded-lg text-center ${result.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          <p className="font-semibold text-lg">{result.passed ? "🎉 Passed!" : "Try Again"}</p>
          <p className="text-2xl font-bold mt-1">{result.score}%</p>
          {result.passed && <p className="mt-2">+{result.xp} XP earned!</p>}
          {result.feedback && <p className="mt-2 text-sm">{result.feedback}</p>}
        </div>
      )}
    </div>
  );
}