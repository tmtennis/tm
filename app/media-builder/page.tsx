"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, BarChart3, Palette, ExternalLink, Image, X, Edit3, Save, Copy, Trophy, Star, Crown, Medal, RotateCcw, Menu } from "lucide-react"
import { toPng } from 'html-to-image'
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginModal } from "@/components/login-modal"
import { UserDropdown } from "@/components/user-dropdown"
import { useAuth } from "@/contexts/auth-context"
import MatchCard from "@/components/MatchCard"
import "@/styles/stat-cards.css"

// X.com Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

interface MatchData {
  date: string
  tournament: string
  surface: string
  round: string
  rank: string
  opponentRank: string
  result: string
  score: string
  isWin: boolean
}

interface PlayerStats {
  playerName: string
  currentRank: number
  wins: number
  losses: number
  winPercentage: number
  last6Matches: MatchData[]
  totalMatches: number
  surfaceRecords: {
    [surface: string]: { wins: number; losses: number; percentage: number }
  }
}

interface CardTheme {
  id: string
  name: string
  background: string
  accent: string
  textPrimary: string
  textSecondary: string
  border: string
}

interface CustomContent {
  playerName: string
  atpRank: string
  season: string
  winRate: string
  winRateLabel: string
  overallRecord: string
  totalMatches: string
  clayRecord: string
  clayPercentage: string
  grassRecord: string
  grassPercentage: string
  hardRecord: string
  hardPercentage: string
  highlightsTitle: string
  highlightsSubtext: string
  grandSlamCount: string
  trophyIcon: string
  trophyLabel: string
  footerBrand: string
  footerHandle: string
  recentFormTitle: string
  recentFormResults: string[]
  clayLabel: string
  grassLabel: string
  hardLabel: string
  matchesLabel: string
  overallRecordLabel: string
}

interface TextStyles {
  surfaceSize: number
  footerSize: number
  accentColor: string
  primaryColor: string
  secondaryColor: string
}

export default function MediaBuilderPage() {
  const [csvData, setCsvData] = useState<MatchData[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [customPlayerImage, setCustomPlayerImage] = useState<string | null>(null)
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [cardType, setCardType] = useState<'sinner' | 'alt'>('sinner')
  const [is2024Era, setIs2024Era] = useState(false)
  const [formKey, setFormKey] = useState(0) // Add key to force re-render
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hoveredField, setHoveredField] = useState<string | null>(null) // Track hovered form field
  const { user, loading } = useAuth()

  // Navigation links configuration
  const navLinks = [
    { href: "/#picks", label: "Daily Picks" },
    { href: "/#premium", label: "Premium" },
    { href: "/#analysis", label: "Analysis" },
    { href: "/media-builder", label: "Media Builder" },
    { href: "/#contact", label: "Contact" },
  ]

  // Force dark mode for this page
  useEffect(() => {
    // Store the current theme
    const currentTheme = document.documentElement.classList.contains('dark')
    const storedTheme = localStorage.getItem('theme')
    
    // Force dark mode
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
    
    // Cleanup function to restore previous theme when leaving the page
    return () => {
      if (storedTheme === 'light' || (!storedTheme && !currentTheme)) {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      }
    }
  }, [])
  
  const [customContent, setCustomContent] = useState<CustomContent>({
    playerName: "Jannik Sinner",
    atpRank: "#1",
    season: "2024 Season",
    winRate: "91%",
    winRateLabel: "WIN RATE",
    overallRecord: "73-7",
    totalMatches: "80",
    clayRecord: "15-3",
    clayPercentage: "83%",
    grassRecord: "7-1", 
    grassPercentage: "88%",
    hardRecord: "51-3",
    hardPercentage: "94%",
    highlightsTitle: "2024 Season Highlights",
    highlightsSubtext: "First Italian to win 2 Grand Slams in a year",
    grandSlamCount: "2",
    trophyIcon: "trophy",
    trophyLabel: "Grand Slams",
    footerBrand: "TennisMenace Analytics",
    footerHandle: "@TmTennisX",
    recentFormTitle: "End of Season Form",
    recentFormResults: ["W", "W", "W", "W", "W", "W"],
    clayLabel: "Clay",
    grassLabel: "Grass", 
    hardLabel: "Hard",
    matchesLabel: "MATCHES",
    overallRecordLabel: "OVERALL RECORD"
  })
  const [textStyles, setTextStyles] = useState<TextStyles>({
    surfaceSize: 1, // text-lg
    footerSize: 0, // text-sm
    accentColor: '#60a5fa', // blue-400
    primaryColor: '#ffffff', // white
    secondaryColor: '#d1d5db' // gray-300
  })
  const [currentTheme, setCurrentTheme] = useState<CardTheme>({
    id: 'us-open-night',
    name: 'US Open Night',
    background: 'bg-gradient-to-br from-blue-900 to-indigo-900',
    accent: 'text-blue-300',
    textPrimary: 'text-white',
    textSecondary: 'text-blue-100',
    border: 'border-blue-400/30'
  })
  const cardRef = useRef<HTMLDivElement>(null)

  // Available themes
  const themes: CardTheme[] = [
    {
      id: 'wimbledon-green',
      name: 'Wimbledon',
      background: 'bg-gradient-to-br from-green-800 to-green-900',
      accent: 'text-green-300',
      textPrimary: 'text-white',
      textSecondary: 'text-green-100',
      border: 'border-green-400/30'
    },
    {
      id: 'french-open-clay',
      name: 'Roland Garros',
      background: 'bg-gradient-to-br from-orange-700 to-red-800',
      accent: 'text-orange-200',
      textPrimary: 'text-white',
      textSecondary: 'text-orange-100',
      border: 'border-orange-300/40'
    },
    {
      id: 'us-open-night',
      name: 'US Open Night',
      background: 'bg-gradient-to-br from-blue-900 to-indigo-900',
      accent: 'text-blue-300',
      textPrimary: 'text-white',
      textSecondary: 'text-blue-100',
      border: 'border-blue-400/30'
    },
    {
      id: 'australian-heat',
      name: 'Australian Heat',
      background: 'bg-gradient-to-br from-yellow-600 to-orange-700',
      accent: 'text-yellow-200',
      textPrimary: 'text-white',
      textSecondary: 'text-yellow-100',
      border: 'border-yellow-300/40'
    },
    {
      id: 'masters-purple',
      name: 'Masters',
      background: 'bg-gradient-to-br from-purple-800 to-violet-900',
      accent: 'text-purple-300',
      textPrimary: 'text-white',
      textSecondary: 'text-purple-100',
      border: 'border-purple-400/30'
    },
    {
      id: 'davis-cup-navy',
      name: 'Davis Cup',
      background: 'bg-gradient-to-br from-slate-700 to-slate-900',
      accent: 'text-slate-300',
      textPrimary: 'text-white',
      textSecondary: 'text-slate-200',
      border: 'border-slate-400/30'
    },
    {
      id: 'miami-vice',
      name: 'Miami Vice',
      background: 'bg-gradient-to-br from-pink-700 to-cyan-800',
      accent: 'text-pink-300',
      textPrimary: 'text-white',
      textSecondary: 'text-cyan-100',
      border: 'border-pink-400/40'
    },
    {
      id: 'forest-shadow',
      name: 'Forest Shadow',
      background: 'bg-gradient-to-br from-emerald-900 to-gray-900',
      accent: 'text-emerald-400',
      textPrimary: 'text-gray-100',
      textSecondary: 'text-emerald-200',
      border: 'border-emerald-500/30'
    },
    {
      id: 'sunset-court',
      name: 'Sunset Court',
      background: 'bg-gradient-to-br from-rose-700 to-amber-800',
      accent: 'text-rose-200',
      textPrimary: 'text-white',
      textSecondary: 'text-amber-100',
      border: 'border-rose-300/40'
    }
  ]

  // Load sample data on component mount
  useEffect(() => {
    loadSinner2024Data()
  }, [])

  const loadSinner2024Data = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/data/sinner2024.csv')
      const csvText = await response.text()
      const data = parseSinnerCSV(csvText)
      setCsvData(data)
      generateSinnerStats(data)
      setIs2024Era(true)
      // Set Sinner's 2024 image
      setCustomPlayerImage('/sinner2024.png')
    } catch (error) {
      console.error('Error loading Sinner 2024 data:', error)
    }
    setIsLoading(false)
  }

  const parseCSV = (csvText: string): MatchData[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    
    return lines.slice(1).map(line => {
      const values = line.split(',')
      const result = values[6] || ''
      const score = values[7] || ''
      
      // Determine if it's a win based on result text
      // This is a generic parser - specific player parsers should be used for accurate results
      const isWin = result.toLowerCase().includes('win') || result.includes(' d. ')
      
      return {
        date: values[0] || '',
        tournament: values[1] || '',
        surface: values[2] || '',
        round: values[3] || '',
        rank: values[4] || '',
        opponentRank: values[5] || '',
        result: result,
        score: score,
        isWin
      }
    })
  }

  const parseFedererCSV = (csvText: string): MatchData[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    // Skip header line
    
    return lines.slice(1).map(line => {
      const values = line.split(',')
      const tournament = values[1] || ''
      const surface = values[4] || ''
      const round = values[6] || ''
      const opponent = values[7] || ''
      const result = values[8] || ''
      const score = values[9] || ''
      
      // Determine if it's a win based on result (W or L)
      const isWin = result.trim() === 'W'
      
      return {
        date: values[2] || '',
        tournament,
        surface,
        round,
        rank: '1', // Federer was #1 in 2006
        opponentRank: '',
        result: `${isWin ? 'Federer d.' : 'd. Federer'} ${opponent}`,
        score: score.replace(/"/g, ''), // Remove quotes from score
        isWin
      }
    })
  }

  const parseSinnerCSV = (csvText: string): MatchData[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    
    return lines.slice(1).map(line => {
      // Handle CSV with quoted fields
      const values = line.split(',').map(val => val.trim())
      
      if (values.length < 6) return null
      
      const date = values[0] || ''
      const tournament = values[1] || ''
      const surface = values[2] || 'Hard'
      const sinnerRank = values[3] || '1'
      const opponentRank = values[4] || ''
      const matchup = values[5] || ''
      const score = values[6] || ''
      
      // Skip retired matches
      if (score.includes('RET')) return null
      
      // Determine if it's a win based on matchup
      const isWin = matchup.includes('Sinner d.')
      
      // Extract opponent name from matchup
      let opponent = ''
      if (isWin) {
        // "Sinner d. Opponent" format
        const match = matchup.match(/Sinner d\. (.+?)( \[|$)/)
        opponent = match ? match[1] : ''
      } else {
        // "Opponent d. Sinner" format  
        const match = matchup.match(/(.+?) d\. .*Sinner/)
        opponent = match ? match[1] : ''
      }
      
      // Clean up opponent name (remove seeds, rankings)
      opponent = opponent.replace(/^\([^)]+\)/, '').trim()
      
      return {
        date,
        tournament,
        surface,
        round: '', // Not explicitly in this CSV format
        rank: sinnerRank,
        opponentRank,
        result: matchup,
        score,
        isWin
      }
    }).filter(match => match !== null) as MatchData[]
  }

  const generateStats = (data: MatchData[]) => {
    if (data.length === 0) return

    // Extract player name from first result
    const firstResult = data[0].result
    let playerName = 'Player'
    
    // Try to extract player name from result
    const nameMatch = firstResult.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/)
    if (nameMatch) playerName = nameMatch[0]

    // Get current rank from most recent match
    const currentRank = parseInt(data[0].rank) || 0

    const wins = data.filter(match => match.isWin).length
    const losses = data.length - wins
    const winPercentage = data.length > 0 ? (wins / data.length) * 100 : 0

    // Calculate surface records
    const surfaceRecords: { [surface: string]: { wins: number; losses: number; percentage: number } } = {}
    
    data.forEach(match => {
      const surface = match.surface
      if (!surfaceRecords[surface]) {
        surfaceRecords[surface] = { wins: 0, losses: 0, percentage: 0 }
      }
      
      if (match.isWin) {
        surfaceRecords[surface].wins++
      } else {
        surfaceRecords[surface].losses++
      }
    })

    // Calculate percentages for each surface
    Object.keys(surfaceRecords).forEach(surface => {
      const total = surfaceRecords[surface].wins + surfaceRecords[surface].losses
      surfaceRecords[surface].percentage = total > 0 ? (surfaceRecords[surface].wins / total) * 100 : 0
    })

    // Get last 6 matches (most recent first)
    const last6Matches = data.slice(0, 6)

    setPlayerStats({
      playerName,
      currentRank,
      wins,
      losses,
      winPercentage,
      last6Matches,
      totalMatches: data.length,
      surfaceRecords
    })
  }

  const generateFedererStats = (data: MatchData[]) => {
    if (data.length === 0) return

    const playerName = 'Roger Federer'
    const currentRank = 1 // He was #1

    const wins = data.filter(match => match.isWin).length
    const losses = data.length - wins
    const winPercentage = data.length > 0 ? (wins / data.length) * 100 : 0

    // Calculate surface records
    const surfaceRecords: { [surface: string]: { wins: number; losses: number; percentage: number } } = {}
    
    data.forEach(match => {
      const surface = match.surface
      if (!surfaceRecords[surface]) {
        surfaceRecords[surface] = { wins: 0, losses: 0, percentage: 0 }
      }
      
      if (match.isWin) {
        surfaceRecords[surface].wins++
      } else {
        surfaceRecords[surface].losses++
      }
    })

    // Calculate percentages for each surface
    Object.keys(surfaceRecords).forEach(surface => {
      const total = surfaceRecords[surface].wins + surfaceRecords[surface].losses
      surfaceRecords[surface].percentage = total > 0 ? (surfaceRecords[surface].wins / total) * 100 : 0
    })

    // Get last 6 matches (reverse order since CSV is chronological)
    const last6Matches = data.slice(-6).reverse()

    setPlayerStats({
      playerName,
      currentRank,
      wins,
      losses,
      winPercentage,
      last6Matches,
      totalMatches: data.length,
      surfaceRecords
    })
  }

  const generateSinnerStats = (data: MatchData[]) => {
    if (data.length === 0) return

    const playerName = 'Jannik Sinner'
    const currentRank = 1 // He was #1 in 2024

    const wins = data.filter(match => match.isWin).length
    const losses = data.length - wins
    const winPercentage = data.length > 0 ? (wins / data.length) * 100 : 0

    // Calculate surface records
    const surfaceRecords: { [surface: string]: { wins: number; losses: number; percentage: number } } = {}
    
    data.forEach(match => {
      const surface = match.surface
      if (!surfaceRecords[surface]) {
        surfaceRecords[surface] = { wins: 0, losses: 0, percentage: 0 }
      }
      
      if (match.isWin) {
        surfaceRecords[surface].wins++
      } else {
        surfaceRecords[surface].losses++
      }
    })

    // Calculate percentages for each surface
    Object.keys(surfaceRecords).forEach(surface => {
      const total = surfaceRecords[surface].wins + surfaceRecords[surface].losses
      surfaceRecords[surface].percentage = total > 0 ? (surfaceRecords[surface].wins / total) * 100 : 0
    })

    // Get last 6 matches (data is already in reverse chronological order - most recent first)
    const last6Matches = data.slice(0, 6)

    setPlayerStats({
      playerName,
      currentRank,
      wins,
      losses,
      winPercentage,
      last6Matches,
      totalMatches: data.length,
      surfaceRecords
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setIsLoading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        const csvText = e.target?.result as string
        const data = parseCSV(csvText)
        setCsvData(data)
        generateStats(data)
        setIsLoading(false)
      }
      reader.readAsText(file)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setCustomPlayerImage(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const formatResult = (result: string) => {
    // Clean up the result text for better display
    return result
      .replace(/\[.*?\]/g, '') // Remove country codes
      .replace(/\(.*?\)/g, '') // Remove seeds and rankings in parentheses
      .replace(/\(\d+\)/g, '') // Remove additional numeric rankings
      .trim()
  }

  const getMatchResult = (match: MatchData) => {
    return match.isWin ? 'W' : 'L'
  }

  const getMatchResultColor = (isWin: boolean) => {
    return isWin ? 'text-green-500' : 'text-red-500'
  }

  // Flexible card rendering system
  const renderCardByType = () => {
    switch (cardType) {
      case 'sinner':
        return renderSinnerCard()
      case 'alt':
        // In custom mode, force render season card instead of match card
        if (isCustomMode) {
          return renderSinnerCard()
        }
        return <MatchCard ref={cardRef} />
      default:
        return renderSinnerCard()
    }
  }

  const renderBlankCard = () => (
    <div 
      ref={cardRef}
      className="stat-card bg-gradient-to-br from-gray-800 to-slate-900 flex items-center justify-center"
    >
      <div className="text-center text-white">
        <div className="text-6xl font-bold mb-4 text-gray-400">?</div>
        <h3 className="text-xl font-semibold mb-2">Blank Card</h3>
        <p className="text-gray-400">Future card layout placeholder</p>
      </div>
    </div>
  )

  const renderSinnerCard = () => (
    <div 
      ref={cardRef} 
      className={`w-[800px] h-[450px] ${currentTheme.background} rounded-3xl overflow-hidden relative`}
      style={{ aspectRatio: '16/9' }}
    >
      {/* Hero Section with Player Image */}
      <div className="relative h-full">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={customPlayerImage || (
              isCustomMode 
                ? (customContent.playerName.toLowerCase().includes('bublik') ? '/bublik.png' : '/placeholder-user.jpg')
                : (playerStats?.playerName.includes('Bublik') ? '/bublik.png' : '/placeholder-user.jpg')
            )} 
            alt={isCustomMode ? customContent.playerName : playerStats?.playerName}
            className="w-full h-full object-cover opacity-25"
          />
          <div className={`absolute inset-0 ${
            currentTheme.id === 'default' ? 'bg-gradient-to-r from-black/90 via-black/70 to-black/50' :
            currentTheme.id === 'tennis-green' ? 'bg-gradient-to-r from-green-900/90 via-green-800/70 to-emerald-900/50' :
            currentTheme.id === 'royal-blue' ? 'bg-gradient-to-r from-blue-900/90 via-blue-800/70 to-indigo-900/50' :
            currentTheme.id === 'sunset' ? 'bg-gradient-to-r from-orange-900/90 via-red-800/70 to-pink-900/50' :
            'bg-gradient-to-r from-gray-900/90 via-gray-800/70 to-slate-900/50'
          }`}></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 p-8 h-full flex flex-col justify-between">
          {/* Top Section - Player Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full overflow-hidden border-4 ${currentTheme.border} shadow-2xl`}>
                <img 
                  src={customPlayerImage || (
                    isCustomMode 
                      ? (customContent.playerName.toLowerCase().includes('bublik') ? '/bublik.png' : '/placeholder-user.jpg')
                      : (playerStats?.playerName.includes('Bublik') ? '/bublik.png' : '/placeholder-user.jpg')
                  )} 
                  alt={isCustomMode ? customContent.playerName : playerStats?.playerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 
                  className={`text-2xl font-bold mb-1 transition-all duration-200 ${
                    hoveredField === 'playerName' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                  }`}
                  style={{ 
                    color: isCustomMode ? textStyles.primaryColor : 'inherit'
                  }}
                >
                  {isCustomMode ? customContent.playerName : playerStats?.playerName}
                </h1>
                <div 
                  className={`text-lg font-semibold transition-all duration-200 ${
                    hoveredField === 'atpRank' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                  }`}
                  style={{ 
                    color: isCustomMode ? textStyles.accentColor : 'inherit'
                  }}
                >
                  {isCustomMode ? customContent.atpRank : `ATP Rank #${playerStats?.currentRank}`}
                </div>
                <div 
                  className={`text-sm transition-all duration-200 ${
                    hoveredField === 'season' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                  }`}
                  style={{ 
                    color: isCustomMode ? textStyles.secondaryColor : 'inherit'
                  }}
                >
                  {isCustomMode ? customContent.season : 
                 is2024Era ? '2024 Season' : '2025 Season'}
                </div>
              </div>
            </div>
            
            {/* Win Percentage Highlight */}
            <div className="text-right">
              <div 
                className={`text-4xl font-bold mb-1 transition-all duration-200 ${
                  hoveredField === 'winRate' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                }`}
                style={{ 
                  color: isCustomMode ? textStyles.accentColor : 'inherit'
                }}
              >
                {isCustomMode ? customContent.winRate : `${playerStats?.winPercentage.toFixed(0)}%`}
              </div>
              <div 
                className={`text-xs uppercase tracking-wide transition-all duration-200 ${
                  hoveredField === 'winRateLabel' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                }`}
                style={{ 
                  color: isCustomMode ? textStyles.secondaryColor : 'inherit'
                }}
              >
                {isCustomMode ? customContent.winRateLabel : "Win Rate"}
              </div>
            </div>
          </div>

          {/* Middle Section - Stats */}
          <div className="space-y-4">
            {/* Overall Record */}
            <div className="flex justify-between items-center">
              <div>
                <div 
                  className={`text-xl font-bold transition-all duration-200 ${
                    hoveredField === 'overallRecord' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                  }`}
                  style={{ 
                    color: isCustomMode ? textStyles.primaryColor : 'inherit'
                  }}
                >
                  {isCustomMode ? customContent.overallRecord : `${playerStats?.wins}-${playerStats?.losses}`}
                </div>
                <div 
                  className={`text-xs uppercase`}
                  style={{ 
                    color: isCustomMode ? textStyles.secondaryColor : 'inherit'
                  }}
                >
                  {isCustomMode ? customContent.overallRecordLabel : "Overall Record"}
                </div>
              </div>
              <div>
                <div 
                  className={`text-xl font-bold transition-all duration-200 ${
                    hoveredField === 'totalMatches' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                  }`}
                  style={{ 
                    color: isCustomMode ? textStyles.primaryColor : 'inherit'
                  }}
                >
                  {isCustomMode ? customContent.totalMatches : playerStats?.totalMatches}
                </div>
                <div 
                  className={`text-xs uppercase`}
                  style={{ 
                    color: isCustomMode ? textStyles.secondaryColor : 'inherit'
                  }}
                >
                  {isCustomMode ? customContent.matchesLabel : "Matches"}
                </div>
              </div>
            </div>

            {/* Surface Records */}
            <div className="grid grid-cols-3 gap-3">
              {isCustomMode ? (
                <>
                  <div className="text-center">
                    <div 
                      className={`text-sm font-bold transition-all duration-200 ${
                        hoveredField === 'clayRecord' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                      }`}
                      style={{ 
                        color: textStyles.primaryColor
                      }}
                    >
                      {customContent.clayRecord}
                    </div>
                    <div 
                      className={`text-xs transition-all duration-200 ${
                        hoveredField === 'clayLabel' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                      }`}
                      style={{ 
                        color: textStyles.secondaryColor
                      }}
                    >
                      {customContent.clayLabel}
                    </div>
                    <div 
                      className={`text-xs transition-all duration-200 ${
                        hoveredField === 'clayPercentage' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                      }`}
                      style={{ 
                        color: textStyles.accentColor
                      }}
                    >
                      {customContent.clayPercentage}
                    </div>
                  </div>
                  <div className="text-center">
                    <div 
                      className={`text-sm font-bold transition-all duration-200 ${
                        hoveredField === 'grassRecord' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                      }`}
                      style={{ 
                        color: textStyles.primaryColor
                      }}
                    >
                      {customContent.grassRecord}
                    </div>
                    <div 
                      className={`text-xs transition-all duration-200 ${
                        hoveredField === 'grassLabel' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                      }`}
                      style={{ 
                        color: textStyles.secondaryColor
                      }}
                    >
                      {customContent.grassLabel}
                    </div>
                    <div 
                      className={`text-xs transition-all duration-200 ${
                        hoveredField === 'grassPercentage' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                      }`}
                      style={{ 
                        color: textStyles.accentColor
                      }}
                    >
                      {customContent.grassPercentage}
                    </div>
                  </div>
                  <div className="text-center">
                    <div 
                      className={`text-sm font-bold transition-all duration-200 ${
                        hoveredField === 'hardRecord' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                      }`}
                      style={{ 
                        color: textStyles.primaryColor
                      }}
                    >
                      {customContent.hardRecord}
                    </div>
                    <div 
                      className={`text-xs transition-all duration-200 ${
                        hoveredField === 'hardLabel' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                      }`}
                      style={{ 
                        color: textStyles.secondaryColor
                      }}
                    >
                      {customContent.hardLabel}
                    </div>
                    <div 
                      className={`text-xs transition-all duration-200 ${
                        hoveredField === 'hardPercentage' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                      }`}
                      style={{ 
                        color: textStyles.accentColor
                      }}
                    >
                      {customContent.hardPercentage}
                    </div>
                  </div>
                </>
              ) : (
                playerStats && Object.entries(playerStats.surfaceRecords).map(([surface, record]) => (
                  <div key={surface} className="text-center">
                    <div className={`text-sm font-bold ${currentTheme.textPrimary}`}>
                      {record.wins}-{record.losses}
                    </div>
                    <div className={`text-xs ${currentTheme.textSecondary}`}>
                      {surface}
                    </div>
                    <div className={`text-xs ${currentTheme.accent}`}>
                      {record.percentage.toFixed(0)}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Section - Recent Form */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 
                className={`text-lg font-semibold transition-all duration-200 ${
                  hoveredField === 'recentFormTitle' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                }`}
                style={{ 
                  color: isCustomMode ? textStyles.primaryColor : 'inherit'
                }}
              >
                {isCustomMode ? customContent.recentFormTitle : 
                 (is2024Era && !isCustomMode ? 'End of Season Form' : 'Recent Form')}
              </h3>
              <div className={`flex gap-1 transition-all duration-200 ${
                hoveredField === 'recentFormResults' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
              }`}>
                {/* Show sample form in custom mode or real data */}
                {isCustomMode ? (
                  // Custom recent form results - only show non-empty ones
                  customContent.recentFormResults
                    .filter(result => result.trim() !== '')
                    .map((result, index) => (
                    <div
                      key={index}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        result === 'W' 
                          ? 'bg-green-500 text-white' 
                          : result === 'L'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {result}
                    </div>
                  ))
                ) : (
                  playerStats?.last6Matches.map((match, index) => (
                    <div
                      key={index}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        match.isWin 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {getMatchResult(match)}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2024 Achievements / Latest Match Detail */}
            <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 border ${currentTheme.border}`}>
              {(is2024Era && !isCustomMode) || isCustomMode ? (
                /* 2024 Major Titles for Sinner or Custom Mode */
                <div className="flex items-center justify-between">
                  <div>
                    <div 
                      className={`font-medium text-sm transition-all duration-200 ${
                        hoveredField === 'highlightsTitle' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                      }`}
                      style={{ 
                        color: isCustomMode ? textStyles.primaryColor : 'inherit'
                      }}
                    >
                      {isCustomMode ? customContent.highlightsTitle : "2024 Season Highlights"}
                    </div>
                    <div 
                      className={`text-xs ${currentTheme.accent} transition-all duration-200 ${
                        hoveredField === 'highlightsSubtext' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                      }`}
                    >
                      {isCustomMode ? customContent.highlightsSubtext : "First Italian to win 2 Grand Slams in a year"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5" title="Grand Slams: Australian Open & US Open">
                      {isCustomMode ? (
                        // Render the selected number of trophy icons
                        Array.from({ length: parseInt(customContent.grandSlamCount) || 0 }, (_, index) => (
                          <span key={index}>{getTrophyIcon(customContent.trophyIcon)}</span>
                        ))
                      ) : (
                        <>
                          <Trophy className="h-3 w-3 text-blue-400" />
                          <Trophy className="h-3 w-3 text-blue-400" />
                        </>
                      )}
                      {(isCustomMode && parseInt(customContent.grandSlamCount) > 0) || (!isCustomMode) ? (
                        <span 
                          className={`text-xs ml-1 transition-all duration-200 ${
                            hoveredField === 'trophyLabel' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                          }`}
                          style={{ 
                            color: isCustomMode ? textStyles.secondaryColor : 'inherit'
                          }}
                        >
                          {isCustomMode ? customContent.trophyLabel : "Grand Slams"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className={`flex justify-between items-center mt-3 pt-3 border-t ${currentTheme.border}`}>
              <div 
                className={`text-xs transition-all duration-200 ${
                  hoveredField === 'footerBrand' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                }`}
                style={{ 
                  color: isCustomMode ? textStyles.secondaryColor : 'inherit'
                }}
              >
                {isCustomMode ? customContent.footerBrand : 'TennisMenace Analytics'}
              </div>
              <div 
                className={`text-xs font-medium transition-all duration-200 ${
                  hoveredField === 'footerHandle' ? 'ring-2 ring-cyan-400 ring-opacity-60 rounded px-1' : ''
                }`}
                style={{ 
                  color: isCustomMode ? textStyles.accentColor : 'inherit'
                }}
              >
                {isCustomMode ? customContent.footerHandle : '@TmTennisX'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const exportStatsCard = async () => {
    if (!cardRef.current || (!playerStats && !isCustomMode)) return
    
    setIsExporting(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#000000',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      })
      
      // Create download link
      const link = document.createElement('a')
      const playerName = isCustomMode ? customContent.playerName : playerStats?.playerName || 'Player'
      link.download = `${playerName.replace(/\s+/g, '_')}_${isCustomMode ? 'custom_' : ''}stats_2025.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Error exporting image:', error)
    }
    setIsExporting(false)
  }

  const resetStatsCard = () => {
    if (isCustomMode) {
      // In custom mode, clear all fields and force re-render
      setCustomContent({
        playerName: "",
        atpRank: "",
        season: "",
        winRate: "",
        winRateLabel: "",
        overallRecord: "",
        totalMatches: "",
        clayRecord: "",
        clayPercentage: "",
        grassRecord: "",
        grassPercentage: "",
        hardRecord: "",
        hardPercentage: "",
        highlightsTitle: "",
        highlightsSubtext: "",
        grandSlamCount: "",
        trophyIcon: "",
        trophyLabel: "",
        footerBrand: "",
        footerHandle: "",
        recentFormTitle: "",
        recentFormResults: ["", "", "", "", "", ""],
        clayLabel: "",
        grassLabel: "", 
        hardLabel: "",
        matchesLabel: "",
        overallRecordLabel: ""
      })
      
      // Reset text styles in custom mode
      setTextStyles({
        surfaceSize: 1,
        footerSize: 0,
        accentColor: '#60a5fa',
        primaryColor: '#ffffff',
        secondaryColor: '#d1d5db'
      })
      
      // Reset custom image
      setCustomPlayerImage(null)
      
      // Force re-render by incrementing key
      setFormKey(prev => prev + 1)
    } else {
      // In normal mode, reset everything and reload sample data
      // Reset custom image
      setCustomPlayerImage(null)
      
      // Reset text styles to defaults
      setTextStyles({
        surfaceSize: 1, // text-lg
        footerSize: 0, // text-sm
        accentColor: '#60a5fa', // blue-400
        primaryColor: '#ffffff', // white
        secondaryColor: '#d1d5db' // gray-300
      })
      
      // Reset theme to US Open Night
      setCurrentTheme({
        id: 'us-open-night',
        name: 'US Open Night',
        background: 'bg-gradient-to-br from-blue-900 to-indigo-900',
        accent: 'text-blue-300',
        textPrimary: 'text-white',
        textSecondary: 'text-blue-100',
        border: 'border-blue-400/30'
      })
      
      // Exit custom mode if active
      setIsCustomMode(false)
      
      // Reset 2024 era flag
      setIs2024Era(false)
      
      // Reset custom content to defaults
      setCustomContent({
        playerName: "Jannik Sinner",
        atpRank: "#1",
        season: "2024 Season",
        winRate: "91%",
        winRateLabel: "WIN RATE",
        overallRecord: "73-7",
        totalMatches: "80",
        clayRecord: "15-3",
        clayPercentage: "83%",
        grassRecord: "7-1", 
        grassPercentage: "88%",
        hardRecord: "51-3",
        hardPercentage: "94%",
        highlightsTitle: "2024 Season Highlights",
        highlightsSubtext: "First Italian to win 2 Grand Slams in a year",
        grandSlamCount: "2",
        trophyIcon: "trophy",
        trophyLabel: "Grand Slams",
        footerBrand: "TennisMenace Analytics",
        footerHandle: "@TmTennisX",
        recentFormTitle: "End of Season Form",
        recentFormResults: ["W", "W", "W", "W", "W", "W"],
        clayLabel: "Clay",
        grassLabel: "Grass", 
        hardLabel: "Hard",
        matchesLabel: "MATCHES",
        overallRecordLabel: "OVERALL RECORD"
      })
      
      // Reload sample data
      loadSinner2024Data()
    }
  }

  const toggleCustomMode = () => {
    setIsCustomMode(!isCustomMode)
    if (!isCustomMode) {
      // If currently on Match Card layout, force switch to Season Card
      if (cardType === 'alt') {
        setCardType('sinner')
      }
      
      // Always start with logical placeholder content when entering custom mode
      setCustomContent({
        playerName: "Name",
        atpRank: "Upper Left",
        season: "Upper Left Subtext",
        winRate: "Name Subtext",
        winRateLabel: "NAME TEXT",
        overallRecord: "Class Text",
        totalMatches: "Class Text",
        clayRecord: "Class Text",
        clayPercentage: "Class Subtext",
        grassRecord: "Class Text",
        grassPercentage: "Class Subtext",
        hardRecord: "Class Text",
        hardPercentage: "Class Subtext",
        highlightsTitle: "Highlight Title",
        highlightsSubtext: "Highlight Subtext",
        grandSlamCount: "2",
        trophyIcon: "trophy",
        trophyLabel: "Icon Text",
        footerBrand: "Footer Left",
        footerHandle: "Footer Right",
        recentFormTitle: "Recent Form",
        recentFormResults: ["W", "L", "", "", "", ""],
        clayLabel: "Class 1",
        grassLabel: "Class 2",
        hardLabel: "Class 3",
        matchesLabel: "Classes",
        overallRecordLabel: "Classes"
      })
    }
  }

  const updateCustomContent = (field: keyof CustomContent, value: string | string[]) => {
    setCustomContent(prev => ({ ...prev, [field]: value }))
  }

  const updateTextStyles = (field: keyof TextStyles, value: number | string) => {
    setTextStyles(prev => ({ ...prev, [field]: value }))
  }

  const resetTextColors = () => {
    setTextStyles(prev => ({
      ...prev,
      accentColor: '#60a5fa', // blue-400
      primaryColor: '#ffffff', // white
      secondaryColor: '#d1d5db' // gray-300
    }))
  }

  const exportCustomJSON = () => {
    const exportData = {
      customContent,
      textStyles,
      theme: currentTheme.id,
      customImage: customPlayerImage,
      timestamp: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.download = `${customContent.playerName.replace(/\s+/g, '_')}_custom_media.json`
    link.href = url
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const getSizeClass = (size: number) => {
    // Convert 0-100 scale to CSS font sizes
    if (size <= 10) return 'text-xs'
    if (size <= 20) return 'text-sm'
    if (size <= 30) return 'text-base'
    if (size <= 40) return 'text-lg'
    if (size <= 50) return 'text-xl'
    if (size <= 60) return 'text-2xl'
    if (size <= 70) return 'text-3xl'
    if (size <= 80) return 'text-4xl'
    if (size <= 90) return 'text-5xl'
    return 'text-6xl' // 90-100
  }

  const getTrophyIcon = (iconType: string) => {
    switch (iconType) {
      case 'star':
        return <Star className="h-3 w-3 text-blue-400" />
      case 'crown':
        return <Crown className="h-3 w-3 text-blue-400" />
      case 'medal':
        return <Medal className="h-3 w-3 text-blue-400" />
      default:
        return <Trophy className="h-3 w-3 text-blue-400" />
    }
  }

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 md:px-8 flex justify-between items-center bg-background/80 backdrop-blur-sm border-b border-border theme-transition-bg theme-transition-border">
        <motion.a
          href="/"
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
          <div className="p-2 rounded-full bg-muted/50 cursor-not-allowed opacity-50" title="Dark mode (locked for media builder)">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
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
                        <div className="p-2 rounded-full bg-muted/50 cursor-not-allowed opacity-50" title="Dark mode (locked)">
                          <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        </div>
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
                    <div className="p-2 rounded-full bg-muted/50 cursor-not-allowed opacity-50" title="Dark mode (locked)">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Page Title */}
      <div className="container mx-auto px-4 pt-20 pb-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-2">
            <span className="text-foreground">media</span>
            <span className="text-primary"> builder</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create stunning tennis player statistics cards and visual content
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column - Controls */}
            <div className="space-y-4">
              {!isCustomMode ? (
                <>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Controls
                  </h2>
                  


                  {/* Custom Mode Toggle - Creative Design */}
                  <Button 
                    onClick={toggleCustomMode} 
                    className="w-full justify-start text-white border-0 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] group"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%)',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Edit3 className="h-5 w-5 mr-3 relative z-10" />
                    <span className="relative z-10 font-semibold">Enter Custom Mode</span>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </Button>

                  {/* Upload Player Image - Priority #2 */}
                  {!customPlayerImage ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="image-upload"
                      />
                      <label 
                        htmlFor="image-upload" 
                        className="flex items-center gap-2 w-full justify-start px-4 py-2 rounded-md cursor-pointer text-sm font-medium text-white transition-all duration-200"
                        style={{ 
                          background: 'linear-gradient(to right, rgba(37, 99, 235, 0.2), rgba(6, 182, 212, 0.2))',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        <Image className="h-4 w-4" />
                        Upload Player Image
                      </label>
                    </div>
                  ) : null}

                  {/* Card Type Selector */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">Card Layout</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => setCardType('sinner')}
                        variant={cardType === 'sinner' ? 'default' : 'outline'}
                        className="text-xs h-8"
                      >
                        Season Card
                      </Button>
                      <Button 
                        onClick={() => setCardType('alt')}
                        variant={cardType === 'alt' ? 'default' : 'outline'}
                        className="text-xs h-8"
                        disabled={isCustomMode}
                      >
                        Match Card
                      </Button>
                    </div>
                  </div>

                  {/* Export Button - Creative Design */}
                  {(playerStats || isCustomMode) && (
                    <Button 
                      onClick={exportStatsCard}
                      disabled={isExporting}
                      className="w-full justify-center text-white border-0 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 group"
                      style={{ 
                        background: isExporting 
                          ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.7) 0%, rgba(34, 197, 94, 0.7) 100%)'
                          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.7) 0%, rgba(217, 119, 6, 0.7) 100%)',
                        boxShadow: isExporting 
                          ? '0 8px 32px rgba(74, 222, 128, 0.2)'
                          : '0 8px 32px rgba(245, 158, 11, 0.2)',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                          <span className="font-semibold">Exporting...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-3 relative z-10 group-hover:animate-bounce" />
                          <span className="relative z-10 font-semibold">Export Stats Card</span>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                              <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </>
                      )}
                    </Button>
                  )}

                </>
              ) : (
                // Custom Mode Interface - Replaces all buttons
                <div className="bg-black border border-gray-700 rounded-md p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Custom Mode</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button 
                        onClick={toggleCustomMode}
                        className="h-6 px-2 text-xs bg-red-600/80 hover:bg-red-500/90 border-red-500/50 text-white"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Exit
                      </Button>
                    </div>
                  </div>

                  {/* Content Editing */}
                  <div key={formKey} className="space-y-1.5">
                    {/* Main Info - 3 columns */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <input
                        type="text"
                        value={customContent.playerName}
                        onChange={(e) => updateCustomContent('playerName', e.target.value)}
                        onMouseEnter={() => setHoveredField('playerName')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Player Name"
                      />
                      <input
                        type="text"
                        value={customContent.atpRank}
                        onChange={(e) => updateCustomContent('atpRank', e.target.value)}
                        onMouseEnter={() => setHoveredField('atpRank')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="ATP Rank"
                      />
                      <input
                        type="text"
                        value={customContent.season}
                        onChange={(e) => updateCustomContent('season', e.target.value)}
                        onMouseEnter={() => setHoveredField('season')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Season"
                      />
                    </div>

                    {/* Record Info - 3 columns */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <input
                        type="text"
                        value={customContent.winRate}
                        onChange={(e) => updateCustomContent('winRate', e.target.value)}
                        onMouseEnter={() => setHoveredField('winRate')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Win Rate"
                      />
                      <input
                        type="text"
                        value={customContent.overallRecord}
                        onChange={(e) => updateCustomContent('overallRecord', e.target.value)}
                        onMouseEnter={() => setHoveredField('overallRecord')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Overall Record"
                      />
                      <input
                        type="text"
                        value={customContent.totalMatches}
                        onChange={(e) => updateCustomContent('totalMatches', e.target.value)}
                        onMouseEnter={() => setHoveredField('totalMatches')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Total Matches"
                      />
                    </div>

                    {/* Win Rate Label - 1 column */}
                    <div className="grid grid-cols-1 gap-1.5">
                      <input
                        type="text"
                        value={customContent.winRateLabel}
                        onChange={(e) => updateCustomContent('winRateLabel', e.target.value)}
                        onMouseEnter={() => setHoveredField('winRateLabel')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Win Rate Label"
                      />
                    </div>

                    {/* Surface Records - 6 columns */}
                    <div className="grid grid-cols-6 gap-1">
                      <input
                        type="text"
                        value={customContent.clayRecord}
                        onChange={(e) => updateCustomContent('clayRecord', e.target.value)}
                        onMouseEnter={() => setHoveredField('clayRecord')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Clay"
                      />
                      <input
                        type="text"
                        value={customContent.clayPercentage}
                        onChange={(e) => updateCustomContent('clayPercentage', e.target.value)}
                        onMouseEnter={() => setHoveredField('clayPercentage')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Clay %"
                      />
                      <input
                        type="text"
                        value={customContent.grassRecord}
                        onChange={(e) => updateCustomContent('grassRecord', e.target.value)}
                        onMouseEnter={() => setHoveredField('grassRecord')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Grass"
                      />
                      <input
                        type="text"
                        value={customContent.grassPercentage}
                        onChange={(e) => updateCustomContent('grassPercentage', e.target.value)}
                        onMouseEnter={() => setHoveredField('grassPercentage')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Grass %"
                      />
                      <input
                        type="text"
                        value={customContent.hardRecord}
                        onChange={(e) => updateCustomContent('hardRecord', e.target.value)}
                        onMouseEnter={() => setHoveredField('hardRecord')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Hard"
                      />
                      <input
                        type="text"
                        value={customContent.hardPercentage}
                        onChange={(e) => updateCustomContent('hardPercentage', e.target.value)}
                        onMouseEnter={() => setHoveredField('hardPercentage')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Hard %"
                      />
                    </div>

                    {/* Labels - 4 columns */}
                    <div className="grid grid-cols-4 gap-1.5">
                      <input
                        type="text"
                        value={customContent.clayLabel}
                        onChange={(e) => updateCustomContent('clayLabel', e.target.value)}
                        onMouseEnter={() => setHoveredField('clayLabel')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Clay Label"
                      />
                      <input
                        type="text"
                        value={customContent.grassLabel}
                        onChange={(e) => updateCustomContent('grassLabel', e.target.value)}
                        onMouseEnter={() => setHoveredField('grassLabel')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Grass Label"
                      />
                      <input
                        type="text"
                        value={customContent.hardLabel}
                        onChange={(e) => updateCustomContent('hardLabel', e.target.value)}
                        onMouseEnter={() => setHoveredField('hardLabel')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Hard Label"
                      />
                      <input
                        type="text"
                        value={customContent.matchesLabel}
                        onChange={(e) => updateCustomContent('matchesLabel', e.target.value)}
                        onMouseEnter={() => setHoveredField('matchesLabel')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Matches Label"
                      />
                    </div>

                    {/* Recent Form */}
                    <div className="grid grid-cols-7 gap-1">
                      <input
                        type="text"
                        value={customContent.recentFormTitle}
                        onChange={(e) => updateCustomContent('recentFormTitle', e.target.value)}
                        onMouseEnter={() => setHoveredField('recentFormTitle')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Form Title"
                      />
                      {customContent.recentFormResults.map((result, index) => (
                        <input
                          key={index}
                          type="text"
                          value={result}
                          onChange={(e) => {
                            const newResults = [...customContent.recentFormResults]
                            newResults[index] = e.target.value
                            updateCustomContent('recentFormResults', newResults)
                          }}
                          onMouseEnter={() => setHoveredField('recentFormResults')}
                          onMouseLeave={() => setHoveredField(null)}
                          className="w-full px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white text-center"
                          placeholder={index < 2 ? "W" : index < 4 ? "L" : "W"}
                          maxLength={1}
                        />
                      ))}
                    </div>

                    {/* Highlights & Footer - 2 columns */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={customContent.highlightsTitle}
                        onChange={(e) => updateCustomContent('highlightsTitle', e.target.value)}
                        onMouseEnter={() => setHoveredField('highlightsTitle')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Highlights Title"
                      />
                      <input
                        type="text"
                        value={customContent.highlightsSubtext}
                        onChange={(e) => updateCustomContent('highlightsSubtext', e.target.value)}
                        onMouseEnter={() => setHoveredField('highlightsSubtext')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Highlights Subtext"
                      />
                    </div>

                    {/* Trophy Section - Compact */}
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {[
                          { icon: 'trophy', component: <Trophy className="h-4 w-4" /> },
                          { icon: 'star', component: <Star className="h-4 w-4" /> },
                          { icon: 'crown', component: <Crown className="h-4 w-4" /> },
                          { icon: 'medal', component: <Medal className="h-4 w-4" /> }
                        ].map(({ icon, component }) => (
                          <button
                            key={icon}
                            onClick={() => updateCustomContent('trophyIcon', icon)}
                            className={`flex-1 h-8 flex items-center justify-center rounded border-2 transition-all ${
                              customContent.trophyIcon === icon
                                ? 'border-green-500 bg-green-500/20 text-green-400'
                                : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            {component}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <div className="flex gap-1">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                              <button
                                key={count}
                                onClick={() => updateCustomContent('grandSlamCount', count.toString())}
                                className={`flex-1 h-6 text-xs rounded transition-all flex items-center justify-center ${
                                  customContent.grandSlamCount === count.toString()
                                    ? 'bg-green-600 text-white border border-green-500'
                                    : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'
                                }`}
                              >
                                {count}
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={customContent.trophyLabel}
                          onChange={(e) => updateCustomContent('trophyLabel', e.target.value)}
                          onMouseEnter={() => setHoveredField('trophyLabel')}
                          onMouseLeave={() => setHoveredField(null)}
                          className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                          placeholder="Trophy Label"
                        />
                      </div>
                    </div>

                    {/* Footer - 2 columns */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={customContent.footerBrand}
                        onChange={(e) => updateCustomContent('footerBrand', e.target.value)}
                        onMouseEnter={() => setHoveredField('footerBrand')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Footer Brand"
                      />
                      <input
                        type="text"
                        value={customContent.footerHandle}
                        onChange={(e) => updateCustomContent('footerHandle', e.target.value)}
                        onMouseEnter={() => setHoveredField('footerHandle')}
                        onMouseLeave={() => setHoveredField(null)}
                        className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 focus:ring-1 focus:ring-green-500 focus:outline-none text-xs text-white"
                        placeholder="Footer Handle"
                      />
                    </div>
                  </div>

                  {/* Compact Controls Section */}
                  <div className="space-y-2 border-t border-gray-700 pt-2">
                    {/* Theme Selector, Font Colors, and Image Upload - Combined */}
                    <div className="flex items-start justify-between gap-4">
                      {/* Themes */}
                      <div className="flex-shrink-0">
                        <div className="text-xs text-gray-400 mb-1">Themes</div>
                        <div className="flex gap-1">
                          {themes.map((theme) => (
                            <button
                              key={theme.id}
                              onClick={() => setCurrentTheme(theme)}
                              className={`flex-shrink-0 w-6 h-6 rounded ${theme.background} border-2 transition-all ${
                                currentTheme.id === theme.id
                                  ? 'border-green-400 ring-1 ring-green-400/50'
                                  : 'border-gray-600 hover:border-gray-500'
                              }`}
                              title={theme.name}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Font Colors */}
                      <div className="flex-shrink-0">
                        <div className="text-xs text-gray-400 mb-1">Colors</div>
                        <div className="flex gap-1 items-center">
                          <div className="flex gap-1">
                            <input
                              type="color"
                              value={textStyles.accentColor}
                              onChange={(e) => updateTextStyles('accentColor', e.target.value)}
                              className="w-6 h-6 rounded border border-gray-700 cursor-pointer"
                              title="Accent Color (Win Rate, Percentages)"
                            />
                            <input
                              type="color"
                              value={textStyles.primaryColor}
                              onChange={(e) => updateTextStyles('primaryColor', e.target.value)}
                              className="w-6 h-6 rounded border border-gray-700 cursor-pointer"
                              title="Primary Color (Player Name, Records)"
                            />
                            <input
                              type="color"
                              value={textStyles.secondaryColor}
                              onChange={(e) => updateTextStyles('secondaryColor', e.target.value)}
                              className="w-6 h-6 rounded border border-gray-700 cursor-pointer"
                              title="Secondary Color (Labels, Subtext)"
                            />
                          </div>
                          <button
                            onClick={resetTextColors}
                            className="p-1 rounded hover:bg-gray-700 transition-colors ml-1"
                            title="Reset colors to default"
                          >
                            <RotateCcw className="h-3 w-3 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="flex-shrink-0">
                        <div className="text-xs text-gray-400 mb-1">Image</div>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="flex items-center justify-center h-6 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors px-3">
                            <Image className="h-3 w-3 mr-1 text-gray-400" />
                            <span className="text-xs text-gray-300 whitespace-nowrap">
                              {customPlayerImage ? 'Change' : 'Upload'}
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Style Controls */}
                  <div className="space-y-1.5 border-t border-gray-700 pt-2">
                    {/* Export Options */}
                    <div className="flex gap-1 pt-2 border-t border-gray-700">
                      <Button 
                        onClick={exportStatsCard}
                        disabled={isExporting}
                        className="flex-1 h-7 text-xs bg-green-700 hover:bg-green-600 transition-all duration-200 text-white"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {isExporting ? 'Exporting...' : 'Export'}
                      </Button>
                      <Button 
                        onClick={exportCustomJSON}
                        className="flex-1 h-7 text-xs bg-blue-700 hover:bg-blue-600 transition-all duration-200 text-white"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        JSON
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Stats Card */}
            <div className="flex justify-center lg:justify-end">
              {(playerStats || isCustomMode || cardType !== 'sinner') ? (
                renderCardByType()
              ) : (
                /* Empty State in Right Column */
                !isLoading && (
                  <Card className="bg-card border-border w-[800px] h-[450px] flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-card-foreground mb-2">
                        No Data Loaded
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Upload a CSV file or load sample data to get started.
                      </p>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Processing data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
