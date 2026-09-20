import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@tuiton/db";
import ChallengeClient from "./ChallengeClient";

interface Props { params: Promise<{ challengeId: string }> }

export default async function ChallengePage({ params }: Props) {
  const { challengeId } = await params;
  const session = await getSession();
  if (!session) return null;

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: { submissions: { where: { userId: session.sub } } },
  });

  if (!challenge) notFound();

  const submission = challenge.submissions[0] || null;

  return <ChallengeClient initialChallenge={challenge as any} initialSubmission={submission} sessionUser={session} />;
}