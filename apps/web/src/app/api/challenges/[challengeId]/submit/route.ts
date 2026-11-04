import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

const submissionSchema = z.object({
  answers: z.array(z.number().int().nonnegative()).max(100).optional(),
  content: z.string().trim().max(12000).optional(),
  code: z.string().trim().max(12000).optional(),
  prompt: z.string().trim().max(12000).optional(),
}).refine((value) => Boolean(value.answers || value.content || value.code || value.prompt), {
  message: "A quiz answer or written submission is required.",
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId } = await params;
  let rawBody: unknown;
  try { rawBody = await req.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = submissionSchema.safeParse(rawBody);
  if (!parsed.success) return NextResponse.json({ error: "Provide a valid answer." }, { status: 400 });
  const body = parsed.data;

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge || !challenge.published) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  const now = new Date();
  if ((challenge.startsAt && now < challenge.startsAt) || (challenge.endsAt && now > challenge.endsAt)) {
    return NextResponse.json({ error: "This challenge is not currently accepting submissions." }, { status: 400 });
  }

  // Check for existing submission
  const existing = await prisma.challengeSubmission.findUnique({
    where: { challengeId_userId: { challengeId, userId: session.sub } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });
  }

  let score: number | null = null;
  let autoPassed = false;
  let feedback = "Your work has been submitted for tutor review.";

  if (challenge.kind === "QUIZ" && challenge.options && body.answers) {
    let quiz: Array<{ answer: number }>;
    try { quiz = JSON.parse(challenge.options); } catch {
      return NextResponse.json({ error: "This quiz is temporarily unavailable." }, { status: 500 });
    }
    if (!Array.isArray(quiz) || quiz.length === 0 || body.answers.length !== quiz.length || quiz.some((item) => !Number.isInteger(item.answer))) {
      return NextResponse.json({ error: "Answer count does not match this quiz." }, { status: 400 });
    }
    score = Math.round((body.answers.filter((answer, index) => answer === quiz[index].answer).length / quiz.length) * 100);
    autoPassed = score >= 70;
    feedback = autoPassed ? "Quiz passed. Great work!" : "Score below 70%. Review the material and try again.";
  } else if (challenge.kind === "QUIZ") {
    return NextResponse.json({ error: "Quiz answers are required." }, { status: 400 });
  }

  const xpAwarded = autoPassed ? challenge.xp : 0;
  const submission = await prisma.$transaction(async (tx) => {
    const created = await tx.challengeSubmission.create({
      data: {
        challengeId,
        userId: session.sub,
        content: body.content || body.code || body.prompt || JSON.stringify(body.answers),
        score,
        autoPassed: challenge.kind === "QUIZ" ? autoPassed : null,
        status: autoPassed ? "APPROVED" : challenge.kind === "QUIZ" ? "REJECTED" : "SUBMITTED",
        xpAwarded,
        feedback,
        gradedAt: autoPassed ? new Date() : null,
      },
    });
    if (autoPassed) {
      await tx.studentProfile.update({ where: { userId: session.sub }, data: { xp: { increment: challenge.xp }, lastActive: new Date() } });
      await tx.xpLog.create({ data: { userId: session.sub, amount: challenge.xp, reason: `Challenge: ${challenge.title}`, itemId: challengeId, itemType: "challenge" } });
    }
    return created;
  }).catch((error: unknown) => {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return null;
    throw error;
  });
  if (!submission) {
    return NextResponse.json({ error: "Already submitted" }, { status: 409 });
  }

  return NextResponse.json({
    score,
    passed: challenge.kind === "QUIZ" ? autoPassed : null,
    xpAwarded,
    feedback,
    status: submission.status,
    id: submission.id,
  });
}