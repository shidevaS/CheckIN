import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

function scoreQuiz(answers: number[], quiz: any[]): number {
  return Math.round((answers.filter((a, i) => a === quiz[i]?.answer).length / quiz.length) * 100);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId } = await params;
  const body = await req.json();

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  // Check for existing submission
  const existing = await prisma.challengeSubmission.findUnique({
    where: { challengeId_userId: { challengeId, userId: session.sub } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });
  }

  let score = 100;
  let autoPassed = true;
  let feedback = "";

  if (challenge.kind === "QUIZ" && challenge.options && body.answers) {
    const quiz = JSON.parse(challenge.options);
    score = scoreQuiz(body.answers, quiz);
    autoPassed = score >= 70;
    if (!autoPassed) feedback = "Score below 70%. Review the material and try next time!";
  } else if (challenge.kind === "CODING" && body.code) {
    // In production, this would run in a sandbox
    // For now, auto-approve with feedback
    autoPassed = true;
    feedback = "Code submitted for review. Great effort!";
  } else if (challenge.kind === "PROMPT_AI" && (body.prompt || body.content)) {
    autoPassed = true;
    feedback = "Prompt submitted! Try running it in your favorite LLM.";
  } else {
    // Generic submission
    autoPassed = true;
    feedback = "Submission received!";
  }

  const xpAwarded = autoPassed ? challenge.xp : 0;
  const status = autoPassed ? "APPROVED" : "REJECTED";

  const submission = await prisma.challengeSubmission.create({
    data: {
      challengeId,
      userId: session.sub,
      content: body.content || body.code || body.prompt || JSON.stringify(body),
      score,
      autoPassed,
      status,
      xpAwarded,
      feedback: autoPassed ? undefined : feedback,
      gradedAt: autoPassed ? new Date() : null,
    },
  });

  if (autoPassed) {
    await prisma.$transaction([
      prisma.studentProfile.update({
        where: { userId: session.sub },
        data: { xp: { increment: challenge.xp }, lastActive: new Date() },
      }),
      prisma.xpLog.create({
        data: { userId: session.sub, amount: challenge.xp, reason: `Challenge: ${challenge.title}`, itemId: challengeId },
      }),
    ]);
  }

  return NextResponse.json({
    score,
    passed: autoPassed,
    xpAwarded,
    feedback,
    status: submission.status,
    id: submission.id,
  });
}