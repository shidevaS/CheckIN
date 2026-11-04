import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui";
import CourseCatalogClient from "./CourseCatalogClient";

export const metadata: Metadata = { title: "Course Library" };

export default async function CoursesPage() {
  const session = await getSession();
  if (!session) return null;
  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      orderBy: [{ subjectArea: "asc" }, { title: "asc" }],
      select: {
        id: true, title: true, description: true, kind: true, tier: true,
        price: true, durationWeeks: true, subjectArea: true, gradeLevel: true,
        learningObjectives: true, xpAwarded: true,
      },
    }),
    prisma.courseEnrollment.findMany({ where: { userId: session.sub }, select: { courseId: true } }),
  ]);
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Course library</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Find a course that fits your grade, interests, and next goal.</p>
        </div>
        <Button variant="outline" asChild><Link href="/roadmaps">Browse learning paths</Link></Button>
      </header>
      <CourseCatalogClient courses={courses} enrolledIds={enrollments.map((entry) => entry.courseId)} />
    </div>
  );
}
