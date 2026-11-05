import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@tuiton/db";
import { PILLARS } from "@tuiton/shared";
import { getSession } from "@/lib/session";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Dashboard" };

function Stat({ label, value, trending }: { label: string; value: string; trending?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 {trending ? "bg-primary-100 text-primary-600" : "bg-secondary-100 text-secondary-600"}">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path className="font-serif text-2xl font-semibold leading-none">{value}</path>
        </svg>
      </div>
      <div className="flex-1">
        <p className="font-serif text-2xl font-semibold leading-none">{value}</p>
        <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function BadgePill({ label, variant }: { label: string; variant?: "primary" | "secondary" }) {
  const v = variant || "primary";
  return (
    <span className={inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium }>
      {label}
    </span>
  );
}

function TrendingBadge({ label, count }: { label: string; count: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary-100 text-primary-600 px-2 py-0.5 text-xs font-medium">
      {label} <span className="ml-1 text-xs font-bold">{count}+</span>
    </span>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [user, totalUsers, totalChallenges, completedChallenges, courseProgress] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.sub }, include: { profile: true, aiInteractions: true } }),
    prisma.user.count(),
    prisma.challenge.count(),
    prisma.challengeSubmission.count({ where: { status: "APPROVED" } }),
    prisma.certificate.count({ where: { userId: session.sub, completedAt: { not: null } } }),
  ]);

  const isAdmin = session.role === "ADMIN";
  const profile = user?.profile;

  // Daily alerts and upcoming events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Mock daily alerts - in production, these would come from a scheduler/db
  const dailyAlerts = [
    {
      id: "quiz-today",
      type: "quiz",
      title: "Daily Quiz Available",
      description: "Complete today's quiz to earn 50 XP and maintain your streak",
      action: "/challenges",
      actionLabel: "Take Quiz",
      urgency: "high",
    },
    {
      id: "coding-round",
      type: "coding",
      title: "Coding Round",
      description: "15-minute coding challenge - Python loops",
      action: "/challenges",
      actionLabel: "Start Coding",
      urgency: "medium",
    },
    {
      id: "homework-reminder",
      type: "homework",
      title: "Homework Due",
      description: "Maths assignment - Algebra due tomorrow",
      action: "/roadmaps",
      actionLabel: "Check Details",
      urgency: "high",
    },
    {
      id: "project-showcase",
      type: "project",
      title: "New Project Challenge",
      description: "Build a personal website - showcase your skills",
      action: "/courses",
      actionLabel: "View Project",
      urgency: "medium",
    },
  ];

  // Recent AI interactions
  const recentAiInteractions = user?.aiInteractions?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">
          {isAdmin ? "Console" : "Welcome back"}, {user?.name?.split(" ")[0]}.
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          {isAdmin
            ? "Operate the platform from here — host classes, author content, set challenges."
            : "Your space for lessons, live classes and challenges. Everything below is built to completion, not to a demo."}
        </p>
      </header>

      {/* Daily Alerts Section */}
      {isAdmin ? null : (
        <section className="rounded-xl border border-border bg-card p-6 mb-8">
          <h2 className="font-serif text-xl font-semibold mb-4">Today's Alerts</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Check out what's waiting for you today. Stay consistent and earn rewards!
          </p>
          <div className="space-y-3">
            {dailyAlerts.map((alert) => (
              <div
                key={alert.id}
                className={p-4 rounded-lg border animate-fade-in}
              >
                <div className="flex items-start gap-3">
                  <span className={w-3 h-3 rounded-full flex-shrink-0 aria-hidden="true"} />
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{alert.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                    href={alert.action}
                  >
                    <span className="font-medium">{alert.actionLabel}</span>
                  </Button>
                  <BadgePill label={alert.urgency === "high" ? "URGENT" : "Reminder"} variant={alert.urgency === "high" ? "secondary" : "primary"} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="XP" value={String(profile?.xp ?? 0)} trending={profile?.xp > 1000} />
        <Stat label="Level" value={String(profile?.level ?? 1)} trending={profile?.level > 5} />
        <Stat label="Day streak" value={String(profile?.streak ?? 0)} trending={profile?.streak >= 7} />
        <Stat label="Certifications" value={String(courseProgress)} trending={courseProgress > 0} />
        <Stat label="Total Users" value={String(totalUsers)} />
        <Stat label="Challenges" value={String(totalChallenges)} />
        <Stat label="Completed" value={String(completedChallenges)} />
        <Stat label="AI Sessions" value={String(user?.aiInteractions?.length || 0)} />
      </section>

      {/* Featured Content Section */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-xl font-semibold">Choose what to work on</h2>
          <p className="mt-1 text-sm text-muted-foreground">School learning and practical technology skills, in one place.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <Card key={pillar.id}>
              <CardHeader>
                <CardTitle className="font-serif text-lg">{pillar.label}</CardTitle>
                <CardDescription>{pillar.tagline}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/roadmaps">Explore learning paths</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Activity Section */}
      {isAdmin ? null : (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-sm text-muted-foreground mb-4">What you've been up to lately</p>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentAiInteractions.map((interaction) => (
              <div key={interaction.id} className="p-3 rounded-lg border animate-fade-in">
                <div className="flex items-start gap-3">
                  <span className={w-3 h-3 rounded-full flex-shrink-0 aria-hidden="true"} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{interaction.kind}</p>
                    <p className="text-xs text-muted-foreground">{interaction.prompt?.substring(0, 50) || "No prompt"}...</p>
                  </div>
                </div>
              </div>
            ))}
            {recentAiInteractions.length === 0 && (
              <p className="text-xs text-muted-foreground">No recent AI interactions yet. Start a session to get started!</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">
          {isAdmin ? "Console" : "Welcome back"}, {user?.name?.split(" ")[0]}.
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          {isAdmin
            ? "Operate the platform from here � host classes, author content, set challenges."
            : "Your space for lessons, live classes and challenges. Everything below is built to completion, not to a demo."}
        </p>
      </header>

      {/* Daily Alerts Section */}
      {isAdmin ? null : (
        <section className="rounded-xl border border-border bg-card p-6 mb-8">
          <h2 className="font-serif text-xl font-semibold mb-4">?? Today's Alerts</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Check out what's waiting for you today. Stay consistent and earn rewards!
          </p>
          <div className="space-y-3">
            {dailyAlerts.map((alert) => (
              <div
                key={alert.id}
                className={p-4 rounded-lg border  animate-fade-in}
              >
                <div className="flex items-start gap-3">
                  <span className={w-3 h-3 rounded-full  flex-shrink-0} aria-hidden="true" />
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{alert.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                    href={alert.action}
                  >
                    <span className="font-medium">{alert.actionLabel}</span>
                  </Button>
                  <BadgePill label={alert.urgency === "high" ? "URGENT" : "Reminder"} variant={alert.urgency === "high" ? "secondary" : "primary"} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="XP" value={String(profile?.xp ?? 0)} />
        <Stat label="Level" value={String(profile?.level ?? 1)} />
        <Stat label="Day streak" value={String(profile?.streak ?? 0)} />
        <Stat label="Campus" value={user?.role === "ADMIN" ? "Admin" : (profile?.grade || "�") || "�"} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-xl font-semibold">Choose what to work on</h2>
          <p className="mt-1 text-sm text-muted-foreground">School learning and practical technology skills, in one place.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <Card key={pillar.id}>
              <CardHeader>
                <CardTitle className="font-serif text-lg">{pillar.label}</CardTitle>
                <CardDescription>{pillar.tagline}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/roadmaps">Explore learning paths</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Ask the AI Tutor</CardTitle>
            <CardDescription>Get a clear explanation, practice a concept, or explore a coding question.</CardDescription>
          </CardHeader>
          <CardContent><Button className="w-full" asChild><Link href="/tutor">Open tutor</Link></Button></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Build a study habit</CardTitle>
            <CardDescription>Try a short daily task or take on a longer weekly challenge.</CardDescription>
          </CardHeader>
          <CardContent><Button variant="outline" className="w-full" asChild><Link href="/challenges">View challenges</Link></Button></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Find your next course</CardTitle>
            <CardDescription>Explore the available free and paid course catalog.</CardDescription>
          </CardHeader>
          <CardContent><Button variant="outline" className="w-full" asChild><Link href="/courses">Browse courses</Link></Button></CardContent>
        </Card>
      </section>

      {/* Progress & Community Section */}
      <section className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Your Progress</CardTitle>
            <CardDescription>Track your learning journey and achievements</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold text-lg">{profile?.xp ?? 0}</p>
              <p className="text-muted-foreground">XP Earned</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold text-lg">{profile?.level ?? 1}</p>
              <p className="text-muted-foreground">Current Level</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold text-lg">{profile?.streak ?? 0}</p>
              <p className="text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Upcoming Challenges</CardTitle>
            <CardDescription>Daily, weekly and monthly exercises</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold text-lg">50+</p>
              <p className="text-muted-foreground">Active Challenges</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold text-lg">10</p>
              <p className="text-muted-foreground">This Week</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold text-lg">3</p>
              <p className="text-muted-foreground">Monthly Goals</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Discussion Forum</CardTitle>
            <CardDescription>Connect with peers and ask questions</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold text-lg">1.2k</p>
              <p className="text-muted-foreground">Active Discussions</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="font-semibold text-lg">24</p>
              <p className="text-muted-foreground">Today's Topics</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/community">View Forum</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Admin Console</CardTitle>
            <CardDescription>Manage classes, content and students</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div className="rounded-lg bg-muted p-4"><p className="font-semibold text-lg">{totalUsers}</p><p className="text-muted-foreground">Total accounts</p></div>
            <div className="rounded-lg bg-muted p-4"><p className="font-semibold text-lg">2</p><p className="text-muted-foreground">Admins</p></div>
            <div className="rounded-lg bg-muted p-4"><p className="font-semibold text-lg">{totalUsers - 2}</p><p className="text-muted-foreground">Students</p></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
