import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

const profileSchema = z.object({
  headline: z.string().trim().max(120).optional(),
  primaryFocus: z.string().trim().max(80).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, profile, projects, certificates, enrollments, recentActivity] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true, name: true, headline: true, pillar: true, gradeLevel: true },
    }),
    prisma.studentProfile.findUnique({
      where: { userId: session.sub },
      select: { xp: true, level: true, streak: true, lastActive: true, skills: true, badges: true, skillsTree: true, primaryFocus: true },
    }),
    prisma.project.findMany({ where: { userId: session.sub }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.certificate.findMany({ where: { userId: session.sub }, orderBy: { issuedAt: "desc" }, take: 8 }),
    prisma.courseEnrollment.findMany({
      where: { userId: session.sub },
      include: { course: { select: { id: true, title: true, kind: true, tier: true } } },
      orderBy: { enrolledAt: "desc" },
      take: 10,
    }),
    prisma.xpLog.findMany({ where: { userId: session.sub }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  return NextResponse.json({ user, profile, projects, certificates, enrollments, recentActivity });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid profile details." }, { status: 400 });
  const { headline, primaryFocus } = parsed.data;
  const [user, profile] = await prisma.$transaction([
    prisma.user.update({ where: { id: session.sub }, data: { headline }, select: { id: true, name: true, headline: true } }),
    prisma.studentProfile.update({ where: { userId: session.sub }, data: { primaryFocus } }),
  ]);
  return NextResponse.json({ user, profile });
}
