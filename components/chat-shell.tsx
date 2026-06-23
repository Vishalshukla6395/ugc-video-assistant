"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {Bot, Copy, Loader2, Moon, Send, Sparkles, Sun, UserRound, Video} from "lucide-react";
import type {ChatApiResponse, ChatMessage, Role} from "@/lib/types";

const starter: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey 👋 I'm your UGC video assistant. Send me a product URL and I'll create a short-form marketing video.",
  createdAt: new Date().toISOString()
};

export function ChatShell() {
  const [messages, setMessages] = useState<ChatMessage[]>([starter]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({behavior: "smooth", block: "end"});
  }, [messages, isLoading]);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || isLoading) return;

    const userMessage = makeMessage("user", content);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({messages: nextMessages})
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "The assistant hit an unexpected error.");
      }

      const data = (await response.json()) as ChatApiResponse;
      setMessages((current) => [...current, data.message]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setMessages((current) => [
        ...current,
        makeMessage(
          "assistant",
          "I couldn't finish that request. Check your API keys and try again."
        )
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-neutral-950 transition-colors dark:bg-[#111111] dark:text-neutral-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col">
        <header className="sticky top-0 z-10 border-b border-neutral-200/80 bg-[#f7f7f4]/90 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-[#111111]/90 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                <Sparkles size={19} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold tracking-normal">UGC Video Assistant</h1>
                <p className="truncate text-sm text-neutral-600 dark:text-neutral-400">
                  Product URL in, social-ready video out
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={() => setIsDark((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
              title="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <section className="flex-1 px-4 py-5 sm:px-6">
          <div className="space-y-5">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading ? <TypingBubble /> : null}
            <div ref={scrollRef} />
          </div>
        </section>

        <footer className="sticky bottom-0 border-t border-neutral-200/80 bg-[#f7f7f4]/95 px-4 py-4 backdrop-blur dark:border-neutral-800 dark:bg-[#111111]/95 sm:px-6">
          {error ? (
            <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200">
              {error}
            </p>
          ) : null}
          <div className="flex items-end gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              rows={1}
              placeholder="Ask a question or paste a product URL..."
              className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-5 outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-500"
            />
            <button
              type="button"
              disabled={!canSend}
              onClick={() => void sendMessage()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-neutral-950 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              aria-label="Send message"
              title="Send"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}

function MessageBubble({message}: {message: ChatMessage}) {
  const isUser = message.role === "user";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const time = mounted
    ? new Intl.DateTimeFormat(undefined, {hour: "numeric", minute: "2-digit"}).format(
        new Date(message.createdAt)
      )
    : "";

  return (
    <article className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? <Avatar role={message.role} /> : null}
      <div className={`max-w-[86%] sm:max-w-[75%] ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
            isUser
              ? "rounded-br-md bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
              : "rounded-bl-md border border-neutral-200 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.video ? <VideoPreview url={message.video.url} /> : null}
        </div>
        <p className={`mt-1 min-h-4 px-1 text-xs text-neutral-500 ${isUser ? "text-right" : "text-left"}`}>
          {time}
        </p>
      </div>
      {isUser ? <Avatar role={message.role} /> : null}
    </article>
  );
}

function Avatar({role}: {role: Role}) {
  const Icon = role === "user" ? UserRound : Bot;
  return (
    <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
      <Icon size={16} />
    </div>
  );
}

function TypingBubble() {
  return (
    <article className="flex gap-3">
      <Avatar role="assistant" />
      <div className="rounded-2xl rounded-bl-md border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="animate-spin" size={16} />
          Thinking through the video...
        </span>
      </div>
    </article>
  );
}

function VideoPreview({url}: {url: string}) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      <video src={url} controls playsInline className="aspect-[9/16] max-h-[420px] w-full bg-black object-cover" />
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <span className="inline-flex min-w-0 items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <Video size={14} />
          <a href={url} target="_blank" rel="noreferrer" className="truncate underline-offset-2 hover:underline">
            {url}
          </a>
        </span>
        <button
          type="button"
          onClick={() => void copyUrl()}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          title={copied ? "Copied" : "Copy video URL"}
          aria-label="Copy video URL"
        >
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

function makeMessage(role: Role, content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString()
  };
}
