import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to join." }, { status: 401 });
  if (session.role !== "STUDENT") return NextResponse.json({ error: "Only student accounts can join." }, { status: 403 });
  const { id } = await params;
  const now = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const competition = await tx.competition.findFirst({ where: { id, isPublished: true } });
    if (!competition) return { error: "Competition not found.", status: 404 as const };
    const existing = await tx.competitionEnrollment.findUnique({ where: { userId_competitionId: { userId: session.sub, competitionId: id } } });
    if (existing) return { enrollment: existing, alreadyEnrolled: true, status: 200 as const };
    if (now < competition.startDate || now > competition.endDate) {
      return { error: "This competition is not currently accepting entries.", status: 400 as const };
    }
    const count = await tx.competitionEnrollment.count({ where: { competitionId: id, status: { not: "WITHDRAWN" } } });
    if (competition.maxParticipants && count >= competition.maxParticipants) {
      return { error: "This competition is full.", status: 409 as const };
    }
    const enrollment = await tx.competitionEnrollment.create({
      data: { userId: session.sub, competitionId: id, status: "ENROLLED" },
    });
    return { enrollment, status: 201 as const };
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result, { status: result.status });
}
