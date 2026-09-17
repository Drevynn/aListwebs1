import React, { useState, useEffect } from "react";
import { ContentItem, ContentType, ContentStatus } from "@/types/cms";
import { CMSService } from "@/lib/cmsService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Megaphone,
  Radio,
  Music,
  Globe,
  Sparkles,
  RefreshCw,
  Eye,
  Edit3,
  Calendar,
  Image as ImageIcon,
  Check,
  Tag,
  Clock,
  Send,
  Save,
  Trash2,
  Bold,
  Italic,
  List,
  Quote,
  Code,
  Link2,
  Heading2,
  Heading3
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

interface ContentEditorDialogProps {
  item: ContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: ContentItem) => Promise<void>;
  userId?: string | null;
}

const COVER_PRESETS = [
  { name: "Analog Console", url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80" },
  { name: "Live Stage Light", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80" },
  { name: "Mountain Arena", url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80" },
  { name: "Modular Synth", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80" },
  { name: "Dark Velvet Room", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80" },
  { name: "Vintage Band EPK", url: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=1200&q=80" },
];

export default function ContentEditorDialog({
  item,
  open,
  onOpenChange,
  onSave,
  userId
}: ContentEditorDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("editor");
  const [editorMode, setEditorMode] = useState<"write" | "preview" | "split">("write");

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<ContentType>("article");
  const [status, setStatus] = useState<ContentStatus>("draft");
  const [category, setCategory] = useState("Music & Gear");
  const [author, setAuthor] = useState("A-List Creator");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [scheduledFor, setScheduledFor] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Custom Fields
  const [badgeText, setBadgeText] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"audio" | "video" | "image" | "document">("video");
  const [mediaUrl, setMediaUrl] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTicketUrl, setEventTicketUrl] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // Sync state when editing item or opening new
  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setSlug(item.slug || "");
      setType(item.type || "article");
      setStatus(item.status || "draft");
      setCategory(item.category || "General");
      setAuthor(item.author || "A-List Creator");
      setExcerpt(item.excerpt || "");
      setBody(item.body || "");
      setCoverImage(item.coverImage || "");
      setTags(item.tags || []);
      setScheduledFor(item.scheduledFor || "");
      setSeoTitle(item.seoTitle || "");
      setSeoDescription(item.seoDescription || "");
      setBadgeText(item.customFields?.badgeText || "");
      setCtaText(item.customFields?.ctaText || "");
      setCtaUrl(item.customFields?.ctaUrl || "");
      setMediaType(item.customFields?.mediaType || "video");
      setMediaUrl(item.customFields?.mediaUrl || "");
      setEventVenue(item.customFields?.eventVenue || "");
      setEventLocation(item.customFields?.eventLocation || "");
      setEventDate(item.customFields?.eventDate || "");
      setEventTicketUrl(item.customFields?.eventTicketUrl || "");
    } else {
      // Default reset for new item
      setTitle("");
      setSlug("");
      setType("article");
      setStatus("draft");
      setCategory("General");
      setAuthor("A-List Creator");
      setExcerpt("");
      setBody("## Your Next Masterpiece\n\nStart typing your content here with rich Markdown support...");
      setCoverImage(COVER_PRESETS[0].url);
      setTags(["Music", "Release"]);
      setScheduledFor("");
      setSeoTitle("");
      setSeoDescription("");
      setBadgeText("");
      setCtaText("");
      setCtaUrl("");
      setMediaType("video");
      setMediaUrl("");
      setEventVenue("");
      setEventLocation("");
      setEventDate("");
      setEventTicketUrl("");
    }
  }, [item, open]);

  // Auto-generate slug if user hasn't typed a custom slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!item) {
      setSlug(CMSService.generateSlug(val));
    }
  };

  const handleRegenerateSlug = () => {
    if (title) {
      setSlug(CMSService.generateSlug(title));
      toast({ title: "Slug Updated", description: "Generated SEO friendly URL slug from title." });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleInsertMarkdown = (syntaxBefore: string, syntaxAfter = "") => {
    setBody(prev => prev + syntaxBefore + " " + syntaxAfter);
  };

  const calculateReadingTime = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const handleSave = async (forceStatus?: ContentStatus) => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your content item.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const finalStatus = forceStatus || status;
      const readingTime = calculateReadingTime(body);
      const finalSlug = slug.trim() || CMSService.generateSlug(title);

      const now = new Date().toISOString();
      const contentToSave: ContentItem = {
        id: item ? item.id : `cms_${type.slice(0, 3)}_${Date.now()}`,
        title: title.trim(),
        slug: finalSlug,
        type,
        status: finalStatus,
        category: category.trim() || "General",
        author: author.trim() || "A-List Creator",
        excerpt: excerpt.trim(),
        body: body.trim(),
        coverImage: coverImage.trim() || undefined,
        tags,
        createdAt: item ? item.createdAt : now,
        updatedAt: now,
        publishedAt: finalStatus === "published" ? (item?.publishedAt || now) : undefined,
        scheduledFor: finalStatus === "scheduled" ? scheduledFor : undefined,
        views: item ? item.views : 0,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        customFields: {
          badgeText: badgeText.trim() || undefined,
          ctaText: ctaText.trim() || undefined,
          ctaUrl: ctaUrl.trim() || undefined,
          mediaType: type === "media" ? mediaType : undefined,
          mediaUrl: type === "media" ? mediaUrl.trim() : undefined,
          eventVenue: type === "event" ? eventVenue.trim() : undefined,
          eventLocation: type === "event" ? eventLocation.trim() : undefined,
          eventDate: type === "event" ? eventDate.trim() : undefined,
          eventTicketUrl: type === "event" ? eventTicketUrl.trim() : undefined,
          readingTimeMinutes: readingTime,
        },
        user_id: userId || undefined
      };

      await onSave(contentToSave);
      toast({
        title: item ? "Content Updated" : "Content Created",
        description: `Successfully saved "${contentToSave.title}" as ${contentToSave.status}.`,
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Save Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const charCount = body.length;
  const estimatedMins = calculateReadingTime(body);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col bg-slate-950 border border-glass-border text-white p-0 sm:rounded-3xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/60 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold font-display text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-gold" />
                {item ? "Edit Content" : "Create New Content"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Author, schedule, and publish multimedia content across your digital monolith.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Select value={type} onValueChange={(val) => setType(val as ContentType)}>
                <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-xs text-gold">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  <SelectItem value="article">Article / Post</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="event">Event / Show</SelectItem>
                  <SelectItem value="media">Media / Video</SelectItem>
                  <SelectItem value="page">Custom Page</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={(val) => setStatus(val as ContentStatus)}>
                <SelectTrigger className="w-[130px] bg-white/5 border-white/10 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-white/10 bg-slate-950/80 shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
              <TabsTrigger value="editor" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black">
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Content & Body
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Type Settings
              </TabsTrigger>
              <TabsTrigger value="media" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black">
                <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                Cover & Tags
              </TabsTrigger>
              <TabsTrigger value="seo" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Publishing & SEO
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "editor" && (
            <div className="space-y-5">
              {/* Title & Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs text-slate-300 font-medium">Content Title *</Label>
                  <Input
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="e.g., Behind the Analog Desk: Crafting Midnight Echoes"
                    className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-medium">Category</Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Studio & Production"
                    className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground text-sm"
                  />
                </div>
              </div>

              {/* Excerpt / Summary */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300 font-medium">Short Excerpt / Teaser</Label>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise 1-2 sentence preview to engage readers in listings and social shares..."
                  rows={2}
                  className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground text-xs resize-none"
                />
              </div>

              {/* Markdown Body Editor Header with Formatting Tools */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInsertMarkdown("## Heading\n")}
                      className="h-7 w-7 p-0 text-slate-300 hover:bg-white/10 hover:text-white"
                      title="Heading"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInsertMarkdown("**Bold text**")}
                      className="h-7 w-7 p-0 text-slate-300 hover:bg-white/10 hover:text-white"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInsertMarkdown("*Italic text*")}
                      className="h-7 w-7 p-0 text-slate-300 hover:bg-white/10 hover:text-white"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInsertMarkdown("- List item\n- List item 2")}
                      className="h-7 w-7 p-0 text-slate-300 hover:bg-white/10 hover:text-white"
                      title="Bullet List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInsertMarkdown("> Quote statement")}
                      className="h-7 w-7 p-0 text-slate-300 hover:bg-white/10 hover:text-white"
                      title="Blockquote"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInsertMarkdown("```typescript\n// code here\n```")}
                      className="h-7 w-7 p-0 text-slate-300 hover:bg-white/10 hover:text-white"
                      title="Code Block"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInsertMarkdown("[Link text](https://example.com)")}
                      className="h-7 w-7 p-0 text-slate-300 hover:bg-white/10 hover:text-white"
                      title="Link"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                    <Button
                      type="button"
                      size="sm"
                      variant={editorMode === "write" ? "secondary" : "ghost"}
                      onClick={() => setEditorMode("write")}
                      className="h-6 px-2 text-[11px]"
                    >
                      Write
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={editorMode === "split" ? "secondary" : "ghost"}
                      onClick={() => setEditorMode("split")}
                      className="h-6 px-2 text-[11px] hidden sm:inline-flex"
                    >
                      Split
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={editorMode === "preview" ? "secondary" : "ghost"}
                      onClick={() => setEditorMode("preview")}
                      className="h-6 px-2 text-[11px]"
                    >
                      Live Preview
                    </Button>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className={`grid ${editorMode === "split" ? "grid-cols-2 gap-4" : "grid-cols-1"}`}>
                  {editorMode !== "preview" && (
                    <div className="space-y-1">
                      <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write your article, release notes, or page story in Markdown..."
                        rows={12}
                        className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground font-mono text-xs leading-relaxed"
                      />
                    </div>
                  )}

                  {(editorMode === "preview" || editorMode === "split") && (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 overflow-y-auto max-h-[300px] prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{body || "*Preview is empty. Start typing to see rendering.*"}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-1">
                  <div className="flex items-center gap-4">
                    <span>{wordCount} words</span>
                    <span>{charCount} characters</span>
                    <span>~{estimatedMins} min read</span>
                  </div>
                  <span className="text-gold">Markdown Active</span>
                </div>
              </div>
            </div>
          )}

          {/* Type Settings Tab */}
          {activeTab === "custom" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <h4 className="text-sm font-bold text-gold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Custom Fields for {type.toUpperCase()}
                </h4>

                {type === "event" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Venue Name</Label>
                      <Input
                        value={eventVenue}
                        onChange={(e) => setEventVenue(e.target.value)}
                        placeholder="e.g., Red Rocks Amphitheatre"
                        className="bg-white/5 border-white/10 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Location (City, State/Country)</Label>
                      <Input
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="e.g., Morrison, CO, USA"
                        className="bg-white/5 border-white/10 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Event Date & Time</Label>
                      <Input
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        placeholder="e.g., Oct 14, 2026 7:30 PM"
                        className="bg-white/5 border-white/10 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Ticket Purchase URL</Label>
                      <Input
                        value={eventTicketUrl}
                        onChange={(e) => setEventTicketUrl(e.target.value)}
                        placeholder="https://tickets.example.com/tour"
                        className="bg-white/5 border-white/10 text-xs"
                      />
                    </div>
                  </div>
                )}

                {type === "media" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Media Format</Label>
                      <Select value={mediaType} onValueChange={(v) => setMediaType(v as "audio" | "video" | "image" | "document")}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          <SelectItem value="video">Video Stream / YouTube</SelectItem>
                          <SelectItem value="audio">Audio Track / Stem</SelectItem>
                          <SelectItem value="image">High-Res Gallery</SelectItem>
                          <SelectItem value="document">Score / PDF Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Media Stream / Embed URL</Label>
                      <Input
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="e.g., https://www.youtube.com/embed/..."
                        className="bg-white/5 border-white/10 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Universal CTA and Badge Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Pill Badge Text</Label>
                    <Input
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="e.g., Staff Pick, Breaking, VIP"
                      className="bg-white/5 border-white/10 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">CTA Button Label</Label>
                    <Input
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g., Get Tickets, Listen Now"
                      className="bg-white/5 border-white/10 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">CTA Destination Link</Label>
                    <Input
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder="https://..."
                      className="bg-white/5 border-white/10 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media & Cover Tab */}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Cover Image */}
              <div className="space-y-3">
                <Label className="text-xs text-slate-300 font-medium">Cover Photo Image URL</Label>
                <Input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-white/5 border-white/10 text-xs"
                />

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-muted-foreground">Quick Studio Presets:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COVER_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCoverImage(preset.url)}
                        className={`text-left p-2 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                          coverImage === preset.url
                            ? "bg-gold/10 border-gold text-gold"
                            : "bg-white/5 border-white/10 hover:border-white/20 text-slate-300"
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-8 h-8 rounded-lg object-cover" />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Box */}
                {coverImage && (
                  <div className="w-full h-40 rounded-xl overflow-hidden border border-white/10 relative mt-2">
                    <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                      <span className="text-xs text-white font-medium">Live Cover Preview</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags Manager */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label className="text-xs text-slate-300 font-medium">Tags & Discovery Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Type tag name and press Add or Enter..."
                    className="bg-white/5 border-white/10 text-xs"
                  />
                  <Button type="button" size="sm" onClick={handleAddTag} className="bg-white/10 hover:bg-white/20 text-xs">
                    Add Tag
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {tags.map((t, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white/5 border-white/10 text-slate-300 text-xs gap-1.5 pl-2.5 pr-1.5 py-1">
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-muted-foreground hover:text-red-400"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Publishing & SEO Tab */}
          {activeTab === "seo" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-medium">Author Byline</Label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g., Elena Vance"
                    className="bg-white/5 border-white/10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-medium">Scheduled Release Date</Label>
                  <Input
                    type="datetime-local"
                    value={scheduledFor ? scheduledFor.slice(0, 16) : ""}
                    onChange={(e) => setScheduledFor(e.target.value ? new Date(e.target.value).toISOString() : "")}
                    className="bg-white/5 border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              {/* Slug with Regenerate button */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-300 font-medium">URL Slug</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerateSlug}
                    className="h-6 text-[11px] text-gold hover:bg-gold/10 gap-1 p-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto from Title
                  </Button>
                </div>
                <div className="flex items-center rounded-md bg-white/5 border border-white/10 px-3">
                  <span className="text-xs text-muted-foreground font-mono">/content/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="url-slug-here"
                    className="bg-transparent border-0 text-xs text-white focus:outline-none w-full py-2 font-mono"
                  />
                </div>
              </div>

              {/* SEO Meta */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-xs font-semibold text-gold uppercase tracking-wider">Search Engine Optimization (SEO)</h4>
                
                <div className="space-y-1.5">
                  <Label className="text-xs">Meta Title</Label>
                  <Input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={title ? `${title} | Sovereign Studio` : "Custom page title for Google & search engines"}
                    className="bg-white/5 border-white/10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Meta Description</Label>
                  <Textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder={excerpt || "Search engine summary (recommended 140-160 characters)..."}
                    rows={2}
                    className="bg-white/5 border-white/10 text-xs resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <DialogFooter className="p-5 border-t border-white/10 bg-slate-900/70 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            Status: <strong className="text-white uppercase">{status}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10 hover:bg-white/10 text-xs"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="bg-white/10 hover:bg-white/20 text-xs gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save as Draft
            </Button>

            <Button
              type="button"
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="bg-gold hover:bg-gold-light text-black font-bold text-xs gap-1.5 shadow-lg shadow-gold/20"
            >
              <Send className="w-3.5 h-3.5" />
              {status === "published" ? "Update & Keep Live" : "Publish Now"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
