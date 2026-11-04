import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  prompt: z.string().trim().min(1).max(4000),
  kind: z.string().trim().max(40).optional(),
  topic: z.string().trim().max(120).optional(),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a prompt of up to 4,000 characters." }, { status: 400 });
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI tutoring is not configured. Add NVIDIA_API_KEY on the server." }, { status: 503 });
  }

  const { prompt, kind = "concept_explain", topic, difficultyLevel = "beginner" } = parsed.data;

  // Fetch user's learning context: current roadmap, recent lessons, and progress
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      profile: true,
      courseEnrollments: {
        include: { course: true },
      },
      roadmapEnrollments: {
        include: { roadmap: true },
      },
      aiInteractions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  const recentTopics = user?.aiInteractions?.map((ai) => ai.topic).filter(Boolean) || [];
  const enrolledRoadmaps = user?.roadmapEnrollments?.map((enroll) => enroll.roadmap) || [];
  const enrolledCourses = user?.courseEnrollments?.map((enroll) => enroll.course) || [];

  // Build a context string for the AI about the user's learning journey
  let learningContext = "";
  if (enrolledRoadmaps.length > 0) {
    learningContext += `\nUser is enrolled in these roadmaps: ${enrolledRoadmaps.map((r) => r.title).join(", ")}`;
  }
  if (enrolledCourses.length > 0) {
    learningContext += `\nUser is studying these courses: ${enrolledCourses.map((c) => c.title).join(", ")}`;
  }
  if (recentTopics.length > 0) {
    learningContext += `\nUser has recently asked about: ${recentTopics.join(", ")}`;
  }
  // Add user's role and level
  learningContext += `\nUser role: ${session.role}. Learning level: ${difficultyLevel}.`;

  const systemPrompt = [
    "You are Tuiton, a patient educational tutor for school-age learners and adults.",
    "Teach step by step, ask guiding questions when useful, and adapt explanations to the requested level.",
    "Do not simply complete graded work; explain the method and encourage the learner to try.",
    "Keep responses accurate, supportive, age-appropriate, and focused on learning.",
    "Always be encouraging and build the learner's confidence.",
    "",
    "Learning context:",
    learningContext,
    "",
    "Guidelines:",
    "- If the user asks about a school subject, connect it to their enrolled roadmaps/courses when possible.",
    "- If the user asks about coding, provide runnable code snippets and explain the logic step by step.",
    "- If the user asks about AI/ML concepts, keep it accessible and practical.",
    "- Ask the user what they've tried already before giving answers.",
    "- Suggest relevant challenges, lessons, or roadmap modules when the conversation relates to the user's path.",
    "- If unsure, ask a guiding question rather than just giving the answer.",
  ].join("\n");

  let response: string;
  let tokensUsed: number | undefined;
  try {
    const upstream = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "nvidia/nemotron",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.6,
          max_tokens: 1200,
        }),
        signal: AbortSignal.timeout(30_000),
      }
    );

    if (!upstream.ok) {
      const errorText = await upstream.text();
      console.error("NVIDIA request failed with status", upstream.status, errorText);
      return NextResponse.json({ error: "The tutor is temporarily unavailable. Please try again." }, { status: 502 });
    }

    const result = await upstream.json();
    response = result.choices?.[0]?.message?.content || "";
    tokensUsed = result.usage?.total_tokens;
    if (!response) throw new Error("NVIDIA returned no text");
  } catch (error) {
    console.error("AI tutor request failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "The tutor is temporarily unavailable. Please try again." }, { status: 502 });
  }

  try {
    await prisma.aIInteraction.create({
      data: {
        userId: session.sub,
        sessionId: randomUUID(),
        prompt,
        response,
        kind,
        modelUsed: "nvidia/nemotron",
        topic,
        difficultyLevel,
        tokensUsed,
      },
    });
  } catch (error) {
    console.error("Unable to save AI tutor history:", error instanceof Error ? error.message : "unknown error");
  }

  return NextResponse.json({ response, kind, topic, difficultyLevel, model: "nvidia/nemotron" });
}