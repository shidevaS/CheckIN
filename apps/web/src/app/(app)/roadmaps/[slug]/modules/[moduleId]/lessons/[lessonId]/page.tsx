import { notFound } from "next/navigation";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import LessonClient from "./LessonClient";

interface Props { params: Promise<{ slug: string; moduleId: string; lessonId: string }> }

export default async function LessonPage({ params }: Props) {
  const { slug, moduleId, lessonId } = await params;
  const session = await getSession();
  if (!session) return null;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: { include: { roadmap: true } },
      progress: session ? { where: { userId: session.sub } } : false,
    },
  });

  if (!lesson || lesson.moduleId !== moduleId || lesson.module.roadmap.slug !== slug) notFound();

  const progress = lesson.progress?.[0] || null;

  return <LessonClient initialLesson={lesson} initialProgress={progress} sessionUser={session} />;
}