"use client"

import React, { forwardRef } from 'react'
import { Trophy, Star, Medal, Crown } from 'lucide-react'

interface AltStatCardProps {
  className?: string
}

interface AltCardTheme {
  id: string
  name: string
  background: string
  accent: string
  textPrimary: string
  textSecondary: string
  border: string
}

export const AltStatCard = forwardRef<HTMLDivElement, AltStatCardProps>(({ className = "" }, ref) => {
  // Independent state for the alternative card
  const altTheme: AltCardTheme = {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    background: 'bg-gradient-to-br from-slate-800 to-gray-900',
    accent: 'text-cyan-400',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    border: 'border-cyan-400/30'
  }

  // Sample data for the alternative card
  const altCardData = {
    playerName: "Carlos Alcaraz",
    title: "World No. 2",
    subtitle: "Spanish Sensation",
    mainStat: "87%",
    mainStatLabel: "Career Win Rate",
    leftColumn: {
      title: "Achievements",
      items: [
        { label: "Grand Slams", value: "4", icon: <Trophy className="h-4 w-4" /> },
        { label: "ATP Masters", value: "15", icon: <Star className="h-4 w-4" /> },
        { label: "ATP Titles", value: "22", icon: <Medal className="h-4 w-4" /> }
      ]
    },
    rightColumn: {
      title: "2025 Season",
      items: [
        { label: "Matches Won", value: "47" },
        { label: "Matches Lost", value: "8" },
        { label: "Titles", value: "6" }
      ]
    },
    highlights: [
      "Youngest World No. 1",
      "4 Grand Slam Champion",
      "Clay Court Specialist"
    ],
    recentForm: ["W", "W", "L", "W", "W"],
    footer: {
      brand: "TennisMenace Analytics",
      handle: "@TmTennisX"
    }
  }

  return (
    <div 
      ref={ref}
      className={`stat-card w-[800px] h-[450px] ${altTheme.background} rounded-3xl overflow-hidden relative ${className}`}
      style={{ aspectRatio: '16/9' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.3),transparent_50%)]"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-8 h-full flex flex-col">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center border-2 ${altTheme.border}`}>
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${altTheme.textPrimary}`}>
                {altCardData.playerName}
              </h1>
              <div className={`text-sm ${altTheme.accent} font-medium`}>
                {altCardData.title}
              </div>
              <div className={`text-xs ${altTheme.textSecondary}`}>
                {altCardData.subtitle}
              </div>
            </div>
          </div>
          
          {/* Main Stat Circle */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${altTheme.accent} mb-1`}>
              {altCardData.mainStat}
            </div>
            <div className={`text-xs uppercase tracking-wide ${altTheme.textSecondary}`}>
              {altCardData.mainStatLabel}
            </div>
          </div>
        </div>

        {/* Middle Section - Two Column Stats */}
        <div className="flex-1 grid grid-cols-2 gap-8">
          {/* Left Column - Achievements */}
          <div>
            <h3 className={`text-lg font-semibold ${altTheme.textPrimary} mb-4`}>
              {altCardData.leftColumn.title}
            </h3>
            <div className="space-y-3">
              {altCardData.leftColumn.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={altTheme.accent}>
                      {item.icon}
                    </div>
                    <span className={`text-sm ${altTheme.textSecondary}`}>
                      {item.label}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${altTheme.textPrimary}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Season Stats */}
          <div>
            <h3 className={`text-lg font-semibold ${altTheme.textPrimary} mb-4`}>
              {altCardData.rightColumn.title}
            </h3>
            <div className="space-y-3">
              {altCardData.rightColumn.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className={`text-sm ${altTheme.textSecondary}`}>
                    {item.label}
                  </span>
                  <span className={`text-lg font-bold ${altTheme.textPrimary}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-4">
          {/* Highlights */}
          <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 border ${altTheme.border}`}>
            <h4 className={`text-sm font-medium ${altTheme.textPrimary} mb-2`}>
              Career Highlights
            </h4>
            <div className="flex flex-wrap gap-2">
              {altCardData.highlights.map((highlight, index) => (
                <span 
                  key={index} 
                  className={`text-xs px-2 py-1 rounded-full bg-cyan-500/20 ${altTheme.accent}`}
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Form & Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-sm ${altTheme.textSecondary}`}>Recent Form:</span>
              <div className="flex gap-1">
                {altCardData.recentForm.map((result, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      result === 'W' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-right">
              <div className={`text-xs ${altTheme.textSecondary}`}>
                {altCardData.footer.brand}
              </div>
              <div className={`text-xs font-medium ${altTheme.accent}`}>
                {altCardData.footer.handle}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

AltStatCard.displayName = 'AltStatCard'

export default AltStatCard
