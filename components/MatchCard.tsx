"use client"

import React, { forwardRef, useState, useEffect } from 'react'

interface MatchCardProps {
  className?: string
}

interface MatchData {
  date: string
  tournament: string
  surface: string
  round: string
  player: string
  playerRank: string
  opponent: string
  opponentRank: string
  result: string
  score: string
  matchPointsSaved?: string
  duration?: string
  stat1?: string
  stat2?: string
}

interface MatchCardTheme {
  id: string
  name: string
  background: string
  accent: string
  textPrimary: string
  textSecondary: string
  border: string
  highlight: string
  scoreColor: string
}

const MatchCard = forwardRef<HTMLDivElement, MatchCardProps>(({ className = "" }, ref) => {
  const [matchData, setMatchData] = useState<MatchData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Match Season Card theme exactly - US Open Night with soft gradients
  const matchTheme: MatchCardTheme = {
    id: 'us-open-night',
    name: 'US Open Night',
    background: 'bg-gradient-to-br from-blue-900 to-indigo-900',
    accent: 'text-blue-300',
    textPrimary: 'text-white',
    textSecondary: 'text-blue-100',
    border: 'border-blue-400/30',
    highlight: 'text-blue-300',
    scoreColor: 'text-blue-200'
  }

  // Load French Open finals data on component mount
  useEffect(() => {
    loadFrenchOpenFinalsData()
  }, [])

  const loadFrenchOpenFinalsData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/data/2025_RG_Finals.csv')
      const csvText = await response.text()
      const parsedData = parseMatchCSV(csvText)
      setMatchData(parsedData)
    } catch (error) {
      console.error('Error loading French Open finals data:', error)
    }
    setIsLoading(false)
  }

  const parseMatchCSV = (csvText: string): MatchData | null => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) return null

    const dataLine = lines[1]
    // Parse CSV with quoted strings
    const values = dataLine.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || []
    const cleanValues = values.map(val => val.replace(/^"(.*)"$/, '$1').trim())

    if (cleanValues.length < 7) return null

    // Extract player names and ranks from the player fields
    const playerField = cleanValues[4] || ''
    const opponentField = cleanValues[5] || ''
    
    // Parse "Carlos Alcaraz #2" format
    const playerMatch = playerField.match(/^(.*?)\s*#(\d+)$/)
    const opponentMatch = opponentField.match(/^(.*?)\s*#(\d+)$/)

    const player = playerMatch ? playerMatch[1].trim() : playerField
    const playerRank = playerMatch ? `#${playerMatch[2]}` : ''
    const opponent = opponentMatch ? opponentMatch[1].trim() : opponentField
    const opponentRank = opponentMatch ? `#${opponentMatch[2]}` : ''

    return {
      date: cleanValues[0] || '',
      tournament: cleanValues[1] || '',
      surface: cleanValues[2] || '',
      round: cleanValues[3] || '',
      player,
      playerRank,
      opponent,
      opponentRank,
      result: cleanValues[6] || '',
      score: cleanValues[7] || '',
      matchPointsSaved: cleanValues[8] || '',
      duration: cleanValues[9] || '',
      stat1: cleanValues[10] || '',
      stat2: cleanValues[11] || ''
    }
  }

  const parseScore = (score: string) => {
    // Parse "4-6 6-7(4) 6-4 7-6(3) 7-6(2)" format
    return score.split(' ').filter(set => set.trim())
  }

  const getWinner = (result: string) => {
    // Parse "(2)Alcaraz [SPA] d. (1)Jannik Sinner [ITA]" format
    const match = result.match(/\((\d+)\)([^[]+)\[([^\]]+)\]\s+d\.\s+\((\d+)\)([^[]+)\[([^\]]+)\]/)
    if (match) {
      return {
        winner: match[2].trim(),
        winnerSeed: match[1],
        winnerCountry: match[3],
        loser: match[5].trim(),
        loserSeed: match[4],
        loserCountry: match[6]
      }
    }
    return null
  }

  if (isLoading) {
    return (
      <div 
        ref={ref}
        className={`w-[800px] h-[450px] ${matchTheme.background} rounded-3xl overflow-hidden relative flex items-center justify-center`}
        style={{ aspectRatio: '16/9' }}
      >
        <div className="relative h-full w-full">
          <div className="absolute inset-0">
            <img 
              src="/rg2025.png"
              alt="Roland Garros 2025"
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50"></div>
          </div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-300 mx-auto mb-6"></div>
              <p className="text-blue-100 text-lg font-medium">
                Loading match data...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!matchData) {
    return (
      <div 
        ref={ref}
        className={`w-[800px] h-[450px] ${matchTheme.background} rounded-3xl overflow-hidden relative flex items-center justify-center`}
        style={{ aspectRatio: '16/9' }}
      >
        <div className="relative h-full w-full">
          <div className="absolute inset-0">
            <img 
              src="/rg2025.png"
              alt="Roland Garros 2025"
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50"></div>
          </div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-6 opacity-60">🎾</div>
              <h3 className="text-2xl font-bold mb-3 text-white">
                No Match Data
              </h3>
              <p className="text-blue-100 text-lg">
                Unable to load match information
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const scoreSets = parseScore(matchData.score)
  const matchResult = getWinner(matchData.result)

  return (
    <div 
      ref={ref}
      className={`w-[800px] h-[450px] ${matchTheme.background} rounded-3xl overflow-hidden relative ${className}`}
      style={{ aspectRatio: '16/9' }}
    >
      {/* Hero Section with Tournament Image - Exact Season Card Pattern */}
      <div className="relative h-full">
        {/* Background Image with Overlay - Exact Season Card Pattern */}
        <div className="absolute inset-0">
          <img 
            src="/rg2025.png"
            alt="Roland Garros 2025"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50"></div>
        </div>

        {/* Content Overlay - Exact Season Card Structure */}
        <div className="relative z-10 p-8 h-full flex flex-col justify-between">
          {/* Top Section - Tournament Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-28 h-28 rounded-xl overflow-hidden border-2 ${matchTheme.border} shadow-2xl`}>
                <img 
                  src="/rg2025.png"
                  alt="Tournament Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center h-28">
                <h1 className="text-2xl font-bold mb-1 text-white">
                  French Open Final 2025
                </h1>
                <div className="text-lg font-semibold text-blue-300">
                  {matchData.date}
                </div>
              </div>
            </div>
            
            {/* Surface Highlight */}
            <div className="text-right flex flex-col justify-center h-28">
              <div className="text-4xl font-bold mb-1 text-blue-300">
                {matchData.surface}
              </div>
              <div className="text-xs uppercase tracking-wide text-blue-100">
                Surface
              </div>
            </div>
          </div>

          {/* Middle Section - Match Details */}
          <div className="space-y-4">
            {matchResult && (
              <>
                {/* Match Result - Minimal Format */}
                <div className="text-center">
                  <div className="text-xl font-bold text-white">
                    {matchResult.winner} ({matchResult.winnerSeed}) def. {matchResult.loser} ({matchResult.loserSeed})
                  </div>
                </div>

                {/* Match Stats - Vertical List */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-blue-100">Final Score</div>
                    <div className="text-sm font-bold text-blue-300">
                      {matchData.score}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-blue-100">Duration</div>
                    <div className="text-sm font-bold text-blue-300">
                      {matchData.duration || '--'}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-blue-100">Match Points Saved</div>
                    <div className="text-sm font-bold text-blue-300">
                      {matchData.matchPointsSaved || '0'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom Section - Match Summary */}
          <div>
            {/* Match Summary */}
            <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 border ${matchTheme.border}`}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-blue-300">
                    {matchData.stat1 || "Historic Clay Court Battle"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div className="text-xs text-blue-300">
                    {matchData.stat2 || "Epic 5-set final on Philippe-Chatrier"}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`flex justify-between items-center mt-3 pt-3 border-t ${matchTheme.border}`}>
              <div className="text-xs text-blue-100">
                TennisMenace Analytics
              </div>
              <div className="text-xs font-medium text-blue-300">
                @TmTennisX
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

MatchCard.displayName = 'MatchCard'

export default MatchCard
