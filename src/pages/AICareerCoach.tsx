import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Plus,
  Trash2,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { callAI } from "../lib/ai";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const SUGGESTIONS = [
  "What skills should I learn for data science?",
  "How do I prepare for technical interviews?",
  "What internships are good for CS freshmen?",
  "How do I build a strong portfolio?",
  "Should I focus on open source or side projects?",
];

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'm your AI Career Coach. I can help you with career advice, interview tips, skill development, and more. What would you like to talk about?",
};

export default function AICareerCoach() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    WELCOME_MESSAGE,
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const chatEnd = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ============================================================
  // SCROLL TO BOTTOM
  // ============================================================

  useEffect(() => {
    chatEnd.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ============================================================
  // LOAD CONVERSATIONS
  // ============================================================

  useEffect(() => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    loadConversations();
  }, [user]);

  // ============================================================
  // LOAD CONVERSATIONS
  // ============================================================

  const loadConversations = async () => {
    if (!user) return;

    setLoadingHistory(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setConversations(data || []);

      // Open most recent conversation automatically
      if (data && data.length > 0) {
        await loadConversation(data[0].id);
      }
    } catch (err) {
      console.error(
        "Failed to load conversations:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load chat history."
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  // ============================================================
  // LOAD SINGLE CONVERSATION
  // ============================================================

  const loadConversation = async (
    conversationId: string
  ) => {
    if (!user) return;

    setError("");

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setCurrentConversationId(
        conversationId
      );

      if (data && data.length > 0) {
        setMessages(
          data.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            created_at: message.created_at,
          }))
        );
        setShowSuggestions(false);
      } else {
        setMessages([
          WELCOME_MESSAGE,
        ]);
        setShowSuggestions(true);
      }

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error(
        "Failed to load conversation:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load conversation."
      );
    }
  };

  // ============================================================
  // CREATE NEW CHAT
  // ============================================================

  const createNewChat = () => {
    setCurrentConversationId(null);
    setMessages([
      WELCOME_MESSAGE,
    ]);
    setShowSuggestions(true);
    setError("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // ============================================================
  // CREATE CONVERSATION IN DATABASE
  // ============================================================

  const createConversation = async (
    firstMessage: string
  ) => {
    if (!user) {
      throw new Error(
        "Please sign in again."
      );
    }

    // Generate a short title from first message
    const title =
      firstMessage.length > 45
        ? firstMessage.slice(0, 45) + "..."
        : firstMessage;

    const { data, error } =
      await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title,
        })
        .select()
        .single();

    if (error) {
      throw error;
    }

    return data as Conversation;
  };

  // ============================================================
  // SAVE MESSAGE
  // ============================================================

  const saveMessage = async (
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id:
          conversationId,
        user_id: user.id,
        role,
        content,
      });

    if (error) {
      throw error;
    }
  };

  // ============================================================
  // UPDATE CONVERSATION TIME
  // ============================================================

  const updateConversationTime = async (
    conversationId: string
  ) => {
    await supabase
      .from("conversations")
      .update({
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", conversationId)
      .eq("user_id", user?.id);
  };

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSend = async (
    overrideText?: string
  ) => {
    const text = (
      overrideText || input
    ).trim();

    if (
      !text ||
      loading ||
      !user
    ) {
      return;
    }

    setInput("");
    setShowSuggestions(false);
    setLoading(true);
    setError("");

    try {
      // --------------------------------------------------------
      // Create conversation if this is a new chat
      // --------------------------------------------------------

      let conversationId =
        currentConversationId;

      if (!conversationId) {
        const newConversation =
          await createConversation(
            text
          );

        conversationId =
          newConversation.id;

        setCurrentConversationId(
          conversationId
        );

        setConversations(
          (prev) => [
            newConversation,
            ...prev,
          ]
        );
      }

      // --------------------------------------------------------
      // Current conversation for Gemini
      // --------------------------------------------------------

      const conversationForAI =
        messages
          .filter(
            (message) =>
              message !==
              WELCOME_MESSAGE
          )
          .slice(-10)
          .map((message) => ({
            role: message.role,
            content:
              message.content,
          }));

      // Add user's message immediately
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: text,
        },
      ]);

      // Save user message
      await saveMessage(
        conversationId,
        "user",
        text
      );

      // --------------------------------------------------------
      // Ask Gemini
      // --------------------------------------------------------

      const result = await callAI({
        mode: "career_coach",
        query: text,
        conversation:
          conversationForAI,
      });

      const assistantContent =
        result.content ||
        "I couldn't generate a response.";

      // --------------------------------------------------------
      // Display AI response
      // --------------------------------------------------------

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            assistantContent,
        },
      ]);

      // --------------------------------------------------------
      // Save AI response
      // --------------------------------------------------------

      await saveMessage(
        conversationId,
        "assistant",
        assistantContent
      );

      // --------------------------------------------------------
      // Update conversation timestamp
      // --------------------------------------------------------

      await updateConversationTime(
        conversationId
      );

      // Update local conversation order
      setConversations((prev) =>
        prev
          .map((conversation) =>
            conversation.id ===
            conversationId
              ? {
                  ...conversation,
                  updated_at:
                    new Date().toISOString(),
                }
              : conversation
          )
          .sort(
            (a, b) =>
              new Date(
                b.updated_at
              ).getTime() -
              new Date(
                a.updated_at
              ).getTime()
          )
      );
    } catch (err) {
      console.error(
        "Career Coach error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to get response. Please try again."
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // ============================================================
  // DELETE CHAT
  // ============================================================

  const deleteConversation = async (
    conversationId: string
  ) => {
    if (!user) return;

    const confirmed =
      window.confirm(
        "Delete this conversation?"
      );

    if (!confirmed) return;

    try {
      const { error } =
        await supabase
          .from("conversations")
          .delete()
          .eq(
            "id",
            conversationId
          )
          .eq(
            "user_id",
            user.id
          );

      if (error) {
        throw error;
      }

      setConversations(
        (prev) =>
          prev.filter(
            (conversation) =>
              conversation.id !==
              conversationId
          )
      );

      if (
        currentConversationId ===
        conversationId
      ) {
        createNewChat();
      }
    } catch (err) {
      console.error(
        "Delete conversation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete conversation."
      );
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-purple-600" />
          </div>

          <h1 className="font-heading font-bold text-2xl text-foreground">
            AI Career Coach
          </h1>
        </div>

        <p className="text-foreground/60">
          Chat with your personal AI career advisor
        </p>
      </div>

      {/* Main Layout */}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        {/* ================================================== */}
        {/* SIDEBAR */}
        {/* ================================================== */}

        <div className="bg-white border border-border rounded-2xl shadow-sm p-3 h-fit">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>

          <div className="mt-4">
            <p className="text-xs font-medium text-foreground/40 px-2 mb-2">
              CHAT HISTORY
            </p>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-foreground/40" />
              </div>
            ) : conversations.length ===
              0 ? (
              <div className="text-xs text-foreground/40 text-center py-6">
                No previous chats
              </div>
            ) : (
              <div className="space-y-1 max-h-[450px] overflow-y-auto">
                {conversations.map(
                  (conversation) => (
                    <div
                      key={
                        conversation.id
                      }
                      className={`group flex items-center gap-2 rounded-xl transition-colors ${
                        currentConversationId ===
                        conversation.id
                          ? "bg-muted"
                          : "hover:bg-muted/70"
                      }`}
                    >
                      <button
                        onClick={() =>
                          loadConversation(
                            conversation.id
                          )
                        }
                        className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2.5 text-left cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 shrink-0 text-foreground/40" />

                        <span className="text-sm text-foreground truncate">
                          {
                            conversation.title
                          }
                        </span>
                      </button>

                      <button
                        onClick={() =>
                          deleteConversation(
                            conversation.id
                          )
                        }
                        className="p-2 mr-1 opacity-0 group-hover:opacity-100 text-foreground/40 hover:text-destructive transition-all cursor-pointer"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================================================== */}
        {/* CHAT */}
        {/* ================================================== */}

        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Messages */}

          <div className="h-[500px] overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map(
              (msg, i) => (
                <div
                  key={
                    msg.id || i
                  }
                  className={`flex gap-3 ${
                    msg.role ===
                    "user"
                      ? "justify-end"
                      : ""
                  }`}
                >
                  {msg.role ===
                    "assistant" && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role ===
                      "user"
                        ? "bg-primary text-on-primary rounded-tr-md"
                        : "bg-muted text-foreground rounded-tl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {
                        msg.content
                      }
                    </p>
                  </div>

                  {msg.role ===
                    "user" && (
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-accent" />
                    </div>
                  )}
                </div>
              )
            )}

            {/* Loading */}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>

                <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce"
                      style={{
                        animationDelay:
                          "150ms",
                      }}
                    />
                    <span
                      className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce"
                      style={{
                        animationDelay:
                          "300ms",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEnd} />
          </div>

          {/* Error */}

          {error && (
            <div className="mx-4 md:mx-6 mb-2 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-2">
              {error}
            </div>
          )}

          {/* Suggestions */}

          {showSuggestions &&
            messages.length ===
              1 &&
            !loading && (
              <div className="px-4 md:px-6 pb-3">
                <p className="text-xs text-foreground/40 mb-2">
                  Try asking:
                </p>

                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map(
                    (suggestion) => (
                      <button
                        key={
                          suggestion
                        }
                        onClick={() =>
                          handleSend(
                            suggestion
                          )
                        }
                        className="text-xs px-3 py-1.5 bg-muted hover:bg-foreground/10 text-foreground/70 rounded-full transition-all cursor-pointer"
                      >
                        {
                          suggestion
                        }
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Input */}

          <div className="border-t border-border p-4 md:p-6">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
                    handleSend();
                  }
                }}
                placeholder="Ask for career advice..."
                className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                disabled={
                  loading
                }
              />

              <button
                onClick={() =>
                  handleSend()
                }
                disabled={
                  loading ||
                  !input.trim()
                }
                className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.97] transition-all duration-150 disabled:opacity-50 cursor-pointer"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-foreground/40 mt-2">
              Powered by AI — responses are personalized to your profile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}