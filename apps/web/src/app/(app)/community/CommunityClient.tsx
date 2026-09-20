"use client";

import { useState } from "react";
import { Button, Input, Textarea, Label, Card, CardContent, CardHeader, CardTitle, Badge, Avatar, AvatarFallback, AvatarImage, Tabs, TabsContent, TabsList, TabsTrigger, Separator, ScrollArea } from "@/components/ui";
import { Send, MessageSquare, Plus, ChevronDown, ChevronUp, Star, Flag, Share2, MoreHorizontal, Edit, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommunityClientProps {
  initialTopics: any[];
  sessionUser: any;
}

interface Topic {
  id: string;
  title: string;
  content: string;
  tag: string;
  createdAt: string;
  likeCount?: number;
  user: { id: string; name: string };
  _count: { comments: number };
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
}

export default function CommunityClient({ initialTopics, sessionUser }: CommunityClientProps) {
  const [activeTab, setActiveTab] = useState("browse");
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [showCreate, setShowCreate] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: "", content: "", tag: "general" });
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const tags = ["general", "questions", "showcase", "help", "announcements", "random"];

  async function handleCreateTopic(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/community/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTopic),
    });
    if (res.ok) {
      const topic = await res.json();
      setTopics([topic, ...topics]);
      setShowCreate(false);
      setNewTopic({ title: "", content: "", tag: "general" });
    }
  }

  async function handleAddComment(topicId: string, content: string) {
    const res = await fetch(`/api/community/topics/${topicId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const comment = await res.json();
      setTopics(topics.map(t => {
        if (t.id === topicId) {
          return { ...t, comments: [...(t.comments || []), comment], _count: { comments: (t._count.comments || 0) + 1 } };
        }
        return t;
      }));
      if (replyingTo === topicId) setNewComment("");
    }
  }

  async function handleLikeTopic(topicId: string) {
    const res = await fetch(`/api/community/topics/${topicId}/like`, { method: "POST" });
    if (res.ok) {
      const updated = await res.json();
      setTopics(topics.map(t => t.id === topicId ? updated : t));
    }
  }

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Community Forum</h1>
          <p className="text-muted-foreground">Ask questions, share projects, and connect with fellow learners.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {/* Create Topic Form */}
      {showCreate && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Create New Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={newTopic.title} onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })} placeholder="How do I center a div?" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tag">Tag</Label>
                <select id="tag" value={newTopic.tag} onChange={(e) => setNewTopic({ ...newTopic, tag: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                  {tags.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" value={newTopic.content} onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })} placeholder="Share your question, project, or thought..." rows={5} required />
              </div>
              <div className="flex gap-3">
                <Button type="submit">Post Topic</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="my-posts">My Posts</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="pt-4">
          <div className="space-y-3">
            {topics.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No topics yet. Be the first to start a discussion!</p>
                </CardContent>
              </Card>
            ) : (
              topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isExpanded={expandedTopic === topic.id}
                  onToggle={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                  onAddComment={handleAddComment}
                  onLike={handleLikeTopic}
                  sessionUser={sessionUser}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  getInitials={getInitials}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-posts" className="pt-4">
          <div className="space-y-3">
            {topics.filter(t => t.user.id === sessionUser.id).map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                isExpanded={expandedTopic === topic.id}
                onToggle={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                onAddComment={handleAddComment}
                onLike={handleLikeTopic}
                sessionUser={sessionUser}
                newComment={newComment}
                setNewComment={setNewComment}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                getInitials={getInitials}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="pt-4">
          <div className="space-y-3">
            {topics
              .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
              .slice(0, 10)
              .map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isExpanded={expandedTopic === topic.id}
                  onToggle={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                  onAddComment={handleAddComment}
                  onLike={handleLikeTopic}
                  sessionUser={sessionUser}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  getInitials={getInitials}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TopicCard({
  topic,
  isExpanded,
  onToggle,
  onAddComment,
  onLike,
  sessionUser,
  newComment,
  setNewComment,
  replyingTo,
  setReplyingTo,
  getInitials,
}: any) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(topic.comments || []);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topic.user.id}`} alt={topic.user.name} />
            <AvatarFallback>{getInitials(topic.user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs capitalize">{topic.tag}</Badge>
              <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}</span>
              <span className="text-xs text-muted-foreground">{topic._count.comments} comments</span>
            </div>
            <h3 className="font-semibold mt-1 cursor-pointer hover:text-[rgb(var(--accent))]" onClick={onToggle}>
              {topic.title}
            </h3>
            {!isExpanded && (
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{topic.content}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onLike(topic.id)}>
              <ThumbsUp className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            <div className="prose prose-sm max-w-none text-muted-foreground">{topic.content}</div>

            <Separator />

            {/* Comments */}
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">Comments ({comments.length})</span>
            </div>

            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 ml-8">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.id}`} alt={comment.user.name} />
                    <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}

              {/* Add Comment Form */}
              <div className="flex gap-3 ml-8">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sessionUser.id}`} alt={sessionUser.name} />
                  <AvatarFallback>{getInitials(sessionUser.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => { onAddComment(topic.id, newComment); }} disabled={!newComment.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}