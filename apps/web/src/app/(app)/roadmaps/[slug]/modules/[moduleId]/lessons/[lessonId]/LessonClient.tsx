"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

interface LessonClientProps {
  initialLesson: any;
  initialProgress: any;
  sessionUser: { sub: string; name: string; role: string };
}

export default function LessonClient({ initialLesson, initialProgress, sessionUser }: LessonClientProps) {
  const [lesson] = useState(initialLesson);
  const [progress, setProgress] = useState(initialProgress);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [codingOutput, setCodingOutput] = useState<string>("");
  const [isCompleting, setIsCompleting] = useState(false);

  const quiz = lesson.quiz ? JSON.parse(lesson.quiz) : null;

  const handleQuizChange = (idx: number, answer: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[idx] = answer;
    setQuizAnswers(newAnswers);
  };

  const handleQuizSubmit = async () => {
    if (!quiz || quizAnswers.length !== quiz.length) return;
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: quizAnswers }),
      });
      const data = await res.json();
      if (data.score !== undefined) {
        setQuizResult(data);
        setQuizSubmitted(true);
        if (data.passed) {
          setProgress({ ...progress, completed: true, quizScore: data.score, xpTaken: lesson.xp });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleComplete = async () => {
    if (progress?.completed) return;
    setIsCompleting(true);
    try {
      await fetch(`/api/lessons/${lesson.id}/complete`, { method: "POST" });
      setProgress({ ...progress, completed: true, xpTaken: lesson.xp, completedAt: new Date().toISOString() });
    } catch (e) {
      console.error(e);
    } finally {
      setIsCompleting(false);
    }
  };

  const runCode = async () => {
    setCodingOutput("// Output would appear here from sandboxed execution");
  };

  const breadcrumbs = (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Link href="/roadmaps" className="hover:underline">Roadmaps</Link>
      <span>/</span>
      <Link href={`/roadmaps/${lesson.module.roadmap.slug}`} className="hover:underline">{lesson.module.roadmap.title}</Link>
      <span>/</span>
      <Link href={`/roadmaps/${lesson.module.roadmap.slug}`} className="hover:underline">{lesson.module.title}</Link>
      <span>/</span>
      <span className="text-foreground font-medium">{lesson.title}</span>
    </nav>
  );

  return (
    <div className="space-y-6">
      {breadcrumbs}

      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor:
                lesson.kind === "CODING" ? "rgb(var(--accent)/0.14)" :
                lesson.kind === "QUIZ" ? "rgb(var(--primary)/0.14)" :
                lesson.kind === "VIDEO" ? "rgb(var(--primary)/0.14)" :
                "rgb(var(--muted))",
              color:
                lesson.kind === "CODING" ? "rgb(var(--accent))" :
                lesson.kind === "QUIZ" ? "rgb(var(--primary))" :
                "inherit",
            }}>
            {lesson.kind}
          </span>
          {progress?.completed && (
            <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">✓ Completed</span>
          )}
        </div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{lesson.summary}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>{lesson.xp} XP</span>
          {progress?.quizScore !== null && progress?.quizScore !== undefined && (
            <span>Quiz: {progress.quizScore}%</span>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {lesson.kind === "READING" && (
            <Card>
              <CardContent className="prose prose-sm max-w-none pt-5">
                <div dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, "<br>") }} />
              </CardContent>
            </Card>
          )}

          {lesson.kind === "VIDEO" && (
            <Card>
              <CardContent className="pt-5">
                {lesson.videoUrl ? (
                  <div className="aspect-video rounded-lg bg-muted relative overflow-hidden">
                    <iframe
                      src={lesson.videoUrl.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground">Video URL not set.</p>
                )}
                {lesson.content && (
                  <div className="mt-4 prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, "<br>") }} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {lesson.kind === "QUIZ" && quiz && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Quiz: {quiz.length} Questions</CardTitle>
                <CardDescription>Score 70%+ to complete and earn XP.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {quiz.map((q: any, i: number) => (
                  <div key={i} className="space-y-2 p-4 rounded-lg bg-muted/50">
                    <p className="font-medium">{i + 1}. {q.prompt}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt: string, oi: number) => (
                        <button
                          key={oi}
                          onClick={() => !quizSubmitted && handleQuizChange(i, oi)}
                          disabled={quizSubmitted}
                          className={`text-left p-3 rounded-lg border transition-all ${
                            quizSubmitted
                              ? oi === q.answer
                                ? "border-green-500 bg-green-50 text-green-700"
                                : quizAnswers[i] === oi
                                ? "border-red-500 bg-red-50 text-red-700"
                                : "border-border text-muted-foreground"
                              : quizAnswers[i] === oi
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
                {!quizSubmitted ? (
                  <Button onClick={handleQuizSubmit} disabled={quizAnswers.length !== quiz.length} className="w-full" size="lg">
                    Submit Quiz
                  </Button>
                ) : quizResult ? (
                  <div className={`p-4 rounded-lg text-center ${quizResult.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    <p className="font-semibold text-lg">{quizResult.passed ? "🎉 Passed!" : "Try Again"}</p>
                    <p className="text-2xl font-bold mt-1">{quizResult.score}%</p>
                    {quizResult.passed && <p className="mt-2">+{lesson.xp} XP earned!</p>}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {lesson.kind === "CODING" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-lg">Code Editor</CardTitle>
                  <Button variant="outline" size="sm" onClick={runCode}>▶ Run</Button>
                </div>
                <CardDescription>Write your solution. Click Run to test.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <textarea
                  defaultValue={lesson.starter || "# Start coding here..."}
                  className="w-full h-96 font-mono text-sm p-4 rounded-lg border border-border bg-zinc-950 text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring resize-none"
                  spellCheck={false}
                />
                {codingOutput && (
                  <div className="mt-4 p-4 rounded-lg bg-zinc-950 border border-border text-zinc-100 font-mono text-sm whitespace-pre-wrap">
                    {codingOutput}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {progress?.completed && (
            <Card className="border-green-500/50 bg-green-50/50">
              <CardContent className="pt-5 flex items-center gap-3">
                <span className="text-3xl">🎉</span>
                <div>
                  <p className="font-semibold text-green-700">Lesson Complete!</p>
                  <p className="text-sm text-green-600">You earned {lesson.xp} XP. Keep going!</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!progress?.completed && lesson.kind !== "QUIZ" && (
            <Button onClick={handleComplete} disabled={isCompleting} className="w-full" size="lg">
              {isCompleting ? "Marking Complete..." : `Mark Complete (+${lesson.xp} XP)`}
            </Button>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Lesson Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">XP Reward</span>
                <span className="font-medium">{lesson.xp} XP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{lesson.kind.toLowerCase()}</span>
              </div>
              {progress?.completedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">{new Date(progress.completedAt).toLocaleDateString()}</span>
                </div>
              )}
              {progress?.quizScore !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quiz Score</span>
                  <span className="font-medium">{progress.quizScore}%</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Module: {lesson.module.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {lesson.module.lessons.map((l: any) => (
                <Link
                  key={l.id}
                  href={`/roadmaps/${lesson.module.roadmap.slug}/modules/${lesson.module.id}/lessons/${l.id}`}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${l.id === lesson.id ? "bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]" : "hover:bg-muted"}`}
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{
                      backgroundColor:
                        l.kind === "CODING" ? "rgb(var(--accent))" :
                        l.kind === "QUIZ" ? "rgb(var(--primary))" :
                        l.id === lesson.id ? "rgb(var(--primary))" : "rgb(var(--muted))",
                      color: l.kind === "CODING" || l.kind === "QUIZ" ? "white" : l.id === lesson.id ? "white" : "inherit",
                    }}>
                    {l.kind === "CODING" ? "💻" : l.kind === "QUIZ" ? "❓" : l.kind === "VIDEO" ? "▶" : l.id === lesson.id ? "✓" : "📖"}
                  </span>
                  <span className="truncate">{l.title}</span>
                  {l.progress?.completed && <span className="text-green-600 text-xs">✓</span>}
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}