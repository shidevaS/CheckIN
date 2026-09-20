import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@tuiton/db";
import { PILLARS } from "@tuiton/shared";
import { getSession } from "@/lib/session";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

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

      <section className="grid gap-5 lg:grid-cols-3">
        {/* Pillars */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-serif text-xl font-semibold">Two pillars, one roof</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">{p.label}</CardTitle>
                  <CardDescription>{p.tagline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/dashboard">Coming in Phase 2</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Today */}
        <div>
          <h2 className="mb-3 font-serif text-xl font-semibold">Today</h2>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge tone="live">Soon</Badge>
                <CardTitle className="text-base">Live class</CardTitle>
              </div>
              <CardDescription>Live classes launch in Phase 3.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Daily challenge</span>
                <span className="text-foreground">Phase 4</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Continue learning</span>
                <span className="text-foreground">—</span>
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                Phase 1 ships identity &amp; shell. Lessons, live classes and challenges build on this foundation.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Community</CardTitle>
            <CardDescription>Live counts from the database.</CardDescription>
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