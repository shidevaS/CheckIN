"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Badge,
  Avatar,
  AvatarFallback,
  Separator,
} from "@/components/ui";
import Link from "next/link";

interface Topic {
  id: string;
  title: string;
  body: string;
  tag: string;
  createdAt: string;
  user: { id: string; name: string };
  _count: { comments: number };
  comments?: any[];
}

interface CommunityClientProps {
  initialTopics: Topic[];
  sessionUser: { id: string; name: string; role: string };
}

const TAGS = [
  { key: "general", label: "General", color: "neutral" },
  { key: "help", label: "Help", color: "teal" },
  { key: "showcase", label: "Showcase", color: "gold" },
  { key: "roadmaps", label: "Roadmaps", color: "teal" },
  { key: "challenges", label: "Challenges", color: "gold" },
  { key: "live-classes", label: "Live Classes", color: "neutral" },
  { key: "ai-agents", label: "AI Agents", color: "gold" },
  { key: "announcements", label: "Announcements", color: "teal" },
];

export default function CommunityClient({ initialTopics, sessionUser }: CommunityClientProps) {
  const [topics, setTopics] = useState(initialTopics);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: "", body: "", tag: "general" });
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleCreateTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.body.trim()) return;
    setLoading("create");
    try {
      const res = await fetch("/api/community/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTopic),
      });
      if (res.ok) {
        const topic = await res.json();
        setTopics((prev) => [topic, ...prev]);
        setShowNewTopic(false);
        setNewTopic({ title: "", body: "", tag: "general" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const handleAddComment = async (topicId: string, body: string) => {
    if (!body.trim()) return;
    setLoading(topicId);
    try {
      const res = await fetch(`/api/community/topics/${topicId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        const comment = await res.json();
        setTopics((prev) =>
          prev.map((t) =>
            t.id === topicId
              ? { ...t, _count: { comments: t._count.comments + 1 }, comments: [...(t.comments || []), comment] }
              : t
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const getTagInfo = (tag: string) => TAGS.find((t) => t.key === tag) || TAGS[0];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Community Forum</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Connect with fellow learners, ask questions, share projects, and discuss roadmaps.
        </p>
      </header>

      {/* New Topic Form */}
      {showNewTopic && (
        <Card className="border-[rgb(var(--primary))/0.5]">
          <CardHeader>
            <CardTitle className="font-serif text-lg">New Discussion</CardTitle>
            <CardDescription>Start a conversation with the community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                placeholder="What's on your mind?"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tag</label>
              <select
                value={newTopic.tag}
                onChange={(e) => setNewTopic({ ...newTopic, tag: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                {TAGS.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Content</label>
              <Textarea
                value={newTopic.body}
                onChange={(e) => setNewTopic({ ...newTopic, body: e.target.value })}
                placeholder="Share your question, project, or thoughts..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateTopic} disabled={loading === "create"}>
                {loading === "create" ? "Posting..." : "Post Discussion"}
              </Button>
              <Button variant="outline" onClick={() => setShowNewTopic(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-semibold">Discussions</h2>
        <Button onClick={() => setShowNewTopic(true)}>+ New Discussion</Button>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {topics.map((topic) => {
          const tag = getTagInfo(topic.tag);
          const isExpanded = expandedTopic === topic.id;
          return (
            <Card key={topic.id} className={isExpanded ? "border-[rgb(var(--primary))/0.5]" : ""}>
              <CardContent className="pt-5 pb-0">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm font-bold" style={{ backgroundColor: `hsl(${topic.user.id.charCodeAt(0) * 10 % 360}, 70%, 50%)` }}>
                      {topic.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{topic.title}</h3>
                      <Badge tone={tag.color as any} variant="outline">{tag.label}</Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 line-clamp-2">{topic.body}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>{topic.user.name}</span>
                      <span>·</span>
                      <time>{new Date(topic.createdAt).toLocaleDateString()}</time>
                      <span>·</span>
                      <span>💬 {topic._count.comments} comments</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}>
                    {isExpanded ? "⌃" : "⌄"}
                  </Button>
                </div>

                {/* Comments Section */}
                {isExpanded && (
                  <div className="mt-4 border-t border-border/50 pt-4">
                    <CommentsSection topicId={topic.id} parentTopics={topics} onAddComment={handleAddComment} sessionUser={sessionUser} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {topics.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
            <p className="text-muted-foreground mb-4">No discussions yet. Be the first to start one!</p>
            <Button onClick={() => setShowNewTopic(true)}>+ Start a Discussion</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentsSection({
  topicId,
  parentTopics,
  onAddComment,
  sessionUser,
}: {
  topicId: string;
  parentTopics: any[];
  onAddComment: (topicId: string, body: string) => void;
  sessionUser: { id: string; name: string; role: string };
}) {
  const topic = parentTopics.find((t) => t.id === topicId);
  const comments = topic?.comments || [];
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddComment(topicId, newComment);
    setNewComment("");
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Comments ({comments.length})</h4>
      {comments.map((comment: any) => (
        <div key={comment.id} className="flex gap-3 pl-10">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-bold" style={{ backgroundColor: `hsl(${comment.user.id.charCodeAt(0) * 10 % 360}, 70%, 50%)` }}>
              {comment.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.user.name}</span>
              {comment.user.id === sessionUser.id && <Badge tone="gold" variant="outline" className="text-xs">You</Badge>}
              <time className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</time>
            </div>
            <p className="text-sm mt-1">{comment.body}</p>
          </div>
        </div>
      ))}
      <form onSubmit={handleSubmit} className="flex gap-2 pl-10">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs font-bold" style={{ backgroundColor: `hsl(${sessionUser.id.charCodeAt(0) * 10 % 360}, 70%, 50%)` }}>
            {sessionUser.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !newComment.trim()} size="sm">
            {loading ? "Posting..." : "Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
}