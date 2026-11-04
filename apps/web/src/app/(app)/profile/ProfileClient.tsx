"use client";

import { useState } from "react";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardHeader, CardTitle, Badge, Input, Textarea, Label, Separator } from "@/components/ui";
import { LogOut, Award, Code, FileText, Star, BookOpen, Flame, TrendingUp, ExternalLink, Plus, Save, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProfileClientProps {
  initialUser: any;
  initialProfile: any;
  initialProjects: any[];
  initialCertificates: any[];
  initialBadges: any[];
  initialEarnedBadges: string[];
  initialSkillsTree: Record<string, number>;
  initialEnrollments: any[];
  initialXpLogs: any[];
  sessionUser: any;
}

export default function ProfileClient({
  initialUser,
  initialProfile,
  initialProjects,
  initialCertificates,
  initialBadges,
  initialEarnedBadges,
  initialSkillsTree,
  initialEnrollments,
  initialXpLogs,
  sessionUser,
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [projects, setProjects] = useState(initialProjects);
  const [certificates, setCertificates] = useState(initialCertificates);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", techStack: "", githubUrl: "", demoUrl: "", imageUrl: "" });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", techStack: "", githubUrl: "", demoUrl: "", imageUrl: "" });

  const xp = initialProfile?.xp ?? 0;
  const level = initialProfile?.level ?? 1;
  const streak = initialProfile?.streak ?? 0;

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/profile/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    });
    if (res.ok) {
      const project = await res.json();
      setProjects([project, ...projects]);
      setShowAddProject(false);
      setNewProject({ title: "", description: "", techStack: "", githubUrl: "", demoUrl: "", imageUrl: "" });
    }
  }

  async function handleUpdateProject(e: React.FormEvent, id: string) {
    e.preventDefault();
    const res = await fetch(`/api/profile/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setProjects(projects.map(p => p.id === id ? updated : p));
      setEditingProjectId(null);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`/api/profile/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects(projects.filter(p => p.id !== id));
    }
  }

  const stats = [
    { label: "XP", value: xp.toLocaleString(), icon: <TrendingUp className="w-5 h-5 text-[rgb(var(--primary))]" /> },
    { label: "Level", value: String(level), icon: <Star className="w-5 h-5 text-yellow-500" /> },
    { label: "Day Streak", value: `${streak} days`, icon: <Flame className="w-5 h-5 text-orange-500" /> },
    { label: "Badges", value: String(initialEarnedBadges.length), icon: <Award className="w-5 h-5 text-[rgb(var(--accent))]" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Profile & Portfolio</h1>
          <p className="text-muted-foreground">Your learning journey, projects, and achievements.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Award className="w-4 h-4" /> {initialEarnedBadges.length} badges
          </span>
          <Button onClick={() => setShowAddProject(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[rgb(var(--primary)/0.1)]">{stat.icon}</div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="skills">Skill Tree</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Roadmaps</CardTitle>
            </CardHeader>
            <CardContent>
              {initialEnrollments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No roadmaps enrolled yet. Browse <a href="/roadmaps" className="text-[rgb(var(--accent))] hover:underline">roadmaps</a> to get started.</p>
              ) : (
                <div className="space-y-3">
                  {initialEnrollments.map((e) => (
                    <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-[rgb(var(--primary))]" />
                        <div>
                          <p className="font-medium">{e.roadmap.title}</p>
                          <p className="text-sm text-muted-foreground">{e.roadmap.description?.substring(0, 80)}...</p>
                        </div>
                      </div>
                      <Badge variant="outline">{Math.round(e.progressPercentage ?? 0)}% complete</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {initialXpLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No activity yet. Complete lessons and challenges to earn XP!</p>
              ) : (
                <div className="space-y-3">
                  {initialXpLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-[rgb(var(--primary)/0.1)]">
                          <TrendingUp className="w-4 h-4 text-[rgb(var(--primary))]" />
                        </div>
                        <div>
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</p>
                        </div>
                      </div>
                      <Badge tone="gold">+{log.amount} XP</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6 pt-4">
          {showAddProject && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Add New Project</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="My Awesome Project" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="What does it do? What did you learn?" rows={3} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="techStack">Tech Stack (comma separated)</Label>
                    <Input id="techStack" value={newProject.techStack} onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })} placeholder="Next.js, TypeScript, Tailwind, Prisma" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="githubUrl">GitHub URL</Label>
                      <Input id="githubUrl" type="url" value={newProject.githubUrl} onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })} placeholder="https://github.com/user/repo" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="demoUrl">Live Demo URL</Label>
                      <Input id="demoUrl" type="url" value={newProject.demoUrl} onChange={(e) => setNewProject({ ...newProject, demoUrl: e.target.value })} placeholder="https://my-project.vercel.app" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input id="imageUrl" type="url" value={newProject.imageUrl} onChange={(e) => setNewProject({ ...newProject, imageUrl: e.target.value })} placeholder="https://example.com/screenshot.png" />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit">Save Project</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddProject(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Projects</CardTitle>
                {!showAddProject && <Button onClick={() => setShowAddProject(true)} className="gap-2"><Plus className="w-4 h-4" /> Add Project</Button>}
              </div>
            </CardHeader>
            <CardContent>
              {projects.length === 0 && !showAddProject ? (
                <p className="text-muted-foreground text-center py-8">No projects yet. Click &#39;Add Project&#39; to showcase your work!</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      {project.imageUrl && (
                        <img src={project.imageUrl} alt={project.title} className="w-full h-40 object-cover" loading="lazy" />
                      )}
                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                        {project.techStack && (
                          <div className="flex flex-wrap gap-1">
                            {project.techStack.split(",").map((t: string) => (
                              <Badge key={t.trim()} variant="outline" className="text-xs">{t.trim()}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                              <Code className="w-4 h-4" /> Code
                            </a>
                          )}
                          {project.demoUrl && (
                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                              <ExternalLink className="w-4 h-4" /> Demo
                            </a>
                          )}
                        </div>
                        {editingProjectId === project.id ? (
                          <form onSubmit={(e) => handleUpdateProject(e, project.id)} className="space-y-2">
                            <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" />
                            <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" rows={2} />
                            <Input value={editForm.techStack} onChange={(e) => setEditForm({ ...editForm, techStack: e.target.value })} placeholder="Tech Stack" />
                            <div className="flex gap-2">
                              <Button type="submit" size="sm">Save</Button>
                              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingProjectId(null)}>Cancel</Button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditForm(project); setEditingProjectId(project.id); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProject(project.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Tree</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(initialSkillsTree).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No skills tracked yet. Complete roadmaps and challenges to unlock skills!</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(initialSkillsTree).map(([skill, level]) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{skill.replace(/-/g, " ")}</span>
                        <Badge variant="outline">Level {level}</Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-[rgb(var(--primary))] rounded-full transition-all" style={{ width: `${Math.min(level * 20, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No certificates yet. Complete monthly capstone challenges to earn them!</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                          <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-semibold">{cert.title}</p>
                          <p className="text-sm text-muted-foreground">{new Date(cert.issuedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{cert.description}</p>
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[rgb(var(--accent))] hover:underline">
                        <ExternalLink className="w-4 h-4" /> View Certificate
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {initialBadges.map((badge) => {
                  const earned = initialEarnedBadges.includes(badge.id);
                  return (
                    <div key={badge.id} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${earned ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.05)]" : "border-border opacity-50"}`}>
                      <div className={`p-2 rounded-full ${earned ? "bg-[rgb(var(--primary))/0.2]" : "bg-muted"}`}>
                        <span className="text-2xl">{badge.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        {earned && <Badge className="mt-1" variant="secondary">Earned</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}