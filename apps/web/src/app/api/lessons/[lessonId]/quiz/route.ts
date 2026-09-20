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
  const body = await req.json();
  const answers: number[] = body.answers || [];

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson || !lesson.quiz) return NextResponse.json({ error: "Not a quiz lesson" }, { status: 400 });

  const quiz = JSON.parse(lesson.quiz);
  if (answers.length !== quiz.length) return NextResponse.json({ error: "Answer count mismatch" }, { status: 400 });

  const score = Math.round((answers.filter((a, i) => a === quiz[i]?.answer).length / quiz.length) * 100);
  const passed = score >= 70;

  if (passed) {
    await prisma.$transaction([
      prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId: session.sub, lessonId } },
        update: { completed: true, quizScore: score, completedAt: new Date(), xpTaken: lesson.xp },
        create: { userId: session.sub, lessonId, completed: true, quizScore: score, completedAt: new Date(), xpTaken: lesson.xp },
      }),
      prisma.studentProfile.update({
        where: { userId: session.sub },
        data: { xp: { increment: lesson.xp }, lastActive: new Date() },
      }),
      prisma.xpLog.create({
        data: { userId: session.sub, amount: lesson.xp, reason: `Quiz passed: ${score}%`, itemId: lessonId },
      }),
    ]);
  } else {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.sub, lessonId } },
      update: { quizScore: score },
      create: { userId: session.sub, lessonId, quizScore: score },
    });
  }

  return NextResponse.json({ score, passed, xp: passed ? lesson.xp : 0 });
}