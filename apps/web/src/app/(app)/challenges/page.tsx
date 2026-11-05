import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { ProgressRing } from "@/components/ui/progress-ring";

export const metadata: Metadata = { title: "Daily Challenges" };

function ChallengeSection({
  title,
  challenges,
  cadence,
  submissions,
  sessionUser,
}: {
  title: string;
  challenges: any[];
  cadence: string;
  submissions: Map<string, any>;
  sessionUser: { sub: string };
}) {
  if (challenges.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
        <Badge tone={cadence === "DAILY" ? "gold" : cadence === "WEEKLY" ? "teal" : "neutral"}>{cadence}</Badge>
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.map((ch) => {
          const submission = submissions.get(ch.id);
          const isSubmitted = !!submission;
          const isApproved = submission?.status === "APPROVED";
          const isRejected = submission?.status === "REJECTED";

          return (
            <Card key={ch.id} className="group hover:border-[rgb(var(--primary)/0.4)] transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="font-serif text-lg">{ch.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">{ch.prompt}</CardDescription>
                  </div>
                  <Badge tone={ch.difficulty === "BEGINNER" ? "neutral" : ch.difficulty === "INTERMEDIATE" ? "teal" : "gold"}>
                    {ch.difficulty}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{ch.kind}</span>
                  <span>•</span>
                  <span>+{ch.xp} XP</span>
                  {ch.strand && <span>• {ch.strand}</span>}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {isSubmitted ? (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {isApproved && <span className="text-green-600 mr-1">✓</span>}
                        {isRejected && <span className="text-red-600 mr-1">✗</span>}
                        {submission?.status === "SUBMITTED" && <span className="text-yellow-600 mr-1">⏳</span>}
                        {submission?.status === "UNDER_REVIEW" && <span className="text-blue-600 mr-1">👁</span>}
                        {submission?.status === "APPROVED" && <span>Approved</span>}
                        {submission?.status === "REJECTED" && <span>Rejected</span>}
                        {submission?.status === "SUBMITTED" && <span>Submitted</span>}
                        {submission?.status === "UNDER_REVIEW" && <span>Under Review</span>}
                      </span>
                      {isApproved && <span className="font-medium text-green-600">+{submission.xpAwarded || ch.xp} XP</span>}
                    </div>
                    {submission?.feedback && (
                      <p className="mt-2 text-sm text-muted-foreground"><span className="font-medium">Feedback:</span> {submission.feedback}</p>
                    )}
                  </div>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href={`/challenges/${ch.id}`}>Start Challenge</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default async function ChallengesPage() {
  const session = await getSession();
  if (!session) return null;

  const now = new Date();
  const todayKey = Number(now.toISOString().slice(0, 10).replace(/-/g, ""));
  const thisWeekKey = Number(`${now.getFullYear()}W${Math.ceil(now.getDate() / 7)}`);
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [daily, weekly, monthly, submissionsData, userProgress, recentXpLogs] = await Promise.all([
    prisma.challenge.findMany({
      where: { published: true, cadence: "DAILY", dayKey: todayKey },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.challenge.findMany({
      where: { published: true, cadence: "WEEKLY", weekKey: thisWeekKey },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.challenge.findMany({
      where: { published: true, cadence: "MONTHLY", monthKey: thisMonthKey },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.challengeSubmission.findMany({
      where: { userId: session.sub },
      select: { challengeId: true, status: true, xpAwarded: true, feedback: true, autoPassed: true, gradedAt: true },
    }),
    prisma.xpLog.findMany({
      where: { userId: session.sub, reason: { startsWith: "Challenge" } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const submissions = new Map(submissionsData.map((s) => [s.challengeId, s]));
  const challengeXpEarned = daily.reduce((sum, c) => sum + (submissions.has(c.id) ? (submissions.get(c.id)?.xpAwarded || c.xp : 0) : 0), 0) +
                            weekly.reduce((sum, c) => sum + (submissions.has(c.id) ? (submissions.get(c.id)?.xpAwarded || c.xp : 0) : 0), 0) +
                            monthly.reduce((sum, c) => sum + (submissions.has(c.id) ? (submissions.get(c.id)?.xpAwarded || c.xp : 0) : 0), 0);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Daily Challenges</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          New challenges every day, week, and month. Solve quizzes, write code, craft prompts — earn XP and climb the leaderboard.
        </p>
      </header>

      <ChallengeSection
        title="Today's Challenges"
        challenges={daily}
        cadence="DAILY"
        submissions={submissions}
        sessionUser={session}
      />

      <ChallengeSection
        title="This Week's Challenges"
        challenges={weekly}
        cadence="WEEKLY"
        submissions={submissions}
        sessionUser={session}
      />

      <ChallengeSection
        title="This Month's Challenge"
        challenges={monthly}
        cadence="MONTHLY"
        submissions={submissions}
        sessionUser={session}
      />

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Your Challenge Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted p-4 text-center">
              <ProgressRing value={daily.filter((c) => submissions.has(c.id)).length * 10} size={32} thickness={6} color="primary" />
              <p className="mt-2 font-serif text-xl font-semibold">{daily.filter((c) => submissions.has(c.id)).length}</p>
              <p className="text-sm text-muted-foreground">Daily Done</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <ProgressRing value={weekly.filter((c) => submissions.has(c.id)).length * 10} size={32} thickness={6} color="teal" />
              <p className="mt-2 font-serif text-xl font-semibold">{weekly.filter((c) => submissions.has(c.id)).length}</p>
              <p className="text-sm text-muted-foreground">Weekly Done</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <ProgressRing value={monthly.filter((c) => submissions.has(c.id)).length * 10} size={32} thickness={6} color="gold" />
              <p className="mt-2 font-serif text-xl font-semibold">{monthly.filter((c) => submissions.has(c.id)).length}</p>
              <p className="text-sm text-muted-foreground">Monthly Done</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
            <p>Total XP from challenges this period: <span className="font-medium">{challengeXpEarned}</span></p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Challenge Activity */}
      {userProgress.length > 0 && (
        <Card className="border-[rgb(var(--primary))/0.4] bg-[rgb(var(--primary)/0.05)]">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Recent Challenge Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {userProgress.map((sub) => {
              const challenge = daily.find((c) => c.id === sub.challengeId) ||
                               weekly.find((c) => c.id === sub.challengeId) ||
                               monthly.find((c) => c.id === sub.challengeId);
              if (!challenge) return null;
              const statusBadge = sub.status === "APPROVED" ? "✓ Approved" : sub.status === "REJECTED" ? "✗ Rejected" : "⏳ Submitted";
              return (
                <div key={sub.challengeId} className="p-3 rounded-lg border animate-fade-in">
                  <div className="flex items-start gap-3">
                    <span className={w-3 h-3 rounded-full flex-shrink-0 aria-hidden="true"} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{challenge.title}</p>
                      <p className="text-xs text-muted-foreground">{statusBadge}</p>
                      {sub.gradedAt && <p className="text-xs text-primary">Graduated {new Date(sub.gradedAt).toLocaleDateString()}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent XP Logs */}
      {recentXpLogs.length > 0 && (
        <Card className="border-[rgb(var(--primary))/0.4] bg-[rgb(var(--primary)/0.05)]">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Recent XP Gains</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {recentXpLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg border animate-fade-in flex items-center justify-between">
                <span className="font-medium text-sm">{log.reason}</span>
                <span className="text-primary font-medium">{log.amount} XP</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard teaser */}
      <Card className="border-[rgb(var(--primary))/0.4] bg-[rgb(var(--primary)/0.05)]">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-semibold">Want to see where you rank?</p>
              <p className="text-sm text-muted-foreground">Check the leaderboard to compare XP with other learners.</p>
            </div>
            <Button asChild>
              <Link href="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}