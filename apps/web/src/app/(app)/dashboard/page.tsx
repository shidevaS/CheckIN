import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@tuiton/db";
import { PILLARS } from "@tuiton/shared";
import { getSession } from "@/lib/session";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Dashboard" };

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-serif text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-1.5 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [user, totalUsers] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.sub }, include: { profile: true } }),
    prisma.user.count(),
  ]);

  const isAdmin = session.role === "ADMIN";
  const profile = user?.profile;

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

      {isAdmin && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[rgb(var(--primary)/0.4)] bg-[rgb(var(--primary)/0.08)] px-4 py-3">
          <p className="text-sm">
            <strong>You&apos;re an admin.</strong> Manage classes, content and students from the console.
          </p>
          <Button size="sm" asChild>
            <Link href="/admin">Open console</Link>
          </Button>
        </div>
      )}

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="XP" value={String(profile?.xp ?? 0)} />
        <Stat label="Level" value={String(profile?.level ?? 1)} />
        <Stat label="Day streak" value={String(profile?.streak ?? 0)} />
        <Stat label="Campus" value={user?.role === "ADMIN" ? "Admin" : (profile?.grade || "—") || "—"} />
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
    </div>
  );
}