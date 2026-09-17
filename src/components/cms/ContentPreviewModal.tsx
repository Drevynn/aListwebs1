import React from "react";
import { ContentItem } from "@/types/cms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  Eye,
  Tag,
  ExternalLink,
  MapPin,
  Ticket,
  Video,
  Music,
  Share2,
  Copy,
  Check,
  FileText,
  Megaphone,
  Radio,
  Globe
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

interface ContentPreviewModalProps {
  item: ContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (item: ContentItem) => void;
}

export default function ContentPreviewModal({
  item,
  open,
  onOpenChange,
  onEdit
}: ContentPreviewModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  if (!item) return null;

  const handleCopyLink = () => {
    const previewUrl = `${window.location.origin}/cms/preview/${item.slug || item.id}`;
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    toast({
      title: "Public Link Copied",
      description: "URL copied to clipboard for sharing.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article": return <FileText className="w-4 h-4 text-emerald-400" />;
      case "announcement": return <Megaphone className="w-4 h-4 text-amber-400" />;
      case "event": return <Radio className="w-4 h-4 text-purple-400" />;
      case "media": return <Music className="w-4 h-4 text-cyan-400" />;
      case "page": return <Globe className="w-4 h-4 text-blue-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-glass-border text-white p-0 sm:rounded-3xl shadow-2xl">
        {/* Header Bar */}
        <div className="p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              {getTypeIcon(item.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider bg-white/5 border-white/10 text-gold">
                  {item.type}
                </Badge>
                <Badge
                  className={`text-[10px] font-mono uppercase ${
                    item.status === "published"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : item.status === "scheduled"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                  }`}
                >
                  {item.status}
                </Badge>
                {item.customFields?.badgeText && (
                  <Badge className="bg-gold/20 text-gold border-gold/40 text-[10px]">
                    {item.customFields.badgeText}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                slug: /{item.slug}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-xs text-slate-200 gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Share URL"}
            </Button>
            {onEdit && (
              <Button
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(item);
                }}
                className="bg-gold hover:bg-gold-light text-black font-semibold text-xs"
              >
                Edit Content
              </Button>
            )}
          </div>
        </div>

        {/* Content Body Preview */}
        <div className="p-6 md:p-10 space-y-8">
          {/* Cover Banner */}
          {item.coverImage && (
            <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-white/10 relative shadow-inner">
              <img
                src={item.coverImage}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs font-mono bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-gold border border-gold/30">
                  {item.category}
                </span>
              </div>
            </div>
          )}

          {/* Article Header */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-bold font-display text-white tracking-tight leading-snug">
              {item.title}
            </h1>

            {item.excerpt && (
              <p className="text-base sm:text-lg text-slate-300 font-serif italic border-l-2 border-gold pl-4 py-1">
                {item.excerpt}
              </p>
            )}

            {/* Author & Meta Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono pt-2 border-y border-white/5 py-3">
              <div className="flex items-center gap-1.5 text-slate-200">
                <User className="w-3.5 h-3.5 text-gold" />
                <span>{item.author || "Anonymous Creator"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {item.publishedAt 
                    ? new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              {item.customFields?.readingTimeMinutes && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.customFields.readingTimeMinutes} min read</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 ml-auto">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>{item.views.toLocaleString()} views</span>
              </div>
            </div>
          </div>

          {/* Event-specific Card */}
          {item.type === "event" && item.customFields && (
            <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-mono uppercase tracking-wider font-semibold">
                  <Radio className="w-4 h-4 animate-pulse text-purple-400" />
                  Live Event Details
                </div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold shrink-0" />
                  {item.customFields.eventVenue || "Venue TBA"} • {item.customFields.eventLocation || "Location TBA"}
                </div>
                {item.customFields.eventDate && (
                  <p className="text-xs text-muted-foreground font-mono">
                    Date: {item.customFields.eventDate}
                  </p>
                )}
              </div>

              {item.customFields.eventTicketUrl && (
                <Button
                  asChild
                  className="bg-gold hover:bg-gold-light text-black font-bold text-xs shrink-0"
                >
                  <a href={item.customFields.eventTicketUrl} target="_blank" rel="noreferrer">
                    <Ticket className="w-4 h-4 mr-1.5" />
                    {item.customFields.ctaText || "Get Tickets"}
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Media Player Embed Preview */}
          {item.type === "media" && item.customFields?.mediaUrl && (
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-300">
                <Video className="w-4 h-4 text-cyan-400" />
                Featured Media Embed ({item.customFields.mediaType || "video"})
              </div>
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10">
                {item.customFields.mediaUrl.includes("youtube.com") || item.customFields.mediaUrl.includes("youtu.be") ? (
                  <iframe
                    src={item.customFields.mediaUrl}
                    title={item.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                    <Music className="w-10 h-10 text-cyan-400" />
                    <p className="text-sm text-white font-medium">Direct Media Stream</p>
                    <p className="text-xs font-mono break-all max-w-md">{item.customFields.mediaUrl}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Markdown Content Render */}
          <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-gold prose-strong:text-white prose-blockquote:border-gold prose-blockquote:text-slate-200">
            <ReactMarkdown>{item.body || "*No content body provided.*"}</ReactMarkdown>
          </div>

          {/* Custom CTA Action button if provided */}
          {item.customFields?.ctaText && item.customFields?.ctaUrl && item.type !== "event" && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-gold/10 via-amber-500/5 to-transparent border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Call to Action</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Explore the linked resource or destination</p>
              </div>
              <Button asChild className="bg-gold hover:bg-gold-light text-black font-semibold text-xs">
                <a href={item.customFields.ctaUrl} target="_blank" rel="noreferrer">
                  {item.customFields.ctaText}
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </a>
              </Button>
            </div>
          )}

          {/* Tags Footer */}
          {item.tags && item.tags.length > 0 && (
            <div className="pt-6 border-t border-white/5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <Tag className="w-3 h-3 text-gold" /> Tags:
              </span>
              {item.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-white/5 border-white/10 text-slate-300">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
