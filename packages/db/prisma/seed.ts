import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/password";

const prisma = new PrismaClient();

const ADMIN_PASSWORD = "tuiton123";
const STUDENT_PASSWORD = "tuiton123";

async function main() {
  // --- Admins ---
  const admins = [
    { name: "Shivani Pal", email: "shivani@tuiton.app" },
    { name: "Devendra Sharma", email: "devendra@tuiton.app" },
  ];
  for (const a of admins) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: { role: "ADMIN" },
      create: {
        name: a.name,
        email: a.email,
        role: "ADMIN",
        passwordHash: hashPassword(ADMIN_PASSWORD),
        pillar: "SUBJECTS",
      },
    });
    console.log(`✓ admin  ${a.email}`);
  }

  // --- Student ---
  await prisma.user.upsert({
    where: { email: "student@tuiton.app" },
    update: {},
    create: {
      name: "Demo Student",
      email: "student@tuiton.app",
      role: "STUDENT",
      passwordHash: hashPassword(STUDENT_PASSWORD),
      pillar: "subjects",
      profile: {
        create: {
          grade: "9",
          school: "Demo School",
          city: "Bengaluru",
          bio: "Curious builder. I love coding, science, and making AI agents.",
          xp: 320,
          level: 3,
          streak: 6,
          skills: JSON.stringify(["algebra", "python-basics", "prompt-engineering"]),
          badges: JSON.stringify(["first-steps", "streak-3", "quiz-ace"]),
          skillsTree: JSON.stringify({ "algebra": 75, "python-basics": 40, "prompt-engineering": 60 }),
        },
      },
    },
  });
  console.log("✓ student student@tuiton.app");

  const admin = await prisma.user.findUnique({ where: { email: "shivani@tuiton.app" } });
  const student = await prisma.user.findUnique({ where: { email: "student@tuiton.app" } });

  // =====================================================================
  // PHASE 2: ROADMAPS & CONTENT LIBRARY
  // =====================================================================

  // --- PILLAR: SUBJECTS ---
  const mathRm = await prisma.roadmap.upsert({
    where: { slug: "maths-ix-x" },
    update: {},
    create: {
      slug: "maths-ix-x",
      pillar: "subjects",
      title: "Mathematics (IX–X)",
      tagline: "Board-aligned Algebra, Geometry, Trigonometry & Statistics",
      grade: "9–10",
      color: "#166534",
      order: 1,
      published: true,
    },
  });
  const scienceRm = await prisma.roadmap.upsert({
    where: { slug: "science-ix-x" },
    update: {},
    create: {
      slug: "science-ix-x",
      pillar: "subjects",
      title: "Science (IX–X)",
      tagline: "Physics, Chemistry, Biology — NCERT + Olympiad prep",
      grade: "9–10",
      color: "#166534",
      order: 2,
      published: true,
    },
  });
  const englishRm = await prisma.roadmap.upsert({
    where: { slug: "english-ix-x" },
    update: {},
    create: {
      slug: "english-ix-x",
      pillar: "subjects",
      title: "English (IX–X)",
      tagline: "Literature, Writing & Grammar for board exams",
      grade: "9–10",
      color: "#166534",
      order: 3,
      published: true,
    },
  });
  const sstRm = await prisma.roadmap.upsert({
    where: { slug: "sst-ix-x" },
    update: {},
    create: {
      slug: "sst-ix-x",
      pillar: "subjects",
      title: "Social Science (IX–X)",
      tagline: "History, Geography, Civics, Economics — mapped to CBSE",
      grade: "9–10",
      color: "#166534",
      order: 4,
      published: true,
    },
  });

  // --- PILLAR: INNOVATION LAB ---
  const aiRm = await prisma.roadmap.upsert({
    where: { slug: "ai-foundations" },
    update: {},
    create: {
      slug: "ai-foundations",
      pillar: "innovation",
      title: "AI Foundations",
      tagline: "How LLMs work, embeddings, RAG, agents — build your first AI app",
      grade: "8–12",
      color: "#2563eb",
      order: 1,
      published: true,
    },
  });
  const codingRm = await prisma.roadmap.upsert({
    where: { slug: "python-coding" },
    update: {},
    create: {
      slug: "python-coding",
      pillar: "innovation",
      title: "Python for Builders",
      tagline: "From zero to APIs & tiny games — project-based learning",
      grade: "7–12",
      color: "#2563eb",
      order: 2,
      published: true,
    },
  });
  const aiAgentsRm = await prisma.roadmap.upsert({
    where: { slug: "ai-agents-building" },
    update: {},
    create: {
      slug: "ai-agents-building",
      pillar: "innovation",
      title: "AI Agent Engineering",
      tagline: "Design, code & ship autonomous agents — tools, memory, planning",
      grade: "9–12",
      color: "#2563eb",
      order: 3,
      published: true,
    },
  });
  const promptRm = await prisma.roadmap.upsert({
    where: { slug: "prompt-engineering" },
    update: {},
    create: {
      slug: "prompt-engineering",
      pillar: "innovation",
      title: "Prompt Engineering",
      tagline: "Master prompting patterns, evals, and prompt-as-code",
      grade: "8–12",
      color: "#2563eb",
      order: 4,
      published: true,
    },
  });
  const cyberRm = await prisma.roadmap.upsert({
    where: { slug: "cyber-basics" },
    update: {},
    create: {
      slug: "cyber-basics",
      pillar: "innovation",
      title: "Cyber Basics",
      tagline: "Networking, crypto, CTFs, and safe digital habits",
      grade: "9–12",
      color: "#2563eb",
      order: 5,
      published: true,
    },
  });

  console.log("✓ roadmaps created");

  // Helper: add module + lessons to a roadmap
  async function addModule(roadmapId: string, title: string, desc: string, order: number, lessons: any[]) {
    const mod = await prisma.module.create({
      data: {
        roadmapId,
        title,
        description: desc,
        order,
        lessons: { create: lessons.map((l, i) => ({ ...l, roadmapId, order: i + 1 })) },
      },
      include: { lessons: true },
    });
    return mod;
  }

  // Math IX–X modules
  await addModule(mathRm.id, "Algebra", "Polynomials, equations, inequalities", 1, [
    { title: "Polynomials & Zeroes", summary: "Degree, roots, factor theorem", kind: "READING", xp: 15, content: "A polynomial in x of degree n is... # Polynomials\n\n- Degree = highest power\n- Factor theorem: if p(a)=0 then (x-a) is a factor\n\n## Examples\n`x^2 - 5x + 6 = (x-2)(x-3)`" },
    { title: "Quadratic Equations", summary: "Discriminant, nature of roots", kind: "VIDEO", xp: 15, videoUrl: "https://www.youtube.com/watch?v=example_quadratic", content: "Quadratic formula: `x = (-b ± √(b²-4ac)) / 2a`. Discriminant D = b²-4ac." },
    { title: "Pair of Linear Equations", summary: "Graphical & algebraic methods", kind: "QUIZ", xp: 20, quiz: JSON.stringify([
      { prompt: "Solve: 2x + 3y = 7, 4x - y = 5", options: ["x=2,y=1", "x=1,y=2", "x=3,y=0", "x=0,y=3"], answer: 0 },
    ]) },
    { title: "Polynomials Practice", summary: "Code a root finder", kind: "CODING", xp: 25, starter: "def find_roots(a,b,c):\n  # return roots of ax^2 + bx + c\n  pass\n" },
  ]);

  await addModule(mathRm.id, "Geometry", "Triangles, circles, constructions", 2, [
    { title: "Similar Triangles", summary: "AA, SAS, SSS criteria", kind: "READING", xp: 15, content: "Two triangles are similar if corresponding angles are equal (AA)." },
    { title: "Circle Theorems", summary: "Tangents, chords, cyclic quadrilaterals", kind: "VIDEO", xp: 15, videoUrl: "https://www.youtube.com/watch?v=example_circles" },
    { title: "Geometry Quiz", summary: "10 quick questions", kind: "QUIZ", xp: 20, quiz: JSON.stringify([
      { prompt: "In a right triangle, the side opposite 90° is called:", options: ["hypotenuse", "adjacent", "opposite", "base"], answer: 0 },
    ]) },
  ]);

  await addModule(mathRm.id, "Trigonometry", "Ratios, identities, heights & distances", 3, [
    { title: "Trigonometric Ratios", summary: "sin, cos, tan, cosec, sec, cot", kind: "READING", xp: 15, content: "sin θ = opposite/hypotenuse\ncos θ = adjacent/hypotenuse" },
    { title: "Heights & Distances", summary: "Angle of elevation/depression", kind: "VIDEO", xp: 15, videoUrl: "https://www.youtube.com/watch?v=example_heights" },
    { title: "Trig Identity Challenge", summary: "Prove sin²+cos²=1 in code", kind: "CODING", xp: 25, starter: "import math\ndef verify_identity(theta):\n  return math.sin(theta)**2 + math.cos(theta)**2\n" },
  ]);

  // Science IX–X
  await addModule(scienceRm.id, "Physics: Motion", "Kinematics, laws of motion, work & energy", 1, [
    { title: "Distance vs Displacement", summary: "Scalars vs vectors", kind: "READING", xp: 10, content: "Distance is scalar; displacement is vector." },
    { title: "Newton's Laws", summary: "F=ma, action-reaction", kind: "VIDEO", xp: 15, videoUrl: "https://www.youtube.com/watch?v=example_newton" },
    { title: "Work-Energy Theorem", summary: "Kinetic & potential energy", kind: "QUIZ", xp: 20, quiz: JSON.stringify([ { prompt: "Unit of work:", options: ["Joule", "Watt", "Newton", "Pascal"], answer: 0 } ]) },
  ]);

  await addModule(scienceRm.id, "Chemistry: Matter", "States, atoms, chemical reactions", 2, [
    { title: "States of Matter", summary: "Solid, liquid, gas, plasma", kind: "READING", xp: 10, content: "Matter exists in 4 states..." },
    { title: "Atomic Structure", summary: "Electrons, protons, neutrons", kind: "VIDEO", xp: 15, videoUrl: "https://www.youtube.com/watch?v=example_atom" },
  ]);

  // AI Foundations
  await addModule(aiRm.id, "How LLMs Work", "Tokens, embeddings, attention, training", 1, [
    { title: "Tokens & Embeddings", summary: "From text to vectors", kind: "READING", xp: 15, content: "Each token maps to a high-dimensional vector..." },
    { title: "Attention Mechanism", summary: "Query, Key, Value", kind: "VIDEO", xp: 15, videoUrl: "https://www.youtube.com/watch?v=example_attention" },
    { title: "Build a Tiny LLM", summary: "Character-level GPT in 100 lines", kind: "CODING", xp: 30, starter: "import torch\nimport torch.nn as nn\n# TODO: implement attention\n" },
  ]);

  await addModule(aiRm.id, "RAG & Agents", "Retrieval, tools, planning", 2, [
    { title: "RAG Pipeline", summary: "Chunk, embed, retrieve, generate", kind: "READING", xp: 15, content: "1. Chunk docs\n2. Embed chunks\n3. Retrieve top-k\n4. Feed to LLM" },
    { title: "Your First Agent", summary: "Tool calling + memory", kind: "CODING", xp: 30, starter: "# Build an agent that can search Wikipedia\nimport openai\n# TODO: implement tool loop\n" },
  ]);

  // Python Coding
  await addModule(codingRm.id, "Python Basics", "Variables, loops, functions", 1, [
    { title: "Hello Python", summary: "Print, strings, numbers", kind: "CODING", xp: 15, starter: "print('Hello, Tuiton!')\n# Try: print(3**4)\n# Try: print('ai' + 'agent')\n" },
    { title: "Control Flow", summary: "if/else, for, while", kind: "CODING", xp: 20, starter: "for i in range(5):\n  if i % 2 == 0:\n    print(i, 'even')\n  else:\n    print(i, 'odd')\n" },
  ]);

  await addModule(codingRm.id, "Data Structures", "Lists, dicts, sets, comprehension", 2, [
    { title: "Lists & Dicts", summary: "CRUD on collections", kind: "CODING", xp: 20, starter: "students = [\n  {'name': 'Asha', 'xp': 320},\n  {'name': 'Rohan', 'xp': 180},\n]\n# TODO: find top student\n" },
  ]);

  // AI Agents Building
  await addModule(aiAgentsRm.id, "Agent Architecture", "Planner, tools, memory, loop", 1, [
    { title: "ReAct Pattern", summary: "Reasoning + Acting", kind: "READING", xp: 15, content: "ReAct = Thought → Action → Observation loop" },
    { title: "Build a ReAct Agent", summary: "Step-by-step with OpenAI functions", kind: "CODING", xp: 30, starter: "# ReAct agent skeleton\nclass ReactAgent:\n  def __init__(self, tools):\n    self.tools = tools\n  def run(self, query):\n    pass\n" },
  ]);

  await addModule(aiAgentsRm.id, "Multi-Agent Systems", "Orchestration, handoffs, swarm", 2, [
    { title: "Agent Handoffs", summary: "Specialist agents collaborating", kind: "CODING", xp: 30, starter: "# Researcher → Writer → Reviewer pipeline\n" },
  ]);

  // Prompt Engineering
  await addModule(promptRm.id, "Prompt Patterns", "Zero-shot, few-shot, CoT, self-consistency", 1, [
    { title: "Chain-of-Thought", summary: "Let the model think step by step", kind: "READING", xp: 15, content: "Add 'Let's think step by step' to prompts..." },
    { title: "Few-Shot Prompting", summary: "Examples as context", kind: "CODING", xp: 20, starter: "# Classify sentiment with 5 examples\nprompt = '''\nReview: Great food! -> Positive\nReview: Terrible service. -> Negative\n...\n'''\n" },
  ]);

  // Cyber Basics
  await addModule(cyberRm.id, "Networking 101", "IP, DNS, HTTP, TLS", 1, [
    { title: "How the Internet Works", summary: "Packets, routers, protocols", kind: "VIDEO", xp: 15, videoUrl: "https://www.youtube.com/watch?v=example_net" },
    { title: "CTF Warmup", summary: "Find the flag in HTTP headers", kind: "CODING", xp: 25, starter: "import requests\nr = requests.get('http://example.com')\nprint(r.headers)\n# Look for flag\n" },
  ]);

  console.log("✓ modules & lessons created");

  // Enroll the demo student in a few roadmaps
  for (const rm of [mathRm, aiRm, codingRm, aiAgentsRm]) {
    await prisma.roadmapEnrollment.upsert({
      where: { userId_roadmapId: { userId: student!.id, roadmapId: rm.id } },
      update: { progressPct: Math.floor(Math.random() * 30) + 10 },
      create: { userId: student!.id, roadmapId: rm.id, progressPct: Math.floor(Math.random() * 30) + 10 },
    });
  }
  console.log("✓ student enrolled");

  // =====================================================================
  // PHASE 3: LIVE CLASSES (Jitsi)
  // =====================================================================
  const now = new Date();
  const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.liveClass.upsert({
    where: { roomName: "tuiton-math-algebra-1" },
    update: {},
    create: {
      title: "Algebra: Polynomials & Factor Theorem",
      description: "Live walkthrough of factor theorem with examples + Q&A",
      roadmapId: mathRm.id,
      hostId: admin!.id,
      hostName: "Shivani Pal",
      startsAt: tmrw,
      durationMin: 60,
      roomName: "tuiton-math-algebra-1",
      status: "SCHEDULED",
    },
  });

  await prisma.liveClass.upsert({
    where: { roomName: "tuiton-ai-rag-1" },
    update: {},
    create: {
      title: "RAG from Scratch: Build a Document Q&A Bot",
      description: "We'll chunk PDFs, embed, and hook to an LLM — live code session",
      roadmapId: aiRm.id,
      hostId: admin!.id,
      hostName: "Devendra Sharma",
      startsAt: nextWeek,
      durationMin: 90,
      roomName: "tuiton-ai-rag-1",
      status: "SCHEDULED",
    },
  });

  await prisma.liveClass.upsert({
    where: { roomName: "tuiton-agents-1" },
    update: {},
    create: {
      title: "Your First Autonomous Agent",
      description: "ReAct loop + tool calling — we'll ship a working agent in 60 min",
      roadmapId: aiAgentsRm.id,
      hostId: admin!.id,
      hostName: "Shivani Pal",
      startsAt: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
      durationMin: 60,
      roomName: "tuiton-agents-1",
      status: "SCHEDULED",
    },
  });

  console.log("✓ live classes scheduled");

  // =====================================================================
  // PHASE 4: CHALLENGES & XP GAMIFICATION
  // =====================================================================

  const todayKey = Number(now.toISOString().slice(0, 10).replace(/-/g, ""));
  const thisWeekKey = Number(`${now.getFullYear()}W${Math.ceil(now.getDate() / 7)}`);
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Helper: create challenge
  async function ch(data: any) {
    await prisma.challenge.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  // DAILY challenges (rotate per dayKey)
  await ch({
    id: "ch-daily-math-1",
    kind: "QUIZ",
    title: "Daily Math: Quadratic Roots",
    prompt: "Find the discriminant of 2x² - 4x + 1 = 0",
    cadence: "DAILY",
    difficulty: "BEGINNER",
    strand: "maths",
    options: JSON.stringify([
      { prompt: "Discriminant?", options: ["8", "4", "0", "-4"], answer: 0 },
    ]),
    answer: "8",
    xp: 15,
    dayKey: todayKey,
    published: true,
    createdBy: admin!.id,
  });
  await ch({
    id: "ch-daily-ai-1",
    kind: "PROMPT_AI",
    title: "Daily Prompt: Chain-of-Thought",
    prompt: "Rewrite this prompt to use Chain-of-Thought: 'Is 47 prime?'",
    cadence: "DAILY",
    difficulty: "BEGINNER",
    strand: "ai-foundations",
    starter: "Let's think step by step.\n",
    xp: 20,
    dayKey: todayKey,
    published: true,
    createdBy: admin!.id,
  });
  await ch({
    id: "ch-daily-code-1",
    kind: "CODING",
    title: "Daily Code: FizzBuzz in 3 lines",
    prompt: "Print FizzBuzz 1..20 using a list comprehension",
    cadence: "DAILY",
    difficulty: "BEGINNER",
    strand: "python",
    starter: "# One-liner: print([...])\n",
    xp: 15,
    dayKey: todayKey,
    published: true,
    createdBy: admin!.id,
  });

  // WEEKLY
  await ch({
    id: "ch-weekly-math-1",
    kind: "QUIZ",
    title: "Weekly Math: Triangle Similarity",
    prompt: "Two triangles have angles 30°, 60°, 90° and 60°, 30°, 90°. Are they similar?",
    cadence: "WEEKLY",
    difficulty: "INTERMEDIATE",
    strand: "maths",
    options: JSON.stringify([
      { prompt: "Similar?", options: ["Yes (AA)", "No", "Need side lengths", "Only if scaled"], answer: 0 },
    ]),
    answer: "Yes (AA) — both have 30, 60, 90 so AA criterion holds.",
    xp: 40,
    weekKey: thisWeekKey,
    published: true,
    createdBy: admin!.id,
  });
  await ch({
    id: "ch-weekly-ai-1",
    kind: "CODING",
    title: "Weekly AI: Build a Mini RAG",
    prompt: "Create a script that loads a .txt file, chunks it, embeds with sentence-transformers, and answers a query.",
    cadence: "WEEKLY",
    difficulty: "INTERMEDIATE",
    strand: "ai-agents",
    starter: "from sentence_transformers import SentenceTransformer\nimport faiss\n# TODO\n",
    xp: 60,
    weekKey: thisWeekKey,
    published: true,
    createdBy: admin!.id,
  });
  await ch({
    id: "ch-weekly-code-1",
    kind: "CODING",
    title: "Weekly Code: CLI Todo App",
    prompt: "Build a `todo` CLI with add/list/done/remove using argparse + JSON storage.",
    cadence: "WEEKLY",
    difficulty: "INTERMEDIATE",
    strand: "python",
    starter: "import argparse, json\n# TODO\n",
    xp: 50,
    weekKey: thisWeekKey,
    published: true,
    createdBy: admin!.id,
  });

  // MONTHLY
  await ch({
    id: "ch-monthly-ai-1",
    kind: "CODING",
    title: "Monthly: Ship an AI Agent",
    prompt: "Build and deploy an autonomous agent that can research a topic and write a 500-word report with citations.",
    cadence: "MONTHLY",
    difficulty: "ADVANCED",
    strand: "ai-agents",
    starter: "# Your agent will:\n# 1. Search web for topic\n# 2. Extract key facts\n# 3. Write report with citations\n# 4. Save as .md\n",
    xp: 200,
    monthKey: thisMonthKey,
    published: true,
    createdBy: admin!.id,
  });

  console.log("✓ challenges seeded");

  // --- Badges ---
  const Badges = [
    { slug: "first-steps", name: "First Steps", icon: "🌱", description: "Complete your first lesson", xpBonus: 10 },
    { slug: "streak-3", name: "3-Day Streak", icon: "🔥", description: "Log in 3 days in a row", xpBonus: 15 },
    { slug: "streak-7", name: "Week Warrior", icon: "🔥🔥", description: "Log in 7 days straight", xpBonus: 50 },
    { slug: "quiz-ace", name: "Quiz Ace", icon: "🧠", description: "Score 100% on 5 quizzes", xpBonus: 20 },
    { slug: "code-runner", name: "Code Runner", icon: "💻", description: "Submit 10 coding challenges", xpBonus: 30 },
    { slug: "agent-builder", name: "Agent Builder", icon: "🤖", description: "Complete the AI Agent roadmap", xpBonus: 100 },
    { slug: "prompt-pro", name: "Prompt Pro", icon: "✨", description: "Win 3 prompt engineering challenges", xpBonus: 40 },
    { slug: "math-master", name: "Math Master", icon: "📐", description: "Complete Math IX–X roadmap", xpBonus: 60 },
    { slug: "early-bird", name: "Early Bird", icon: "🌅", description: "Complete a daily challenge before 9 AM", xpBonus: 10 },
  ];
  for (const b of Badges) {
    await prisma.badge.upsert({ where: { slug: b.slug }, update: b, create: b });
  }
  console.log("✓ badges seeded");

  // --- Certificates (award to student for demo) ---
  await prisma.certificate.upsert({
    where: { userId_slug: { userId: student!.id, slug: "math-ix-completion" } },
    update: {},
    create: { userId: student!.id, slug: "math-ix-completion", title: "Mathematics IX Completion", issuer: "Tuiton Academy", certificationType: "FREE", credentialId: "cred-math-ix-001" },
  });
  await prisma.certificate.upsert({
    where: { userId_slug: { userId: student!.id, slug: "ai-foundations" } },
    update: {},
    create: { userId: student!.id, slug: "ai-foundations", title: "AI Foundations Certificate", issuer: "Tuiton Academy", certificationType: "FREE", credentialId: "cred-ai-foundations-001" },
  });
  console.log("✓ certificates seeded");

  // =====================================================================
  // PHASE 5: PORTFOLIO / COMMUNITY
  // =====================================================================
  await prisma.project.upsert({
    where: { id: "proj-1" },
    update: {},
    create: {
      id: "proj-1",
      userId: student!.id,
      title: "FizzBuzz AI Agent",
      summary: "An agent that writes FizzBuzz in any language you ask for — with tests!",
      type: "ai-agent",
      link: "https://github.com/demo/fizzbuzz-agent",
      pinned: true,
      tags: JSON.stringify(["fizzbuzz", "ai", "agent", "automation"]),
      difficulty: "INTERMEDIATE",
    },
  });
  await prisma.project.upsert({
    where: { id: "proj-2" },
    update: {},
    create: {
      id: "proj-2",
      userId: student!.id,
      title: "Quadratic Solver Web App",
      summary: "Step-by-step quadratic equation solver with graph visualization",
      type: "coding",
      link: "https://quadratic-solver.vercel.app",
      pinned: true,
      tags: JSON.stringify(["quadratic", "math", "web", "app"]),
      difficulty: "BEGINNER",
    },
  });
  await prisma.project.upsert({
    where: { id: "proj-3" },
    update: {},
    create: {
      id: "proj-3",
      userId: student!.id,
      title: "RAG over NCERT Science",
      summary: "Ask any Class 9/10 science question — the agent retrieves & explains",
      type: "ai-agent",
      link: "https://github.com/demo/ncert-rag",
      pinned: true,
      tags: JSON.stringify(["rag", "science", "ncert", "qa"]),
      difficulty: "INTERMEDIATE",
    },
  });
  console.log("✓ projects seeded");

  // Forum topics
  await prisma.forumTopic.upsert({
    where: { id: "topic-1" },
    update: {},
    create: {
      id: "topic-1",
      userId: admin!.id,
      title: "Welcome to Tuiton — introduce yourself!",
      body: "Hi everyone! Shivani here. Tell us your grade, interests, and what you want to build.",
      tag: "general",
      tags: JSON.stringify(["introduce", "welcome", "general"]),
    },
  });
  await prisma.forumTopic.upsert({
    where: { id: "topic-2" },
    update: {},
    create: {
      id: "topic-2",
      userId: student!.id,
      title: "Best way to learn Python for AI?",
      body: "I know basics. What's the path to building agents?",
      tag: "help",
      tags: JSON.stringify(["python", "ai", "learning", "path"]),
    },
  });
  console.log("✓ forum topics seeded");

  // Notifications for student
  for (const n of [
    { title: "Welcome to Tuiton!", body: "Start with a daily challenge or join a live class.", href: "/dashboard", type: "system" },
    { title: "New AI Agent roadmap live", body: "Build autonomous agents — 4 modules, 12 lessons.", href: "/roadmaps/ai-agents-building", type: "course" },
    { title: "Your certificate is ready", body: "AI Foundations Certificate earned!", href: "/profile", type: "certification" },
  ]) {
    await prisma.notification.create({ data: { userId: student!.id, ...n } });
  }
  console.log("✓ notifications seeded");

  // Support request
  await prisma.supportRequest.upsert({
    where: { id: "req-1" },
    update: {},
    create: {
      id: "req-1",
      userId: student!.id,
      category: "content",
      message: "Can you add more Olympiad-level math problems?",
      status: "OPEN",
    },
  });
  console.log("✓ support request seeded");

  console.log("\n=== Seed complete ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());