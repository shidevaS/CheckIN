import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.sub, lessonId } },
  });

  if (existing?.completed) {
    return NextResponse.json({ ok: true, alreadyCompleted: true });
  }

  await prisma.$transaction([
    prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.sub, lessonId } },
      update: { completed: true, completedAt: new Date(), xpTaken: lesson.xp },
      create: { userId: session.sub, lessonId, completed: true, completedAt: new Date(), xpTaken: lesson.xp },
    }),
    prisma.studentProfile.update({
      where: { userId: session.sub },
      data: { xp: { increment: lesson.xp }, lastActive: new Date() },
    }),
    prisma.xpLog.create({
      data: { userId: session.sub, amount: lesson.xp, reason: `Completed lesson: ${lesson.title}`, itemId: lessonId },
    }),
  ]);

  return NextResponse.json({ ok: true, xp: lesson.xp });
}