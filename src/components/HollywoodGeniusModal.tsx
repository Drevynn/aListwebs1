import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Clapperboard,
  Users,
  Film,
  DollarSign,
  Award,
  Lightbulb,
  Copy,
  Check,
  RefreshCw,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  {
    icon: Users,
    label: "Assemble Complete Crew",
    prompt: "Assemble a complete crew breakdown for an indie feature film ($3M budget), detailing every department from Director, DP, and Gaffer down to Best Boy Electric, Best Boy Grip, Dolly Grip, and Sound Utility.",
  },
  {
    icon: Clapperboard,
    label: "Who's Casting What?",
    prompt: "Who is casting current prestige dramas, sci-fi thrillers, and elevated indies? Give me top CSA casting directors, agency rosters (CAA, WME, UTA), and self-tape requirements.",
  },
  {
    icon: DollarSign,
    label: "2026 Crew Day Rates",
    prompt: "What are standard 2026 IATSE day rates, overtime tiers, and box rental kit fees for Gaffer, Best Boy Electric, Key Grip, and Production Sound Mixer?",
  },
  {
    icon: Film,
    label: "Package A Feature Film",
    prompt: "How do I package an indie feature for financing and festival acquisitions (A24 / Neon style)? Outline director, DP, star attachments, and state film tax credits.",
  },
  {
    icon: Award,
    label: "Festival Deliverables (Sundance / Cannes)",
    prompt: "What are the exact technical deliverables for a Sundance or Cannes premiere? Detail DCP specifications, audio stems, color grading (ACES), and music cue sheets.",
  },
];

interface HollywoodGeniusModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const HollywoodGeniusModal: React.FC<HollywoodGeniusModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `### 🎬 Welcome to the Hollywood Genius AI Studio

I am your veteran packaging executive, Unit Production Manager (UPM), and industry casting insider.

**What would you like to build or discover today?**
- **Complete Crew Assembly**: Every department from Director & DP down to Best Boys, Dolly Grips, and Sound Utilities.
- **Casting Intelligence ("Who's Casting What")**: CSA directories, talent agencies (CAA/WME/UTA), and self-tape standards.
- **Budgets & Union Scale**: 2026 IATSE (600, 728, 80, 695, 700), meal penalties, Golden Time, and kit fees.
- **Packaging & Financing**: Pitch decks, comps analysis, soft-money state tax credits, and Sundance/Cannes festival roadmaps.

*Select a quick prompt below or ask your specific production question:*`,
    },
  ]);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (initialPrompt && messages.length === 1) {
        handleSendMessage(initialPrompt);
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/hollywood-genius", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to Hollywood Genius server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const dataContent = trimmed.substring(6).trim();
            if (dataContent === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(dataContent);
              const delta = parsed.choices?.[0]?.delta?.content || "";
              if (delta) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: msg.content + delta }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore line parse errors
            }
          }
        }
      }
    } catch (err: unknown) {
      console.error("Hollywood Genius error:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  msg.content ||
                  "The Hollywood Genius is calibrating set reports. Please verify your query or retry in a moment.",
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="hollywood-genius-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="hollywood-genius-modal"
        className="relative flex flex-col w-full max-w-5xl h-[92vh] bg-zinc-950 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden"
      >
        {/* Cinematic Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-zinc-950 shadow-md shadow-amber-500/20">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
                  Hollywood Genius AI
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-500/40 rounded-full">
                  Film Industry Insider
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Complete Crews • Who's Casting • IATSE Scale • Best Boys to A-List Talent
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="reset-hollywood-chat"
              onClick={() =>
                setMessages([
                  {
                    id: "welcome",
                    role: "assistant",
                    content: `### 🎬 Welcome to the Hollywood Genius AI Studio\n\nI am your veteran packaging executive, Unit Production Manager (UPM), and industry casting insider.\n\n**Ask me about:**\n- Full film department crew rosters (Directing, Camera, G&E, Sound, Post, Stunts)\n- Casting directors and active breakdowns\n- 2026 IATSE rates, overtime, and kit rentals\n- Pitch packaging and festival distribution`,
                  },
                ])
              }
              title="Reset Conversation"
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="close-hollywood-modal"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-6 py-2.5 border-b border-zinc-800/80 bg-zinc-900/30 overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-2 min-w-max">
            <span className="text-xs font-medium text-zinc-400 flex items-center space-x-1 mr-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Insights:</span>
            </span>
            {QUICK_PROMPTS.map((qp, idx) => {
              const Icon = qp.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.prompt)}
                  disabled={isStreaming}
                  className="flex items-center space-x-1.5 px-3 py-1 text-xs font-medium text-zinc-300 bg-zinc-800/70 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/40 border border-zinc-700/60 rounded-full transition-all disabled:opacity-50"
                >
                  <Icon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{qp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Stream Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative max-w-3xl rounded-2xl p-5 ${
                  m.role === "user"
                    ? "bg-amber-500 text-zinc-950 font-medium rounded-br-none shadow-md shadow-amber-500/20"
                    : "bg-zinc-900 border border-zinc-800/80 text-zinc-200 rounded-bl-none shadow-lg"
                }`}
              >
                {/* Header for assistant message */}
                {m.role === "assistant" && (
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        Hollywood Genius Studio Intelligence
                      </span>
                    </div>
                    {m.content && (
                      <button
                        onClick={() => handleCopy(m.content, m.id)}
                        className="flex items-center space-x-1 text-xs text-zinc-400 hover:text-amber-300 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Markdown text */}
                <div
                  className={`text-sm leading-relaxed ${
                    m.role === "user"
                      ? "text-zinc-950"
                      : "prose prose-invert prose-zinc max-w-none prose-headings:text-amber-300 prose-headings:font-bold prose-headings:text-base prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-zinc-100 prose-table:my-4 prose-th:text-amber-300 prose-th:border-b prose-th:border-zinc-700 prose-td:border-b prose-td:border-zinc-800"
                  }`}
                >
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isStreaming && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-3 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-4 py-3 rounded-2xl rounded-bl-none">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <div
                    className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
                <span>Hollywood Genius analyzing crew rosters & casting logs...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center space-x-3"
          >
            <input
              id="hollywood-genius-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crew assembly, casting directors, day rates, or pitch packaging..."
              disabled={isStreaming}
              className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-all"
            />
            <button
              id="hollywood-genius-submit"
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-semibold rounded-xl text-sm shadow-md shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4 mr-2" />
              <span>Ask Genius</span>
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-zinc-500">
            <span>
              Powered by Google Gemini 3.8 Flash & Hollywood Production Standards (IATSE, DGA, CSA, SAG-AFTRA)
            </span>
            <span>Independent & Studio Production Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
