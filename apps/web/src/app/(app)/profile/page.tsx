import { Metadata } from "next";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = { title: "Profile & Portfolio" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) return null;

  const [user, profile, projectsRaw, certificatesRaw, badges, enrollmentsRaw, xpLogsRaw] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.sub } }),
    prisma.studentProfile.findUnique({ where: { userId: session.sub } }),
    prisma.project.findMany({ where: { userId: session.sub }, orderBy: { createdAt: "desc" } }),
    prisma.certificate.findMany({ where: { userId: session.sub }, orderBy: { issuedAt: "desc" } }),
    prisma.badge.findMany(),
    prisma.roadmapEnrollment.findMany({
      where: { userId: session.sub },
      include: { roadmap: true },
    }),
    prisma.xpLog.findMany({ where: { userId: session.sub }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const earnedBadges = profile?.badges ? JSON.parse(profile.badges) : [];
  const skillsTree = profile?.skillsTree ? JSON.parse(profile.skillsTree) : {};

  const projects = projectsRaw.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));
  const certificates = certificatesRaw.map((c) => ({ ...c, issuedAt: c.issuedAt.toISOString() }));
  const enrollments = enrollmentsRaw.map((e) => ({ ...e, enrolledAt: e.enrolledAt.toISOString() }));
  const xpLogs = xpLogsRaw.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() }));

  return <ProfileClient
    initialUser={user}
    initialProfile={profile}
    initialProjects={projects}
    initialCertificates={certificates}
    initialBadges={badges}
    initialEarnedBadges={earnedBadges}
    initialSkillsTree={skillsTree}
    initialEnrollments={enrollments}
    initialXpLogs={xpLogs}
    sessionUser={session}
  />;
}