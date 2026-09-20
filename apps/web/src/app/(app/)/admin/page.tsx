import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import AdminTabsClient from "./AdminTabsClient";

export const metadata: Metadata = { title: "Admin Console" };

export default async function AdminPage() {
  const session = await getSession();
  // Belt-and-braces role guard (middleware also enforces this).
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const [users, submissionsCount, challengesCount, roadmaps, liveClasses, forumTopics] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { profile: true } }),
    prisma.challengeSubmission.count(),
    prisma.challenge.count(),
    prisma.roadmap.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { modules: true, enrollments: true } } } }),
    prisma.liveClass.findMany({ orderBy: { startsAt: "desc" }, take: 20, include: { _count: { select: { attendance: true } } } }),
    prisma.forumTopic.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { id: true, name: true } }, _count: { select: { comments: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Admin Console</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Manage users, content, live classes, challenges, and community moderation.
        </p>
      </header>

      <AdminTabsClient
        users={users}
        submissionsCount={submissionsCount}
        challengesCount={challengesCount}
        roadmaps={roadmaps}
        liveClasses={liveClasses}
        forumTopics={forumTopics}
      />
    </div>
  );
}