import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const competition = await prisma.competition.findFirst({
    where: { id, isPublished: true },
    include: {
      _count: { select: { enrollments: true } },
      enrollments: session ? {
        where: { userId: session.sub },
        select: { status: true, rank: true, score: true, xpAwarded: true, startedAt: true, completedAt: true },
        take: 1,
      } : false,
    },
  });
  if (!competition) return NextResponse.json({ error: "Competition not found." }, { status: 404 });
  const enrollment = session && "enrollments" in competition ? competition.enrollments[0] : undefined;
  return NextResponse.json({ ...competition, isEnrolled: Boolean(enrollment), enrollment: enrollment ?? null });
}
