"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Pin, X } from "lucide-react"
import clsx from "clsx"

const TM_GREEN = "#22d3ee" // Using cyan-400 color

// Custom Send Arrow Icon
const SendIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={2} 
    className={className}
  >
    <path d="m22 2-7 20-4-9-9-4z" />
    <path d="M22 2 11 13" />
  </svg>
)

const initialMessages = [
  {
    id: 1,
    sender: "bot",
    text: "Welcome to TennisMenace AI. Ask me anything about <span class=\"tm-green\">players</span>, <span class=\"tm-green\">matches</span>, or <span class=\"tm-green\">insights</span>.",
    timestamp: new Date(),
  },
]

function highlightKeywords(text: string) {
  // Only highlight keywords in non-welcome messages
  return text.replace(/(win probability|momentum|ELO|trend|prediction|insight|stat|player|match|surface|history)/gi, match => `<span class=\"tm-green\">${match}</span>`)
}

function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 mt-2 ml-2">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-cyan-400 opacity-80 animate-typingdot"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
      <span className="ml-2 text-xs text-cyan-400">AI is typing…</span>
    </div>
  )
}

export default function AIChat() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [pinnedMessages, setPinnedMessages] = useState<typeof initialMessages>([])
  const [expandedPins, setExpandedPins] = useState<Set<number>>(new Set())
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Removed auto-scroll behavior - users can manually scroll if needed

  function handleSend() {
    if (!input.trim()) return
    setIsSending(true)
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: input,
      timestamp: new Date(),
    }
    setMessages(msgs => [...msgs, userMsg])
    setInput("")
    setTimeout(() => {
      setIsSending(false)
      setIsTyping(true)
      setTimeout(() => {
        setMessages(msgs => [
          ...msgs,
          {
            id: Date.now() + 1,
            sender: "bot",
            text: `Here's a sample <span class=\"tm-green\">insight</span> for your question about <span class=\"tm-green\">${userMsg.text}</span>.`,
            timestamp: new Date(),
          },
        ])
        setIsTyping(false)
      }, 1200)
    }, 300)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function pinMessage(message: typeof initialMessages[0]) {
    if (!pinnedMessages.find(p => p.id === message.id)) {
      setPinnedMessages(prev => [...prev, message])
    }
  }

  function unpinMessage(messageId: number) {
    setPinnedMessages(prev => prev.filter(p => p.id !== messageId))
    setExpandedPins(prev => {
      const newSet = new Set(prev)
      newSet.delete(messageId)
      return newSet
    })
  }

  function togglePinExpansion(messageId: number) {
    setExpandedPins(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  function getPreviewText(text: string, maxLength: number = 15) {
    // Remove HTML tags for preview
    const plainText = text.replace(/<[^>]*>/g, '')
    // Get just the first few words
    const words = plainText.split(' ').slice(0, 3).join(' ')
    return words.length > maxLength ? words.slice(0, maxLength) + '...' : words + '...'
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start mt-12 px-4">
      <div className="flex flex-col items-center justify-center w-full">
        <h1 className="text-center text-4xl md:text-5xl font-extrabold mb-8 hover:-translate-y-0.5 transition-all duration-200 ease-in-out cursor-default animate-gradient-text bg-gradient-to-r from-cyan-400 via-cyan-200 to-cyan-400 bg-[length:200%_auto] text-transparent bg-clip-text">
          TM AI Assistant
        </h1>
        
        {/* Main Chat Layout */}
        <div className="w-full max-w-7xl flex justify-between gap-8">
          {/* Chat Container */}
          <div
            className="flex-1 max-w-3xl flex flex-col justify-between bg-transparent rounded-xl p-4 animate-chatfadein"
            style={{ minHeight: 480, maxHeight: '80vh' }}
          >
          {/* Header */}
          <div className="mb-4 animate-slidefadein" style={{ animationDelay: '0.15s' }}>
            <span className="font-bold text-white text-lg tracking-tight">TennisMenace AI</span>
            <div className="text-xs mt-0.5 text-cyan-400 opacity-70">
              AI Tennis Assistant
            </div>
          </div>
          {/* Chat Body */}
          <div
            className="flex-1 overflow-y-auto space-y-3 pb-2 animate-slidefadein"
            style={{ minHeight: 200, animationDelay: '0.3s' }}
          >
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className={clsx(
                  "flex w-full items-start gap-2 group",
                  msg.sender === "bot" ? "justify-start" : "justify-end"
                )}
              >
                <div
                  className={clsx(
                    "relative max-w-[80%] px-4 py-2 rounded-xl text-sm opacity-0 animate-fadein",
                    msg.sender === "bot"
                      ? "bg-neutral-900 text-white"
                      : "bg-cyan-500/20 text-cyan-100 font-semibold border border-cyan-400/30",
                    msg.sender === "bot" && "rounded-bl-none",
                    msg.sender === "user" && "rounded-br-none"
                  )}
                  title={msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        msg.sender === "bot"
                          ? (i === 0 ? msg.text : highlightKeywords(msg.text))
                          : msg.text,
                    }}
                  />
                </div>
                {/* Pin Icon for Bot Messages - Outside container */}
                {msg.sender === "bot" && (
                  <button
                    onClick={() => pinMessage(msg)}
                    className="mt-2 p-1 opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity duration-200 flex-shrink-0"
                    aria-label="Pin message"
                  >
                    <Pin className="w-4 h-4 text-cyan-400" />
                  </button>
                )}
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>
          {/* Input Bar */}
          <form
            className="flex items-center gap-2 mt-2 animate-slidefadein"
            style={{ animationDelay: '0.45s' }}
            onSubmit={e => {
              e.preventDefault()
              handleSend()
            }}
            autoComplete="off"
          >
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                className="w-full text-white placeholder:text-neutral-400 rounded-full px-4 py-3 pr-12 border border-neutral-700 bg-neutral-900 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.5)] transition-all duration-300"
                style={{ fontFamily: "inherit" }}
                placeholder="Ask about player stats, predictions, or match history"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                maxLength={500}
              />
              <motion.button
                type="submit"
                className="absolute right-3 p-1.5 rounded-full bg-transparent hover:bg-cyan-400/10 focus:outline-none transition-all duration-200 ease-in-out group flex items-center justify-center"
                tabIndex={0}
                aria-label="Send message"
                whileTap={{ scale: 0.95 }}
                animate={isSending ? { scale: 0.95 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <SendIcon className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200" />
              </motion.button>
            </div>
          </form>
        </div>

        {/* Pinboard Column - Desktop Only */}
        <div className="hidden lg:block w-[280px] animate-slidefadein" style={{ animationDelay: '0.6s' }}>
          <div className="sticky top-24">
            <h3 className="text-cyan-400 font-semibold text-sm uppercase mb-4 tracking-wider">
              Pinned Insights
            </h3>
            <div className="space-y-2">
              {pinnedMessages.length === 0 ? (
                <p className="text-neutral-500 text-xs italic">
                  Pin AI messages to save important insights
                </p>
              ) : (
                pinnedMessages.map((msg) => {
                  const isExpanded = expandedPins.has(msg.id)
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-black rounded-lg px-4 py-2 text-sm text-white border-l-2 border-cyan-400 relative group cursor-pointer"
                      onClick={() => togglePinExpansion(msg.id)}
                    >
                      <div className="pr-6">
                        {isExpanded ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: highlightKeywords(msg.text),
                            }}
                          />
                        ) : (
                          <div className="text-neutral-300">
                            {getPreviewText(msg.text)}
                          </div>
                        )}
                      </div>
                      
                      {/* Expand/Collapse indicator */}
                      <div className="absolute bottom-1 right-8 text-xs text-cyan-400 opacity-60">
                        {isExpanded ? '▼' : '▶'}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          unpinMessage(msg.id)
                        }}
                        className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity duration-200"
                        aria-label="Unpin message"
                      >
                        <X className="w-3 h-3 text-neutral-400 hover:text-red-400" />
                      </button>
                      <div className="text-xs text-neutral-500 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
      <style jsx global>{`
        .tm-green {
          color: #22d3ee;
          font-weight: 600;
          transition: color 0.15s;
        }
        .tm-green:hover {
          color: #67e8f9;
        }
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-text {
          animation: gradient-animation 3s ease-in-out infinite;
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fadein {
          animation: fadein 0.5s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes chatfadein {
          from { opacity: 0; transform: translateY(32px) scale(0.98); }
          to { opacity: 1; transform: none; }
        }
        .animate-chatfadein {
          animation: chatfadein 0.7s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes slidefadein {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .animate-slidefadein {
          animation: slidefadein 0.5s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes typingdot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.9); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        .animate-typingdot {
          animation: typingdot 1.2s infinite both;
        }
      `}</style>
    </div>
  )
}
