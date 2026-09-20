import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import LiveClassClient from "./LiveClassClient";

interface Props { params: Promise<{ classId: string }> }

async function getClassData(classId: string) {
  const { prisma } = await import("@tuiton/db");
  return prisma.liveClass.findUnique({
    where: { id: classId },
    include: {
      roadmap: { select: { title: true, color: true } },
      _count: { select: { attendance: true, chat: true } },
    },
  });
}

export default async function LiveClassPage({ params }: Props) {
  const { classId } = await params;
  const session = await getSession();
  if (!session) return null;

  const cls = await getClassData(classId);
  if (!cls) notFound();

  return <LiveClassClient initialClass={cls as any} sessionUser={session} />;
}