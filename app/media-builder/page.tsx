"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, BarChart3, Palette, ExternalLink, Image, X, RotateCcw } from "lucide-react"
import { toPng } from 'html-to-image'

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

export default function MediaBuilderPage() {
  const [csvData, setCsvData] = useState<MatchData[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [customPlayerImage, setCustomPlayerImage] = useState<string | null>(null)
  const [currentTheme, setCurrentTheme] = useState<CardTheme>({
    id: 'classic',
    name: 'Classic',
    background: 'bg-gradient-to-br from-slate-900 to-slate-800',
    accent: 'text-blue-400',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-300',
    border: 'border-slate-600/30'
  })
  const cardRef = useRef<HTMLDivElement>(null)

  // Available themes
  const themes: CardTheme[] = [
    {
      id: 'classic',
      name: 'Classic',
      background: 'bg-gradient-to-br from-slate-900 to-slate-800',
      accent: 'text-blue-400',
      textPrimary: 'text-white',
      textSecondary: 'text-slate-300',
      border: 'border-slate-600/30'
    },
    {
      id: 'tennis-court',
      name: 'Tennis Court',
      background: 'bg-gradient-to-br from-emerald-800 to-emerald-700',
      accent: 'text-emerald-300',
      textPrimary: 'text-white',
      textSecondary: 'text-emerald-100',
      border: 'border-emerald-400/30'
    },
    {
      id: 'professional',
      name: 'Professional',
      background: 'bg-gradient-to-br from-gray-800 to-gray-700',
      accent: 'text-amber-400',
      textPrimary: 'text-white',
      textSecondary: 'text-gray-200',
      border: 'border-gray-500/30'
    },
    {
      id: 'sunset-clay',
      name: 'Sunset Clay',
      background: 'bg-gradient-to-br from-orange-800 to-red-700',
      accent: 'text-orange-300',
      textPrimary: 'text-white',
      textSecondary: 'text-orange-100',
      border: 'border-orange-400/30'
    },
    {
      id: 'midnight-blue',
      name: 'Midnight Blue',
      background: 'bg-gradient-to-br from-slate-900 to-blue-900',
      accent: 'text-cyan-400',
      textPrimary: 'text-white',
      textSecondary: 'text-slate-300',
      border: 'border-cyan-400/30'
    },
    {
      id: 'championship',
      name: 'Championship',
      background: 'bg-gradient-to-br from-indigo-900 to-purple-800',
      accent: 'text-yellow-400',
      textPrimary: 'text-white',
      textSecondary: 'text-indigo-200',
      border: 'border-yellow-400/30'
    }
  ]

  // Load sample data on component mount
  useEffect(() => {
    loadSampleData()
  }, [])

  const loadSampleData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/data/bublik_sample_post.csv')
      const csvText = await response.text()
      const data = parseCSV(csvText)
      setCsvData(data)
      generateStats(data)
    } catch (error) {
      console.error('Error loading sample data:', error)
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
      // If result contains "Bublik d." then it's a win for Bublik
      // If result contains "d. Bublik" then it's a loss for Bublik
      const isWin = result.includes('Bublik d.') && !result.includes('d. Bublik')
      
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

  const generateStats = (data: MatchData[]) => {
    if (data.length === 0) return

    // Extract player name from first result
    const firstResult = data[0].result
    let playerName = 'Player'
    
    if (firstResult.includes('Bublik')) {
      playerName = 'Alexander Bublik'
    } else {
      // Try to extract player name from result
      const nameMatch = firstResult.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/)
      if (nameMatch) playerName = nameMatch[0]
    }

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

  const exportStatsCard = async () => {
    if (!cardRef.current || !playerStats) return
    
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
      link.download = `${playerStats.playerName.replace(/\s+/g, '_')}_stats_2025.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Error exporting image:', error)
    }
    setIsExporting(false)
  }

  const resetStatsCard = () => {
    setPlayerStats(null)
    setCsvData([])
    setCustomPlayerImage(null)
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Media Builder
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Upload a CSV file to generate player statistics and create media content.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column - Controls */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">Controls</h2>
              
              {/* Upload CSV - Priority #1 */}
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="csv-upload"
                />
                <label 
                  htmlFor="csv-upload" 
                  className="flex items-center gap-2 w-full justify-start px-4 py-2 rounded-md cursor-pointer bg-black hover:bg-green-600 hover:scale-105 transition-all duration-200 text-white border border-gray-700 text-sm font-medium"
                >
                  <Upload className="h-4 w-4" />
                  Upload CSV File
                </label>
              </div>

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
                    className="flex items-center gap-2 w-full justify-start px-4 py-2 rounded-md cursor-pointer bg-black hover:bg-green-600 hover:scale-105 transition-all duration-200 text-white border border-gray-700 text-sm font-medium"
                  >
                    <Image className="h-4 w-4" />
                    Upload Player Image
                  </label>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="image-upload-replace"
                    />
                    <label 
                      htmlFor="image-upload-replace" 
                      className="flex items-center gap-2 w-full justify-start px-4 py-2 rounded-md cursor-pointer bg-black hover:bg-green-600 hover:scale-105 transition-all duration-200 text-white border border-gray-700 text-sm font-medium"
                    >
                      <Image className="h-4 w-4" />
                      Change Image
                      <span className="text-xs text-green-400">✓</span>
                    </label>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => setCustomPlayerImage(null)}
                    className="px-3 bg-black hover:bg-green-600 hover:scale-105 transition-all duration-200 text-white border-gray-700"
                    title="Reset to default image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Export Button */}
              {playerStats && (
                <Button 
                  onClick={exportStatsCard}
                  disabled={isExporting}
                  className="w-full justify-start bg-black hover:bg-green-600 hover:scale-105 transition-all duration-200 text-white border-gray-700 disabled:opacity-50 disabled:hover:bg-black disabled:hover:scale-100"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Stats Card'}
                </Button>
              )}

              {/* CSV Builder Link */}
              <Button 
                asChild
                className="w-full justify-start bg-black hover:bg-green-600 hover:scale-105 transition-all duration-200 text-white border-gray-700"
              >
                <a 
                  href="https://docs.google.com/spreadsheets/d/1aJUVrcaeO6KzZgOf1vk4JHmLAW5AEEMhbn_rLJjrsl8/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View CSV Builder
                </a>
              </Button>
              
              {/* Load Sample Data */}
              <Button onClick={loadSampleData} disabled={isLoading} className="w-full justify-start bg-black hover:bg-green-600 hover:scale-105 transition-all duration-200 text-white border-gray-700 disabled:opacity-50 disabled:hover:bg-black disabled:hover:scale-100">
                <BarChart3 className="h-4 w-4 mr-2" />
                Load Sample Data (Bublik)
              </Button>

              {/* Reset Button */}
              <Button onClick={resetStatsCard} className="w-full justify-start bg-red-900/20 hover:bg-red-600/30 hover:scale-105 transition-all duration-200 text-white border-red-700/50">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Stats Card
              </Button>

              {/* Theme Selector with Icons */}
              <div className="bg-black border border-gray-700 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Palette className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-medium">Change Theme: {currentTheme.name}</span>
                  </div>
                  <div className="flex gap-1">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setCurrentTheme(theme)}
                        className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${
                          currentTheme.id === theme.id 
                            ? 'border-green-400 ring-1 ring-green-400/50' 
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                        style={{
                          background: theme.id === 'classic' ? 'linear-gradient(135deg, #0f172a, #1e293b)' :
                                     theme.id === 'tennis-court' ? 'linear-gradient(135deg, #065f46, #047857)' :
                                     theme.id === 'professional' ? 'linear-gradient(135deg, #374151, #4b5563)' :
                                     theme.id === 'sunset-clay' ? 'linear-gradient(135deg, #9a3412, #b91c1c)' :
                                     theme.id === 'midnight-blue' ? 'linear-gradient(135deg, #0f172a, #1e3a8a)' :
                                     'linear-gradient(135deg, #312e81, #7c3aed)'
                        }}
                        title={theme.name}
                      >
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats Card */}
            <div className="flex justify-center lg:justify-end">
              {playerStats && (
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
                        src={customPlayerImage || (playerStats.playerName.includes('Bublik') ? '/bublik.png' : '/placeholder-user.jpg')} 
                        alt={playerStats.playerName}
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
                              src={customPlayerImage || (playerStats.playerName.includes('Bublik') ? '/bublik.png' : '/placeholder-user.jpg')} 
                              alt={playerStats.playerName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h1 className={`text-3xl font-bold ${currentTheme.textPrimary} mb-1`}>
                              {playerStats.playerName}
                            </h1>
                            <div className={`text-lg ${currentTheme.accent} font-semibold`}>
                              ATP Rank #{playerStats.currentRank}
                            </div>
                            <div className={`text-sm ${currentTheme.textSecondary}`}>
                              2025 Season
                            </div>
                          </div>
                        </div>
                        
                        {/* Win Percentage Highlight */}
                        <div className="text-right">
                          <div className={`text-4xl font-bold ${currentTheme.accent} mb-1`}>
                            {playerStats.winPercentage.toFixed(0)}%
                          </div>
                          <div className={`text-xs ${currentTheme.textSecondary} uppercase tracking-wide`}>
                            Win Rate
                          </div>
                        </div>
                      </div>

                      {/* Middle Section - Stats */}
                      <div className="space-y-4">
                        {/* Overall Record */}
                        <div className="flex justify-between items-center">
                          <div>
                            <div className={`text-2xl font-bold ${currentTheme.textPrimary}`}>
                              {playerStats.wins}-{playerStats.losses}
                            </div>
                            <div className={`text-xs ${currentTheme.textSecondary} uppercase`}>
                              Overall Record
                            </div>
                          </div>
                          <div>
                            <div className={`text-2xl font-bold ${currentTheme.textPrimary}`}>
                              {playerStats.totalMatches}
                            </div>
                            <div className={`text-xs ${currentTheme.textSecondary} uppercase`}>
                              Matches
                            </div>
                          </div>
                        </div>

                        {/* Surface Records */}
                        <div className="grid grid-cols-3 gap-3">
                          {Object.entries(playerStats.surfaceRecords).map(([surface, record]) => (
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
                          ))}
                        </div>
                      </div>

                      {/* Bottom Section - Recent Form */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className={`text-lg font-semibold ${currentTheme.textPrimary}`}>Recent Form</h3>
                          <div className="flex gap-1">
                            {playerStats.last6Matches.map((match, index) => (
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
                            ))}
                          </div>
                        </div>

                        {/* Latest Match Detail */}
                        <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 border ${currentTheme.border}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={`${currentTheme.textPrimary} font-medium text-sm`}>
                                Latest: {formatResult(playerStats.last6Matches[0].result).split(' d. ')[1]?.split(' vs ')[0] || 'Opponent'}
                              </div>
                              <div className={`${currentTheme.textSecondary} text-xs`}>
                                {playerStats.last6Matches[0].tournament} • {playerStats.last6Matches[0].round}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-bold ${getMatchResultColor(playerStats.last6Matches[0].isWin)}`}>
                                {getMatchResult(playerStats.last6Matches[0])}
                              </div>
                              <div className={`${currentTheme.textSecondary} text-xs`}>
                                {playerStats.last6Matches[0].score.split(' ').slice(0, 2).join(' ')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className={`flex justify-between items-center mt-3 pt-3 border-t ${currentTheme.border}`}>
                          <div className={`text-xs ${currentTheme.textSecondary}`}>
                            TennisMenace Analytics
                          </div>
                          <div className={`text-xs ${currentTheme.accent} font-medium`}>
                            @TmTennisX
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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

          {/* Empty State */}
          {!playerStats && !isLoading && (
            <Card className="bg-card border-border">
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
          )}
        </div>
      </div>
    </div>
  )
}
