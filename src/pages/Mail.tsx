import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Contact, Site, Mailbox, MailMessage } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Send,
  Inbox,
  Star,
  Trash2,
  FileText,
  Plus,
  Search,
  RefreshCw,
  ShieldCheck,
  Globe,
  Sparkles,
  Lock,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { MailUpsellBanner } from "@/components/mail/MailUpsellBanner";
import { MailComposeModal } from "@/components/mail/MailComposeModal";
import { MailSimulateModal } from "@/components/mail/MailSimulateModal";
import { MailDnsModal } from "@/components/mail/MailDnsModal";
import { MailMessageView } from "@/components/mail/MailMessageView";
import { AddMailboxModal } from "@/components/mail/AddMailboxModal";

const MailPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Sites & Domain State
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>(searchParams.get("domain") || "");
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Mailboxes & Messages State
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [selectedMailboxId, setSelectedMailboxId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<"inbox" | "starred" | "sent" | "drafts" | "trash">("inbox");
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Loading States
  const [loadingMailboxes, setLoadingMailboxes] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [isDnsOpen, setIsDnsOpen] = useState(false);
  const [isAddMailboxOpen, setIsAddMailboxOpen] = useState(false);

  // Composer Reply Initial State
  const [replyInitialData, setReplyInitialData] = useState<{
    to?: string;
    subject?: string;
    body?: string;
  }>({});

  // Mobile sidebar toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Fetch user sites to determine available sovereign domains
  useEffect(() => {
    const fetchSites = async () => {
      if (!user) {
        // Fallback default domain if not signed in
        if (!selectedDomain) setSelectedDomain("alistwebs.com");
        return;
      }

      try {
        const q = query(collection(db, "sites"), where("user_id", "==", user.uid));
        const snapshot = await getDocs(q);
        const sitesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Site));
        setSites(sitesData);

        // Auto-select domain from search param, custom domain, or site domain
        if (!selectedDomain) {
          const firstCustom = sitesData.find((s) => s.custom_domain)?.custom_domain;
          const firstDomain = sitesData.find((s) => s.domain)?.domain;
          const userSlug = user.email ? user.email.split("@")[0] : "artist";
          setSelectedDomain(firstCustom || firstDomain || `${userSlug}.alistwebs.com`);
        }
      } catch (err) {
        console.warn("Could not fetch user sites:", err);
        if (!selectedDomain) setSelectedDomain("alistwebs.com");
      }
    };

    fetchSites();
  }, [user, selectedDomain]);

  // 2. Fetch contacts for quick address autofill
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "contacts"), where("user_id", "==", user.uid));
        const snapshot = await getDocs(q);
        setContacts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Contact)));
      } catch (err) {
        console.warn("Could not fetch contacts:", err);
      }
    };
    fetchContacts();
  }, [user]);

  // 3. Fetch mailboxes for the current domain
  const fetchMailboxes = useCallback(async () => {
    if (!selectedDomain) return;
    setLoadingMailboxes(true);
    try {
      const res = await fetch(
        `/api/mail/mailboxes?domain=${encodeURIComponent(selectedDomain)}&userId=${encodeURIComponent(
          user?.uid || "user_default"
        )}`
      );
      if (res.ok) {
        const data = await res.json();
        setMailboxes(data.mailboxes || []);
      }
    } catch (err) {
      console.error("Error fetching mailboxes:", err);
    } finally {
      setLoadingMailboxes(false);
    }
  }, [selectedDomain, user?.uid]);

  useEffect(() => {
    fetchMailboxes();
  }, [fetchMailboxes]);

  // 4. Fetch messages based on domain, folder, and mailbox
  const fetchMessages = useCallback(async () => {
    if (!selectedDomain) return;
    setLoadingMessages(true);
    try {
      let url = `/api/mail/messages?domain=${encodeURIComponent(selectedDomain)}&folder=${activeFolder}&userId=${encodeURIComponent(
        user?.uid || "user_default"
      )}`;
      if (selectedMailboxId) {
        url += `&mailboxId=${encodeURIComponent(selectedMailboxId)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
      setIsRefreshing(false);
    }
  }, [selectedDomain, activeFolder, selectedMailboxId, user?.uid]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchMailboxes(), fetchMessages()]);
    toast.success("Mailboxes and inboxes synchronized");
  };

  // Filter messages by search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(
      (m) =>
        m.subject.toLowerCase().includes(q) ||
        m.from.toLowerCase().includes(q) ||
        m.fromName.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  // Currently selected message object
  const activeMessage = useMemo(() => {
    return messages.find((m) => m.id === selectedMessageId) || null;
  }, [messages, selectedMessageId]);

  // Message Actions
  const handleToggleStar = async (msg: MailMessage) => {
    try {
      const nextStar = !msg.isStarred;
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isStarred: nextStar } : m)));

      await fetch(`/api/mail/messages/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: nextStar }),
      });
    } catch (err) {
      console.error("Error starring message:", err);
    }
  };

  const handleToggleRead = async (msg: MailMessage) => {
    try {
      const nextRead = !msg.isRead;
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead: nextRead } : m)));

      await fetch(`/api/mail/messages/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: nextRead }),
      });
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      if (selectedMessageId === messageId) setSelectedMessageId(null);

      await fetch(`/api/mail/messages/${messageId}`, {
        method: "DELETE",
      });
      toast.success("Message moved to trash");
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error("Failed to delete message");
    }
  };

  // Reply handler: open compose modal pre-populated
  const handleReply = (msg: MailMessage) => {
    setReplyInitialData({
      to: msg.from,
      subject: msg.subject.startsWith("Re:") ? msg.subject : `Re: ${msg.subject}`,
      body: `\n\n--- On ${new Date(msg.createdAt).toLocaleString()}, ${msg.fromName || msg.from} wrote:\n> ${msg.body.replace(
        /\n/g,
        "\n> "
      )}`,
    });
    setIsComposeOpen(true);
  };

  // Open fresh composer
  const handleOpenNewCompose = () => {
    setReplyInitialData({});
    setIsComposeOpen(true);
  };

  // Check if checkout success parameter is present
  useEffect(() => {
    if (searchParams.get("checkout_success") === "true") {
      toast.success("Welcome to Alist Mail Sovereign Suite! Your inboxes are active.");
      setSearchParams((params) => {
        params.delete("checkout_success");
        return params;
      });
    }
  }, [searchParams, setSearchParams]);

  // Unread badge count
  const unreadCount = useMemo(() => {
    return messages.filter((m) => !m.isRead && m.folder === "inbox").length;
  }, [messages]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="flex-1 container px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-12 max-w-7xl mx-auto flex flex-col">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black/50 border border-gold/40 p-1 flex items-center justify-center shadow-lg shadow-gold/10">
              <img src="/logo.png" alt="Alist Mail" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
                  Alist Mail
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] font-mono font-bold uppercase tracking-wider border border-gold/30">
                  Sovereign Webmail
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Official inboxes, routing & deliverability for your sovereign brand.
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/signup?domain=${encodeURIComponent(selectedDomain)}`)}
              className="text-xs h-9 border-gold/40 text-gold hover:bg-gold/10"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold" />
              Domain Setup Wizard
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDnsOpen(true)}
              className="text-xs h-9 border-glass-border hover:border-emerald-500/40 text-muted-foreground hover:text-emerald-400"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              DNS & Deliverability
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSimulateOpen(true)}
              className="text-xs h-9 border-glass-border hover:border-gold/40 text-muted-foreground hover:text-gold"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-gold" />
              Simulate Inbound Mail
            </Button>

            <Button
              size="sm"
              onClick={handleOpenNewCompose}
              className="bg-gold hover:bg-gold/90 text-black font-semibold text-xs h-9 shadow-md shadow-gold/15"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Compose Email
            </Button>
          </div>
        </div>

        {/* Alist Mail Upsell Banner */}
        <MailUpsellBanner
          currentDomain={selectedDomain}
          hasActiveSubscription={Boolean(userProfile?.hasMailAccess || userProfile?.subscriptionTier === "yearly")}
          onUpgradeSuccess={() => {
            fetchMailboxes();
            fetchMessages();
          }}
        />

        {/* Main Sovereign Webmail Application Window */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px] bg-card/60 backdrop-blur border border-glass-border rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden">
          {/* LEFT SIDEBAR: Domain Selector, Folders, and Mailbox Desks */}
          <div className="lg:col-span-3 flex flex-col space-y-6 border-b lg:border-b-0 lg:border-r border-glass-border pb-6 lg:pb-0 lg:pr-6">
            {/* Domain Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Active Domain</span>
                <Globe className="w-3.5 h-3.5 text-gold" />
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => {
                  setSelectedDomain(e.target.value);
                  setSelectedMailboxId(null);
                  setSelectedMessageId(null);
                }}
                className="w-full bg-background border border-glass-border rounded-xl px-3 py-2 text-xs font-mono font-semibold text-foreground focus:outline-none focus:border-gold/60"
              >
                {sites.map((s) => {
                  const dom = s.custom_domain || s.domain;
                  if (!dom) return null;
                  return (
                    <option key={s.id} value={dom}>
                      @{dom} ({s.name || "Site"})
                    </option>
                  );
                })}
                {/* Always provide fallback options */}
                <option value="alistwebs.com">@alistwebs.com (Apex Platform)</option>
                {user?.email && (
                  <option value={`${user.email.split("@")[0]}.alistwebs.com`}>
                    @{user.email.split("@")[0]}.alistwebs.com
                  </option>
                )}
              </select>
            </div>

            {/* Folders Navigation */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-2">Folders</span>

              <button
                onClick={() => {
                  setActiveFolder("inbox");
                  setSelectedMailboxId(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeFolder === "inbox" && !selectedMailboxId
                    ? "bg-gold/15 text-gold font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4" />
                  <span>Inbox</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-gold text-black font-mono font-bold text-[10px]">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveFolder("starred");
                  setSelectedMailboxId(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeFolder === "starred"
                    ? "bg-gold/15 text-gold font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4" />
                  <span>Starred</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveFolder("sent");
                  setSelectedMailboxId(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeFolder === "sent"
                    ? "bg-gold/15 text-gold font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4" />
                  <span>Sent</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveFolder("drafts");
                  setSelectedMailboxId(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeFolder === "drafts"
                    ? "bg-gold/15 text-gold font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Drafts</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveFolder("trash");
                  setSelectedMailboxId(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeFolder === "trash"
                    ? "bg-gold/15 text-gold font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4" />
                  <span>Trash</span>
                </div>
              </button>
            </div>

            {/* Mailbox Desks on this Domain */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Domain Desks</span>
                <button
                  onClick={() => setIsAddMailboxOpen(true)}
                  className="text-gold hover:text-gold/80 transition-colors p-1"
                  title="Add custom mailbox"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {mailboxes.map((mb) => {
                  const isSelected = selectedMailboxId === mb.id;
                  return (
                    <button
                      key={mb.id}
                      onClick={() => {
                        setSelectedMailboxId(isSelected ? null : mb.id);
                        setActiveFolder("inbox");
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col gap-0.5 ${
                        isSelected
                          ? "bg-gold/15 border border-gold/40 text-gold shadow-sm"
                          : "bg-background/40 hover:bg-background/80 border border-transparent hover:border-glass-border text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-foreground truncate">{mb.address}</span>
                        {mb.unreadCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate">{mb.displayName}</span>
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddMailboxOpen(true)}
                className="w-full text-xs border-dashed border-glass-border hover:border-gold/50 text-muted-foreground hover:text-foreground mt-2"
              >
                <Plus className="w-3.5 h-3.5 mr-1 text-gold" />
                Add Domain Address
              </Button>
            </div>

            {/* Storage Quota Indicator */}
            <div className="p-3 rounded-2xl bg-background/50 border border-glass-border text-xs space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span>Storage Quota</span>
                <span className="text-gold font-semibold">25 GB Sovereign</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gold rounded-full w-[8%]" />
              </div>
              <p className="text-[10px] text-muted-foreground font-mono">12.4 MB of 25.0 GB used (0.05%)</p>
            </div>
          </div>

          {/* MIDDLE PANE: Message List */}
          <div
            className={`flex flex-col space-y-4 ${
              selectedMessageId ? "hidden lg:flex lg:col-span-4" : "col-span-1 lg:col-span-4"
            } border-b lg:border-b-0 lg:border-r border-glass-border pb-6 lg:pb-0 lg:pr-4`}
          >
            {/* Search and Refresh Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs bg-background border-glass-border h-9 rounded-xl focus:border-gold/60"
                />
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-9 w-9 p-0 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground shrink-0"
                title="Refresh messages"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {/* Active Filter Header */}
            <div className="flex items-center justify-between px-1 text-xs text-muted-foreground font-mono">
              <span className="capitalize">
                {selectedMailboxId
                  ? mailboxes.find((m) => m.id === selectedMailboxId)?.address
                  : `${activeFolder} (${filteredMessages.length})`}
              </span>
              <span className="text-[10px] text-gold font-mono">TLS 1.3 Verified</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[400px]">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-2 text-muted-foreground text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-gold" />
                  <span>Loading messages...</span>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-20 px-4 rounded-2xl bg-background/30 border border-dashed border-glass-border space-y-3">
                  <Mail className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <div className="text-xs font-semibold text-foreground">No Messages in {activeFolder}</div>
                  <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                    Try simulating an incoming booking offer or composing a new email from your domain.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsSimulateOpen(true)}
                    className="text-xs border-glass-border hover:border-gold/40 text-gold"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Simulate Inbound Email
                  </Button>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isSelected = selectedMessageId === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => {
                        setSelectedMessageId(msg.id);
                        if (!msg.isRead) handleToggleRead(msg);
                      }}
                      className={`cursor-pointer p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                        isSelected
                          ? "bg-gold/15 border-gold/60 shadow-md shadow-gold/5"
                          : !msg.isRead
                          ? "bg-background border-glass-border hover:border-white/30 font-semibold"
                          : "bg-background/40 border-glass-border/60 hover:border-glass-border text-muted-foreground opacity-90"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {!msg.isRead && <span className="w-2 h-2 rounded-full bg-gold shrink-0" />}
                          <span
                            className={`text-xs truncate ${
                              !msg.isRead ? "text-foreground font-semibold" : "text-foreground/80 font-medium"
                            }`}
                          >
                            {msg.fromName || msg.from}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          {new Date(msg.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="text-xs text-foreground truncate font-medium">{msg.subject}</div>

                      <div className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {msg.body}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-muted-foreground">
                        <span className="truncate">To: {msg.to}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(msg);
                          }}
                          className="hover:text-gold transition-colors p-0.5"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${msg.isStarred ? "text-gold fill-gold" : "text-muted-foreground/60"}`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANE: Message Detail View OR Empty Placeholder */}
          <div
            className={`flex-1 ${
              selectedMessageId ? "col-span-1 lg:col-span-5" : "hidden lg:flex lg:col-span-5"
            } flex flex-col`}
          >
            {activeMessage ? (
              <MailMessageView
                message={activeMessage}
                onBack={() => setSelectedMessageId(null)}
                onReply={handleReply}
                onToggleStar={handleToggleStar}
                onToggleRead={handleToggleRead}
                onDelete={handleDeleteMessage}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-background/20 rounded-3xl border border-dashed border-glass-border space-y-4">
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                  <Mail className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">Select an Email to Read</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Read sovereign inbound messages, inspect cryptographic DKIM headers, and reply directly from your domain.
                  </p>
                </div>
                <Button
                  onClick={handleOpenNewCompose}
                  size="sm"
                  className="bg-gold hover:bg-gold/90 text-black font-semibold text-xs"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Compose Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODALS */}
      <MailComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        mailboxes={mailboxes}
        contacts={contacts}
        domain={selectedDomain}
        userId={user?.uid}
        onMailSent={fetchMessages}
        initialTo={replyInitialData.to}
        initialSubject={replyInitialData.subject}
        initialBody={replyInitialData.body}
      />

      <MailSimulateModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        mailboxes={mailboxes}
        domain={selectedDomain}
        userId={user?.uid}
        onInboundReceived={fetchMessages}
      />

      <MailDnsModal isOpen={isDnsOpen} onClose={() => setIsDnsOpen(false)} domain={selectedDomain} />

      <AddMailboxModal
        isOpen={isAddMailboxOpen}
        onClose={() => setIsAddMailboxOpen(false)}
        domain={selectedDomain}
        userId={user?.uid}
        onMailboxCreated={fetchMailboxes}
      />
    </div>
  );
};

export default MailPage;
