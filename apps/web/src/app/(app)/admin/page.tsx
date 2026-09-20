import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Admin console" };

export default async function AdminPage() {
  const session = await getSession();
  // Belt-and-braces role guard (middleware also enforces this).
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const [users, submissions, challenges] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { profile: true } }),
    prisma.challengeSubmission.count(),
    prisma.challenge.count(),
  ]);

  const admins = users.filter((u) => u.role === "ADMIN");
  const students = users.filter((u) => u.role === "STUDENT");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Admin console</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Shivani &amp; Devendra&apos;s cockpit. Identity, roles and the shell are live; class scheduling,
          content authoring and challenge grading are the next phases.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Accounts", value: String(users.length) },
          { label: "Students", value: String(students.length) },
          { label: "Challenges", value: String(challenges) },
          { label: "Submissions", value: String(submissions) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <p className="font-serif text-2xl font-semibold leading-none">{s.value}</p>
              <p className="mt-1.5 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Next phases</CardTitle>
            <CardDescription>The roadmap, in order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {[
              ["P2", "Roadmaps & content library"],
              ["P3", "Live classes (Jitsi)"],
              ["P4", "Challenges & XP"],
              ["P5", "Profile & community"],
              ["P6", "Polish, mobile, launch"],
            ].map(([n, t]) => (
              <div key={n} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted">
                <Badge tone="gold">{n}</Badge>
                <span>{t}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Seeded actors</CardTitle>
            <CardDescription>Created by the seed script on first run.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 pr-4 font-medium">Role</th>
                  <th className="pb-2 font-medium">Grade</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-4 font-medium">{u.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{u.email}</td>
                    <td className="py-2 pr-4">
                      <Badge tone={u.role === "ADMIN" ? "gold" : "teal"}>{u.role}</Badge>
                    </td>
                    <td className="py-2 text-muted-foreground">{u.profile?.grade || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pt-4 text-xs text-muted-foreground">
              {admins.length} admin{admins.length === 1 ? "" : "s"} hosted.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}