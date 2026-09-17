import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, ArrowLeft, Music, Loader2, Sparkles, MessageSquare, Layers, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import PortfolioGenerator from "@/components/portfolio/PortfolioGenerator";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `/api/design-chat`; // Need to proxy this

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ error: "Connection failed" }));
    onError(body.error || "Something went wrong");
    return;
  }

  if (!resp.body) {
    onError("No response stream");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

const BuildPage = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const initialTab = searchParams.get("tab");
  const [activeMode, setActiveMode] = useState<"portfolio" | "ai">(
    initialTab === "ai" ? "ai" : "portfolio"
  );

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleModeChange = (mode: "portfolio" | "ai") => {
    setActiveMode(mode);
    setSearchParams(mode === "ai" ? { tab: "ai" } : {});
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && user) {
      const pendingPrompt = localStorage.getItem("pending_prompt");
      if (pendingPrompt && !started && !isLoading && messages.length === 0) {
        localStorage.removeItem("pending_prompt");
        setActiveMode("ai");
        setStarted(true);
        setIsLoading(true);

        const userMsg: Msg = { role: "user", content: pendingPrompt };
        setMessages([userMsg]);

        let assistantSoFar = "";
        const upsertAssistant = (chunk: string) => {
          assistantSoFar += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
            }
            return [...prev, { role: "assistant", content: assistantSoFar }];
          });
        };

        streamChat({
          messages: [userMsg],
          onDelta: upsertAssistant,
          onDone: () => {
            setIsLoading(false);
            inputRef.current?.focus();
          },
          onError: (err) => {
            setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, something went wrong: ${err}` }]);
            setIsLoading(false);
          },
        });
      }
    }
  }, [user, authLoading, started, isLoading, messages.length]);

  const handleLetsGo = async (summary: string) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "sites"), {
        user_id: user.uid,
        design_summary: summary,
        status: "draft",
      });

      toast({
        title: "Success!",
        description: "Your site plan has been saved to your dashboard.",
      });
      
      navigate("/");
    } catch (error: unknown) {
      toast({
        title: "Error saving site",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const startConversation = async () => {
    setStarted(true);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: [],
      onDelta: upsertAssistant,
      onDone: () => {
        setIsLoading(false);
        inputRef.current?.focus();
      },
      onError: (err) => {
        setMessages([{ role: "assistant", content: `Sorry, something went wrong: ${err}` }]);
        setIsLoading(false);
      },
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: updatedMessages,
      onDelta: upsertAssistant,
      onDone: () => {
        setIsLoading(false);
        inputRef.current?.focus();
      },
      onError: (err) => {
        setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, something went wrong: ${err}` }]);
        setIsLoading(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-glass-border px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src="/logo.png" alt="A List Webs" className="w-7 h-7 object-contain" referrerPolicy="no-referrer" />
            <span className="font-display font-semibold text-gold text-sm sm:text-base">Design Studio</span>
          </div>

          <span className="sm:hidden text-[10px] font-mono uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
            {activeMode === "portfolio" ? "Portfolio" : "AI Studio"}
          </span>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-zinc-900/90 p-1 rounded-2xl border border-white/10 shadow-inner w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => handleModeChange("portfolio")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeMode === "portfolio"
                ? "bg-gold text-white shadow-md shadow-gold/25 font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portfolio Generator</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeMode === "portfolio" ? "bg-black/25 text-white" : "bg-gold/20 text-gold"}`}>
              SEO
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("ai")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeMode === "ai"
                ? "bg-white text-black shadow-md font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Design Studio</span>
          </button>
        </div>

        {/* User & Log Out */}
        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden lg:inline text-xs text-muted-foreground font-mono truncate max-w-[150px] bg-white/5 border border-white/10 px-2 py-1 rounded-md" title={user.email || ""}>
              {user.email}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await signOut();
                toast({
                  title: "Signed out",
                  description: "You have been logged out successfully.",
                });
                navigate("/");
              } catch (e) {
                console.error("Sign out error", e);
              }
            }}
            className="text-xs h-8 px-2.5 text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 gap-1.5 transition-colors font-medium rounded-lg"
            title="Log out of your account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </Button>
        </div>
      </header>

      {activeMode === "portfolio" ? (
        <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <PortfolioGenerator />
        </div>
      ) : (
        <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
          {!started ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-lg"
              >
                <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
                  <Music className="w-10 h-10 text-gold" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Let's design your <span className="text-gold">band's site</span>
                </h1>
                <p className="text-muted-foreground text-lg mb-8">
                  I'll ask you a few questions about your music, style, and what features you need. 
                  Then I'll put together a design plan for your approval before we build anything.
                </p>
                <Button variant="hero" size="xl" onClick={startConversation} className="group">
                  Start Designing
                  <Music className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>
              </motion.div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                        msg.role === "user"
                          ? "bg-primary/15 border border-primary/20 text-foreground"
                          : "bg-card border border-glass-border"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_h1]:text-gold [&_h2]:text-gold [&_h3]:text-gold [&_strong]:text-gold [&_li]:text-muted-foreground">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                          {msg.content.includes("Let's go!") && (
                            <Button 
                              className="mt-4 w-full"
                              onClick={() => handleLetsGo(msg.content)}
                              disabled={isSaving}
                            >
                              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              Let's build my site!
                            </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-glass-border rounded-2xl px-5 py-3.5 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gold" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-glass-border p-4">
                <div className="flex items-center gap-3 max-w-3xl mx-auto">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 bg-secondary border border-glass-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-50"
                  />
                  <Button
                    variant="hero"
                    size="icon"
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="h-11 w-11 rounded-xl shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BuildPage;
