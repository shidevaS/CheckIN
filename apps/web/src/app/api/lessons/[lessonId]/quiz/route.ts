import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId } = await params;
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = z.object({ answers: z.array(z.number().int().nonnegative()).max(100) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Provide valid quiz answers." }, { status: 400 });
  const answers = parsed.data.answers;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson || !lesson.quiz) return NextResponse.json({ error: "Not a quiz lesson" }, { status: 400 });

  let quiz: Array<{ answer: number }>;
  try { quiz = JSON.parse(lesson.quiz); } catch {
    return NextResponse.json({ error: "This quiz is temporarily unavailable." }, { status: 500 });
  }
  if (!Array.isArray(quiz) || quiz.length === 0 || answers.length !== quiz.length || quiz.some((item) => !Number.isInteger(item.answer))) {
    return NextResponse.json({ error: "Answer count mismatch" }, { status: 400 });
  }

  const score = Math.round((answers.filter((a, i) => a === quiz[i]?.answer).length / quiz.length) * 100);
  const passed = score >= 70;

  const existing = await prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId: session.sub, lessonId } } });
  const awardXp = passed && !existing?.completed;
  await prisma.$transaction(async (tx) => {
    await tx.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.sub, lessonId } },
      update: awardXp ? { completed: true, quizScore: score, completedAt: new Date(), xpTaken: lesson.xp } : { quizScore: score },
      create: { userId: session.sub, lessonId, completed: passed, quizScore: score, completedAt: passed ? new Date() : null, xpTaken: passed ? lesson.xp : 0 },
    });
    if (awardXp) {
      await tx.studentProfile.update({ where: { userId: session.sub }, data: { xp: { increment: lesson.xp }, lastActive: new Date() } });
      await tx.xpLog.create({ data: { userId: session.sub, amount: lesson.xp, reason: `Quiz passed: ${score}%`, itemId: lessonId, itemType: "lesson" } });
    }
  });

  return NextResponse.json({ score, passed, xp: awardXp ? lesson.xp : 0, alreadyCompleted: Boolean(existing?.completed) });
}