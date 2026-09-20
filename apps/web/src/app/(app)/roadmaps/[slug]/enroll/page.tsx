import { redirect } from "next/navigation";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";

export default async function EnrollPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { slug } = await params;
  const roadmap = await prisma.roadmap.findUnique({ where: { slug } });
  if (!roadmap) notFound();

  await prisma.roadmapEnrollment.upsert({
    where: { userId_roadmapId: { userId: session.sub, roadmapId: roadmap.id } },
    update: {},
    create: { userId: session.sub, roadmapId: roadmap.id },
  });

  redirect(`/roadmaps/${slug}`);
}