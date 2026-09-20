import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, score, feedback, xpAwarded } = body;

  const submission = await prisma.challengeSubmission.findUnique({
    where: { id },
    include: { user: true, challenge: true },
  });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Update submission
  const updated = await prisma.challengeSubmission.update({
    where: { id },
    data: {
      status: status ?? submission.status,
      score: score ?? submission.score,
      feedback: feedback ?? submission.feedback,
      xpAwarded: xpAwarded ?? submission.xpAwarded,
      reviewedById: session.sub,
      gradedAt: new Date(),
    },
  });

  // If approved and XP awarded, add to user's total and create XP log
  if (status === "APPROVED" && (xpAwarded ?? 0) > 0 && submission.xpAwarded !== xpAwarded) {
    await prisma.$transaction([
      prisma.studentProfile.update({
        where: { userId: submission.userId },
        data: { xp: { increment: (xpAwarded ?? 0) } },
      }),
      prisma.xpLog.create({
        data: {
          userId: submission.userId,
          amount: xpAwarded ?? 0,
          reason: `Challenge: ${submission.challenge.title}`,
          itemId: submission.id,
        },
      }),
      // Update level if needed
      prisma.studentProfile.update({
        where: { userId: submission.userId },
        data: {
          level: {
            // Simple level formula: level = floor(sqrt(xp / 100)) + 1
            // We'll compute this properly
          },
        },
      }),
    ]);

    // Recalculate level
    const profile = await prisma.studentProfile.findUnique({ where: { userId: submission.userId } });
    if (profile) {
      const newLevel = Math.floor(Math.sqrt(profile.xp / 100)) + 1;
      if (newLevel > profile.level) {
        await prisma.studentProfile.update({
          where: { userId: submission.userId },
          data: { level: newLevel },
        });
      }
    }
  }

  return NextResponse.json(updated);
}