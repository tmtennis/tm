"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Bot, CheckCircle, ChevronDown, Menu, X, Youtube, Instagram, Star } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginModal } from "@/components/login-modal"
import { UserDropdown } from "@/components/user-dropdown"
import { useAuth } from "@/contexts/auth-context"
import PlayerSearch from '@/components/PlayerSearch';
import Link from "next/link"

// X.com Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Rotating text data
const rotatingTexts = [
  "Data-driven tennis betting with custom ELO, momentum indicators, and AI-powered insights.",
  "Follow the tours with clarity, context, and a sharper perspective.",
  "Our trained AI model applies advanced analytics, trend analysis, and cross-referenced insights to generate precise, data-driven predictions and deliver a nuanced perspective.",
]

// Track record stats for rotation
const trackRecordStats = [
  { value: "68%", label: "Overall Hit Rate" },
  { value: "72%", label: "ROI on Picks" },
  { value: "1,200+", label: "Players Analyzed" },
  { value: "5+ years", label: "Historical Data" },
]

// Premium features for rotation
const premiumFeatures = [
  "Advanced ELO & Momentum Models",
  "Frequent High-Confidence Picks",
  "Direct Access to Our AI Chatbot",
]

// AI Chat messages for animation
const aiMessages = [
  "Alcaraz has a 68% win probability based on recent surface performance and a +3.5 momentum score. Key factor: Alcaraz's return of serve against Djokovic's second serve...",
  "Want a deeper breakdown by set, surface, or player trend?",
]

// Mock Data
const dailyPicks = [
  {
    id: "match1",
    tournament: "Wimbledon - Quarterfinals",
    players: [
      { name: "Carlos Alcaraz", flag: "/flags/es.png", image: "/carlos-alcaraz-tennis.png" },
      { name: "Novak Djokovic", flag: "/flags/rs.png", image: "/novak-djokovic-tennis.png" },
    ],
    prediction: "Alcaraz to win in 4 sets. His aggressive baseline game might be too much for Djokovic on the day.",
    odds: "Alcaraz 1.85, Djokovic 2.10",
  },
  {
    id: "match2",
    tournament: "Wimbledon - Quarterfinals",
    players: [
      { name: "Jannik Sinner", flag: "/flags/it.png", image: "/jannik-sinner-tennis.png" },
      { name: "Alexander Zverev", flag: "/flags/de.png", image: "/alexander-zverev-tennis.png" },
    ],
    prediction: "Sinner in 3 sets. His form on grass has been impeccable, and his power from both wings will dominate.",
    odds: "Sinner 1.50, Zverev 2.60",
  },
]

const articles = [
  {
    id: 1,
    category: "ANALYSIS",
    title: "The Evolution of the Serve & Volley",
    description: "A deep dive into how the classic tactic is making a modern comeback on the ATP tour.",
  },
  {
    id: 2,
    category: "STRATEGY",
    title: "Mastering the Mental Game: A Pro's Guide",
    description: "Insights from sports psychologists on how top players maintain focus under pressure.",
  },
  {
    id: 3,
    category: "DATA",
    title: "Forehand Potency: A Data-Driven Ranking",
    description: "We analyzed over 10,000 matches to determine whose forehand is the biggest weapon in tennis.",
  },
]

const platforms = [
  { name: "X", Icon: XIcon, href: "https://x.com/tmtennisx" },
  { name: "YouTube", Icon: Youtube, href: "#" },
  { name: "Instagram", Icon: Instagram, href: "#" },
]

// Typewriter Text Component
const TypewriterText = ({ text, speed = 50 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed])

  return <span>{displayedText}</span>
}

// Hook to detect mobile viewport
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)

    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return isMobile
}

// Main Page Component
export default function TennisMenacePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentStatIndex, setCurrentStatIndex] = useState(0)
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0)
  const [aiChatAnimationStarted, setAiChatAnimationStarted] = useState(false)
  const [showFirstMessage, setShowFirstMessage] = useState(false)
  const [showSecondMessage, setShowSecondMessage] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [animatedArticles, setAnimatedArticles] = useState<Set<number>>(new Set())
  const shouldReduceMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const { user, loading } = useAuth()

  // Force light mode for this page
  useEffect(() => {
    // Store the current theme
    const currentTheme = document.documentElement.classList.contains('dark')
    const storedTheme = localStorage.getItem('theme')
    
    // Force light mode
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    
    // Cleanup function to restore previous theme when leaving the page
    return () => {
      if (storedTheme === 'dark' || (!storedTheme && currentTheme)) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      }
    }
  }, [])

  // Rotate text every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Rotate track record stats every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % trackRecordStats.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Rotate premium features every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % premiumFeatures.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // AI Chat Animation Sequence
  useEffect(() => {
    if (!aiChatAnimationStarted) return

    const sequence = async () => {
      // Show typing indicator
      setIsTyping(true)

      // Wait 2 seconds for typing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Hide typing and show first message
      setIsTyping(false)
      setShowFirstMessage(true)

      // Wait for first message to finish typing (message length * speed + buffer)
      // First message is ~150 characters * 30ms + 1 second buffer = ~5.5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5500))
      setShowSecondMessage(true)
    }

    sequence()
  }, [aiChatAnimationStarted])

  const textVariants = {
    enter: { opacity: 0, y: 20, filter: "blur(10px)" },
    center: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -20, filter: "blur(10px)" },
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  }

  const statVariants = {
    enter: { opacity: 0, y: 20, filter: "blur(10px)" },
    center: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -20, filter: "blur(10px)" },
  }

  const featureVariants = {
    enter: { opacity: 0, x: -20, filter: "blur(10px)" },
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: 20, filter: "blur(10px)" },
  }

  const getArticleVariants = (index: number) => ({
    hidden: { opacity: 0, x: -20, y: 20, filter: "blur(10px)" },
    visible: { opacity: 1, x: 0, y: 0, filter: "blur(0px)" },
  })

  // Navigation links configuration
  const navLinks = [
    { href: "#picks", label: "Daily Picks" },
    { href: "#premium", label: "Premium" },
    { href: "#analysis", label: "Analysis" },
    { href: "/media-builder", label: "Media Builder" },
    { href: "#contact", label: "Contact" },
  ]

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 md:px-8 flex justify-between items-center bg-background/80 backdrop-blur-sm border-b border-border theme-transition-bg theme-transition-border">
        <motion.a
          href="#"
          className="text-2xl font-bold tracking-tighter theme-transition-text"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Tennis<span className="text-primary theme-transition-text">Menace</span>
        </motion.a>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              className="hover:text-foreground theme-transition-text"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              {link.label}
            </motion.a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <motion.a
            href="https://x.com/tmtennisx"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-muted theme-transition-bg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <XIcon className="h-5 w-5 text-muted-foreground hover:text-foreground theme-transition-text" />
          </motion.a>
          <ThemeToggle />
          {!loading && (
            user ? (
              <UserDropdown />
            ) : (
              <LoginModal>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="theme-transition bg-transparent">
                    Log In
                  </Button>
                </motion.div>
              </LoginModal>
            )
          )}
        </div>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="theme-transition">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 bg-background border-b border-border p-4 md:hidden theme-transition-bg theme-transition-border"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-lg font-medium text-muted-foreground hover:text-foreground theme-transition-text"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-border pt-4 flex flex-col gap-4 theme-transition-border">
                <a
                  href="https://x.com/tmtennisx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-lg font-medium text-muted-foreground hover:text-foreground theme-transition-text"
                >
                  <XIcon className="h-5 w-5" />
                  Follow on X
                </a>
                {!loading && (
                  user ? (
                    <div className="flex items-center justify-between">
                      <UserDropdown />
                      <div className="mx-4">
                        <ThemeToggle />
                      </div>
                    </div>
                  ) : (
                    <LoginModal>
                      <Button variant="outline" className="theme-transition bg-transparent">
                        Log In
                      </Button>
                    </LoginModal>
                  )
                )}
                {!user && (
                  <div className="mx-auto">
                    <ThemeToggle />
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="px-4 md:px-8">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center">
          <div className="relative h-32 flex items-center justify-center">
            {/* Pre-title animation */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              animate={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
              transition={{ duration: 1.0, delay: 2.0, ease: "easeInOut" }}
            >
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none">
                <span className="text-foreground">make your own </span>
                <span className="text-primary">judgement</span>
              </h1>
            </motion.div>

            {/* Clean TennisMenace Title with smooth animations */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.0, delay: 3.0, ease: "easeInOut" }}
            >
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none">
                <span className="text-foreground">tennis</span>
                <span className="text-primary">menace</span>
              </h1>
            </motion.div>
          </div>

          {/* Rotating Text */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 4.0 }}
            className="mt-8 h-20 md:h-16 flex items-center justify-center max-w-4xl"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTextIndex}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-lg md:text-xl text-muted-foreground"
              >
                {rotatingTexts[currentTextIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 4.5 }}
            className="absolute bottom-10"
          >
            <ChevronDown className="h-8 w-8 text-muted-foreground animate-bounce" />
          </motion.div>
        </section>

        {/* Daily Picks Section */}
        <motion.section
          id="picks"
          className="py-20 md:py-32"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12 theme-transition-text">Daily Picks</h2>
          <Accordion type="single" collapsible className="w-full">
            {dailyPicks.map((match, index) => (
              <AccordionItem value={`item-${index}`} key={match.id} className="border-border theme-transition-border">
                <AccordionTrigger className="text-lg md:text-xl hover:no-underline accordion-trigger-shimmer theme-transition-text rounded-lg px-4 py-6">
                  <div className="flex items-center justify-between w-full relative z-10">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground theme-transition-text font-medium">
                        {match.players[0].name} vs {match.players[1].name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground hidden md:block theme-transition-text">
                        {match.tournament}
                      </span>
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-card border-border match-card-shimmer theme-transition-bg theme-transition-border mt-4 mx-4">
                      <CardContent className="p-6 relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-bold text-foreground theme-transition-text">
                                {match.players[0].name} vs {match.players[1].name}
                              </h3>
                              <p className="text-sm text-primary font-medium theme-transition-text">{match.odds}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-card-foreground theme-transition-text leading-relaxed">
                          <span className="text-sm font-semibold text-primary theme-transition-text">Pick: </span>
                          {match.prediction}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Track Record Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <div className="text-left">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-foreground theme-transition-text">
                Our Track Record
              </h3>
              <p className="text-muted-foreground mb-6 theme-transition-text">
                We deliver consistent results through data-driven analysis and expert insights.
              </p>

              {/* Rotating Stats Display */}
              <div className="h-20 flex items-start">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStatIndex}
                    variants={statVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="text-left"
                  >
                    <div className="text-4xl md:text-5xl font-black text-primary mb-1 theme-transition-text">
                      {trackRecordStats[currentStatIndex].value}
                    </div>
                    <div className="text-base md:text-lg text-muted-foreground font-medium theme-transition-text">
                      {trackRecordStats[currentStatIndex].label}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Premium + AI Chat Section */
        <motion.section
          id="premium"
          className="py-20 md:py-32"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 theme-transition-text">
                Premium + AI Chat
              </h2>
              <p className="text-muted-foreground text-lg mb-8 theme-transition-text">
                Unlock the ultimate edge. Get exclusive access to our AI-powered chat, advanced analytics, and real-time
                alerts.
              </p>
              <p className="text-foreground text-base mb-8 font-medium theme-transition-text border-l-2 border-primary pl-4">
                Our focus isn't to feed you plays every single day — it's to build your bankroll and actually help you
                start winning.
              </p>

              {/* Rotating Feature Highlights */}
              <div className="mb-10 h-12 flex items-center">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary theme-transition-text flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentFeatureIndex}
                      variants={featureVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="theme-transition-text font-medium"
                    >
                      {premiumFeatures[currentFeatureIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link href="/premium">
                  <Button
                    size="lg"
                    className="group relative bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      <span>
                        Unlock Premium Access
                      </span>
                    </div>
                  </Button>
                </Link>
              </motion.div>
            </div>
            <Card className="bg-card border-border theme-transition-bg theme-transition-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-6 w-6 text-primary theme-transition-text" />
                  <span className="theme-transition-text">AI Match Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  onViewportEnter={() => {
                    if (!aiChatAnimationStarted) {
                      setTimeout(() => setAiChatAnimationStarted(true), 500)
                    }
                  }}
                  className="space-y-4"
                >
                  {/* User Message */}
                  <div className="flex justify-end">
                    <motion.p
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs theme-transition-bg theme-transition-text"
                    >
                      Analyze the Alcaraz vs Djokovic match.
                    </motion.p>
                  </div>

                  {/* AI Response Area */}
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      {/* Typing Indicator */}
                      <AnimatePresence>
                        {isTyping && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="bg-muted text-muted-foreground p-3 rounded-lg flex items-center gap-2 theme-transition-bg theme-transition-text"
                          >
                            <span className="text-sm">AI is typing</span>
                            <div className="flex gap-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{
                                    duration: 1.2,
                                    repeat: Number.POSITIVE_INFINITY,
                                    delay: i * 0.2,
                                  }}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* First AI Message */}
                      <AnimatePresence>
                        {showFirstMessage && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-muted text-muted-foreground p-3 rounded-lg theme-transition-bg theme-transition-text"
                          >
                            <TypewriterText text={aiMessages[0]} speed={30} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Second AI Message */}
                      <AnimatePresence>
                        {showSecondMessage && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-muted text-muted-foreground p-3 rounded-lg mt-2 theme-transition-bg theme-transition-text"
                          >
                            <TypewriterText text={aiMessages[1]} speed={40} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </motion.section>
        }
        
        {/* Player Search Section */}
        <motion.section
          id="search"
          className="py-20 md:py-32"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 theme-transition-text">
              Player Guide
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto theme-transition-text">
              Search through the latest ATP rankings and discover detailed information about your favorite tennis players.
            </p>
          </div>
          <PlayerSearch />
        </motion.section>

        {/* Articles & Analysis Section */}
        <motion.section
          id="analysis"
          className="py-20 md:py-32"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12 theme-transition-text">
            Articles & Analysis
          </h2>
          <div className="border-t border-border theme-transition-border">
            {articles.map((article, index) => (
              <motion.a
                href="#"
                key={article.id}
                className="group block border-b border-border py-8 theme-transition-border"
                variants={getArticleVariants(index)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onViewportEnter={() => {
                  setAnimatedArticles((prev) => new Set(prev).add(article.id))
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 theme-transition-text">{article.category}</p>
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 group-hover:text-primary theme-transition-text">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground max-w-2xl theme-transition-text">{article.description}</p>
                  </div>
                  <ArrowUpRight className="h-8 w-8 text-muted-foreground transition-all group-hover:text-primary group-hover:rotate-45 theme-transition-text" />
                </div>
              </motion.a>
            ))}
          </div>
        </motion.section>

        {/* Contact Us Section - Minimalist List Style */}
        <motion.section
          id="contact"
          className="py-20 md:py-32"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12 theme-transition-text">Get in Touch</h2>
          <div className="border-t border-border theme-transition-border">
            {/* Email Support */}
            <motion.a
              href="mailto:support@tennismenace.com"
              className="group block border-b border-border py-6 theme-transition-border"
              whileHover={{ x: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold tracking-tight group-hover:text-primary theme-transition-text">
                    Email Support
                  </h3>
                  <p className="text-muted-foreground text-sm theme-transition-text">
                    Have questions? We're here to help.
                  </p>
                </div>
                <ArrowUpRight className="h-6 w-6 text-muted-foreground transition-all group-hover:text-primary group-hover:rotate-45 theme-transition-text" />
              </div>
            </motion.a>

            {/* Appreciate Our Work */}
            <motion.a
              href="#" // Replace with Stripe link
              target="_blank"
              rel="noopener noreferrer"
              className="group block border-b border-border py-6 theme-transition-border"
              whileHover={{ x: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold tracking-tight group-hover:text-primary theme-transition-text">
                    Appreciate Our Work
                  </h3>
                  <p className="text-muted-foreground text-sm theme-transition-text">Support the project with a tip.</p>
                </div>
                <ArrowUpRight className="h-6 w-6 text-muted-foreground transition-all group-hover:text-primary group-hover:rotate-45 theme-transition-text" />
              </div>
            </motion.a>

            {/* Additional Platforms */}
            <motion.div
              className="group block border-b border-border py-6 theme-transition-border"
              whileHover={{ x: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold tracking-tight group-hover:text-primary theme-transition-text">
                    Additional Platforms
                  </h3>
                  <p className="text-muted-foreground text-sm theme-transition-text">Follow us for more content.</p>
                </div>
                <div className="flex items-center space-x-4">
                  {platforms.map((platform) => (
                    <motion.a
                      key={platform.name}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary theme-transition-text"
                      whileHover={{ scale: 1.1 }}
                    >
                      <platform.Icon className="h-5 w-5" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 px-4 border-t border-border text-muted-foreground text-sm theme-transition-border theme-transition-text">
        <p>&copy; {new Date().getFullYear()} TennisMenace. All rights reserved.</p>
        <p className="mt-2">Please bet responsibly. Must be of legal age to participate.</p>
      </footer>
    </div>
  )
}
