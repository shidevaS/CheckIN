"use client";

import { useState } from "react";
import { Check, Clock3, LoaderCircle } from "lucide-react";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

type Course = {
  id: string;
  title: string;
  description: string;
  kind: string;
  tier: string;
  price: number | null;
  durationWeeks: number;
  subjectArea: string;
  gradeLevel: string;
  learningObjectives: string;
  xpAwarded: number;
};

export default function CourseCatalogClient({ courses, enrolledIds }: { courses: Course[]; enrolledIds: string[] }) {
  const [enrolled, setEnrolled] = useState(() => new Set(enrolledIds));
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function enroll(course: Course) {
    if (course.tier === "PAID") {
      setError("Paid checkout is not active yet. No payment will be taken; check back after billing is configured.");
      return;
    }
    setBusyId(course.id);
    setError("");
    try {
      const response = await fetch(`/api/courses/${course.id}/enroll`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not enroll in this course.");
      setEnrolled((current) => new Set(current).add(course.id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not enroll in this course.");
    } finally {
      setBusyId("");
    }
  }

  if (courses.length === 0) {
    return <p className="border-y border-border py-8 text-muted-foreground">No courses have been published yet. Explore the learning roadmaps while new courses are being prepared.</p>;
  }

  return (
    <div className="space-y-4">
      {error && <p className="border-y border-destructive/30 py-3 text-sm text-destructive" role="alert">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col">
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <Badge tone={course.tier === "FREE" ? "teal" : "gold"}>{course.tier === "FREE" ? "Free" : "Paid"}</Badge>
                <Badge>{course.kind}</Badge>
              </div>
              <CardTitle className="pt-2 font-serif text-lg">{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto space-y-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span>{course.subjectArea}</span><span>{course.gradeLevel}</span>
                <span className="flex items-center gap-1"><Clock3 size={14} aria-hidden="true" />{course.durationWeeks} weeks</span>
              </div>
              {course.tier === "PAID" && course.price !== null && <p className="text-sm font-semibold">${(course.price / 100).toFixed(2)}</p>}
              <Button className="w-full" variant={enrolled.has(course.id) ? "secondary" : "primary"} disabled={busyId === course.id || enrolled.has(course.id)} onClick={() => enroll(course)}>
                {busyId === course.id ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : enrolled.has(course.id) ? <Check size={16} aria-hidden="true" /> : null}
                {busyId === course.id ? "Joining…" : enrolled.has(course.id) ? "Enrolled" : course.tier === "PAID" ? "View availability" : "Enroll for free"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
