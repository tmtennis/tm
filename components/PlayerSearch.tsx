'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Trophy, TrendingUp, Target, Award, Pin, Sparkles, ChevronDown, ChevronUp, X, ChevronRight, Swords, TrendingDown, BarChart3 } from 'lucide-react';

interface H2HRecord {
  opponent: string;
  wins: number;
  losses: number;
  total: number;
  percentage: number;
}

interface H2HData {
  playerName: string;
  vsTop5: string;
  vsTop10: string;
  vsTop15: string;
  individualMatchups: { [key: string]: string };
}

interface Stats2024 {
  playerName: string;
  totalWins: number;
  totalLosses: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  surfaceStats: {
    Hard: { wins: number; losses: number };
    Clay: { wins: number; losses: number };
    Grass: { wins: number; losses: number };
  };
}

interface Player {
  rank: string;
  name: string;
  age: string;
  country: string;
  points: string;
  // ELO stats
  eloRank?: string;
  elo?: string;
  hardcourtEloRank?: string;
  hardcourtElo?: string;
  clayEloRank?: string;
  clayElo?: string;
  grassEloRank?: string;
  grassElo?: string;
  peakElo?: string;
  peakMonth?: string;
  atpRank?: string;
  // H2H stats
  h2hData?: H2HData;
  // 2024 season stats
  stats2024?: Stats2024;
}

export default function PlayerSearch() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedPlayers, setPinnedPlayers] = useState<Player[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [h2hData, setH2HData] = useState<Map<string, H2HData>>(new Map());
  const [stats2024Data, setStats2024Data] = useState<Map<string, Stats2024>>(new Map());
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'h2h'>('list');
  const [recommendedIndex, setRecommendedIndex] = useState(0);

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        // Load ATP rankings data
        const atpResponse = await fetch('/data/Rankings_July_2025 - Sheet1.csv');
        const atpCsvText = await atpResponse.text();
        
        // Load ELO rankings data
        const eloResponse = await fetch('/data/EloRankingsJuly2025.csv');
        const eloCsvText = await eloResponse.text();
        
        // Load H2H matrix data
        const h2hResponse = await fetch('/data/h2h_matrix_Sheet3.csv');
        const h2hCsvText = await h2hResponse.text();
        
        // Load 2024 ATP matches data
        const matches2024Response = await fetch('/data/atp_matches_2024.csv');
        const matches2024CsvText = await matches2024Response.text();
        
        let atpPlayers: any[] = [];
        let eloPlayers: any[] = [];
        let h2hMatrix: Map<string, H2HData> = new Map();
        let stats2024Map: Map<string, Stats2024> = new Map();
        
        // Parse H2H data first
        Papa.parse(h2hCsvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              // The player name is in the second column (first column after "Rank")
              const rowValues = Object.values(row);
              const playerName = rowValues[1] as string; // Second column contains player names
              
              if (playerName && playerName !== '' && playerName !== 'Rank' && typeof playerName === 'string') {
                const h2hRecord: H2HData = {
                  playerName,
                  vsTop5: row['vs. top 1-5'] || '',
                  vsTop10: row['vs. top 1-10'] || '',
                  vsTop15: row['vs top 1-15'] || '',
                  individualMatchups: {}
                };
                
                // Process individual matchups
                Object.keys(row).forEach(key => {
                  if (key.startsWith('vs. ') && !key.includes('top')) {
                    const opponent = key.replace('vs. ', '');
                    h2hRecord.individualMatchups[opponent] = row[key] || '';
                  }
                });
                
                h2hMatrix.set(playerName.toLowerCase(), h2hRecord);
              }
            });
            setH2HData(h2hMatrix);
          }
        });
        
        // Parse 2024 ATP matches data
        Papa.parse(matches2024CsvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const playerStats: Map<string, any> = new Map();
            
            results.data.forEach((match: any) => {
              const winnerName = match.winner_name?.trim();
              const loserName = match.loser_name?.trim();
              const surface = match.surface?.trim();
              
              if (!winnerName || !loserName || !surface) return;
              
              // Initialize player stats if not exists
              if (!playerStats.has(winnerName)) {
                playerStats.set(winnerName, {
                  wins: 0,
                  losses: 0,
                  matches: [],
                  surfaceStats: { Hard: { wins: 0, losses: 0 }, Clay: { wins: 0, losses: 0 }, Grass: { wins: 0, losses: 0 } }
                });
              }
              if (!playerStats.has(loserName)) {
                playerStats.set(loserName, {
                  wins: 0,
                  losses: 0,
                  matches: [],
                  surfaceStats: { Hard: { wins: 0, losses: 0 }, Clay: { wins: 0, losses: 0 }, Grass: { wins: 0, losses: 0 } }
                });
              }
              
              // Update winner stats
              const winnerStats = playerStats.get(winnerName)!;
              winnerStats.wins++;
              winnerStats.matches.push({ result: 'W', surface, date: match.tourney_date });
              if (winnerStats.surfaceStats[surface]) {
                winnerStats.surfaceStats[surface].wins++;
              }
              
              // Update loser stats
              const loserStats = playerStats.get(loserName)!;
              loserStats.losses++;
              loserStats.matches.push({ result: 'L', surface, date: match.tourney_date });
              if (loserStats.surfaceStats[surface]) {
                loserStats.surfaceStats[surface].losses++;
              }
            });
            
            // Calculate streaks and create final stats
            playerStats.forEach((stats, playerName) => {
              // Sort matches by date
              stats.matches.sort((a: any, b: any) => a.date - b.date);
              
              let longestWinStreak = 0;
              let longestLoseStreak = 0;
              let currentWinStreak = 0;
              let currentLoseStreak = 0;
              
              stats.matches.forEach((match: any) => {
                if (match.result === 'W') {
                  currentWinStreak++;
                  currentLoseStreak = 0;
                  longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
                } else {
                  currentLoseStreak++;
                  currentWinStreak = 0;
                  longestLoseStreak = Math.max(longestLoseStreak, currentLoseStreak);
                }
              });
              
              const stats2024: Stats2024 = {
                playerName,
                totalWins: stats.wins,
                totalLosses: stats.losses,
                longestWinStreak,
                longestLoseStreak,
                surfaceStats: stats.surfaceStats
              };
              
              stats2024Map.set(playerName.toLowerCase(), stats2024);
            });
            
            setStats2024Data(stats2024Map);
          }
        });
        
        // Parse ATP data
        Papa.parse(atpCsvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            atpPlayers = results.data.map((row: any) => ({
              rank: row['#'] || '',
              name: row['Name'] || '',
              age: row['Age'] || '',
              country: row['Ctry'] || '',
              points: row['Pts'] || ''
            }));
          }
        });
        
        // Parse ELO data
        Papa.parse(eloCsvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            eloPlayers = results.data.map((row: any) => ({
              name: row['Player'] || '',
              eloRank: row['Elo Rank'] || '',
              elo: row['Elo'] || '',
              hardcourtEloRank: row['Hardcourt Elo Rank'] || '',
              hardcourtElo: row['Hardcourt Elo'] || '',
              clayEloRank: row['Clay Elo Rank'] || '',
              clayElo: row['Clay Elo'] || '',
              grassEloRank: row['Grass Elo Rank'] || '',
              grassElo: row['Grass Elo'] || '',
              peakElo: row['Peak Elo'] || '',
              peakMonth: row['Peak Month'] || '',
              atpRank: row['ATP Rank'] || ''
            }));
            
            // Merge all data
            const mergedPlayers = atpPlayers.map(atpPlayer => {
              const eloData = eloPlayers.find(eloPlayer => 
                eloPlayer.name.toLowerCase() === atpPlayer.name.toLowerCase()
              );
              
              const h2hPlayerData = h2hMatrix.get(atpPlayer.name.toLowerCase());
              const stats2024PlayerData = stats2024Map.get(atpPlayer.name.toLowerCase());
              
              return {
                ...atpPlayer,
                ...eloData,
                h2hData: h2hPlayerData,
                stats2024: stats2024PlayerData
              };
            });
            
            setPlayers(mergedPlayers);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading player data:', error);
        setLoading(false);
      }
    };

    loadPlayerData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlayers([]);
    } else {
      const filtered = players.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlayers(filtered);
    }
    // Reset recommended index when search changes
    setRecommendedIndex(0);
  }, [searchTerm, players]);

  const handlePinPlayer = (player: Player) => {
    if (pinnedPlayers.length >= 3) return;
    if (pinnedPlayers.some(p => p.name === player.name)) return;
    setPinnedPlayers([...pinnedPlayers, player]);
    // Clear search after pinning
    setSearchTerm('');
  };

  const handleUnpinPlayer = (playerName: string) => {
    setPinnedPlayers(pinnedPlayers.filter(p => p.name !== playerName));
  };

  const handleClearPinned = () => {
    setPinnedPlayers([]);
    setCurrentView('list');
  };

  const isPlayerPinned = (playerName: string) => {
    return pinnedPlayers.some(p => p.name === playerName);
  };

  // Helper function to parse H2H record string (e.g., "5-9" -> {wins: 5, losses: 9})
  const parseH2HRecord = (recordString: string): H2HRecord | null => {
    if (!recordString || recordString === '') return null;
    const parts = recordString.split('-');
    if (parts.length !== 2) return null;
    
    const wins = parseInt(parts[0]);
    const losses = parseInt(parts[1]);
    const total = wins + losses;
    const percentage = total > 0 ? (wins / total) * 100 : 0;
    
    return {
      opponent: '',
      wins,
      losses,
      total,
      percentage
    };
  };

  // Get H2BtwPlayers between two players
  const getH2BtwPlayers = (player1: Player, player2: Player): H2HRecord | null => {
    console.log('Getting H2H between:', player1.name, 'and', player2.name);
    console.log('Player1 H2H data:', player1.h2hData);
    console.log('Player2 H2H data:', player2.h2hData);
    
    if (!player1.h2hData && !player2.h2hData) return null;
    
    // Check if player1 has a record against player2
    if (player1.h2hData?.individualMatchups) {
      const player1VsPlayer2 = player1.h2hData.individualMatchups[player2.name];
      console.log('Player1 vs Player2 record:', player1VsPlayer2);
      if (player1VsPlayer2) {
        const record = parseH2HRecord(player1VsPlayer2);
        if (record) {
          record.opponent = player2.name;
          return record;
        }
      }
    }
    
    // Check if player2 has a record against player1 (reverse it)
    if (player2.h2hData?.individualMatchups) {
      const player2VsPlayer1 = player2.h2hData.individualMatchups[player1.name];
      console.log('Player2 vs Player1 record:', player2VsPlayer1);
      if (player2VsPlayer1) {
        const record = parseH2HRecord(player2VsPlayer1);
        if (record) {
          return {
            opponent: player2.name,
            wins: record.losses,
            losses: record.wins,
            total: record.total,
            percentage: 100 - record.percentage
          };
        }
      }
    }
    
    return null;
  };

  // Get color based on win rate
  const getWinRateColor = (percentage: number): string => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Format win rate display
  const formatWinRate = (record: H2HRecord): string => {
    return `${record.wins}-${record.losses} (${record.percentage.toFixed(0)}%)`;
  };

  const handleTopPlayerClick = (playerName: string) => {
    setSearchTerm(playerName);
  };

  const getTopPlayers = () => {
    return players.slice(0, 3);
  };

  const isCardExpanded = (playerName: string) => {
    return expandedCards.has(playerName);
  };

  const toggleCardExpansion = (playerName: string) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(playerName)) {
      newExpandedCards.delete(playerName);
    } else {
      newExpandedCards.add(playerName);
    }
    setExpandedCards(newExpandedCards);
  };

  const getRecommendedPlayers = () => {
    // Get top 5 players that aren't already pinned and aren't the current search result
    return players
      .filter(player => 
        !pinnedPlayers.some(p => p.name === player.name) &&
        !filteredPlayers.some(f => f.name === player.name)
      )
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="text-center text-muted-foreground">Loading player data...</div>
          </div>
          <div className="lg:col-span-2">
            <Card className="theme-transition-bg theme-transition-border">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Target className="h-7 w-7 text-primary" />
                    <h3 className="text-2xl font-bold text-foreground">Pinned Players</h3>
                    <Badge variant="secondary" className="text-sm px-3 py-1">0/3</Badge>
                  </div>
                </div>
                <div className="text-center text-muted-foreground py-12">
                  <div className="mb-6">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  </div>
                  <p className="text-lg mb-4">No players pinned</p>
                  <p className="text-base text-muted-foreground/70">Search and click the pin button to compare up to 3 players</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // SearchResultCard component for detailed player cards when searching
  const SearchResultCard = ({ 
    player, 
    isPlayerPinned, 
    handlePinPlayer, 
    handleUnpinPlayer, 
    pinnedPlayers,
    isExpanded,
    onToggleExpansion
  }: {
    player: Player;
    isPlayerPinned: (name: string) => boolean;
    handlePinPlayer: (player: Player) => void;
    handleUnpinPlayer: (name: string) => void;
    pinnedPlayers: Player[];
    isExpanded: boolean;
    onToggleExpansion: () => void;
  }) => {

    return (
      <Card className="hover:shadow-lg transition-all duration-300 theme-transition-bg theme-transition-border border-primary/20 hover:border-primary/40 overflow-hidden">
        <CardContent className="p-0">
          {/* Header section with rank and name */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-3 border-b border-primary/10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Rank Badge - Removed ELO badge overlay */}
                <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs border-2 border-green-700">
                  #{player.rank}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground truncate mb-0.5">
                    {player.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-1.5 py-0.5 text-xs">
                      {player.country}
                    </Badge>
                    <span>Age {player.age}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">ATP Points</div>
                  <div className="text-base font-bold text-primary">
                    {parseInt(player.points).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={isPlayerPinned(player.name) ? "default" : "outline"}
                    onClick={() => isPlayerPinned(player.name) ? handleUnpinPlayer(player.name) : handlePinPlayer(player)}
                    disabled={!isPlayerPinned(player.name) && pinnedPlayers.length >= 3}
                    className="h-7 w-7 p-0"
                  >
                    {isPlayerPinned(player.name) ? (
                      <X className="h-3 w-3" />
                    ) : (
                      <Pin className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onToggleExpansion}
                    className="h-7 w-7 p-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible ELO Stats Section */}
          {isExpanded && player.elo && (
            <div className="p-2 space-y-1.5">
              {/* Current ELO - Compact */}
              <div className="bg-muted/10 rounded p-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Current ELO</span>
                  <span className="text-base font-bold text-blue-500">
                    {parseFloat(player.elo).toFixed(1)}
                  </span>
                </div>
                
                {/* Surface ELO breakdown - More compact */}
                <div className="grid grid-cols-3 gap-1">
                  {player.clayElo && (
                    <div className="text-center p-1 bg-orange-500/10 dark:bg-orange-500/20 rounded text-xs">
                      <div className="font-bold text-orange-600">{Math.round(parseFloat(player.clayElo))}</div>
                      <div className="text-muted-foreground text-[10px]">Clay</div>
                    </div>
                  )}
                  {player.hardcourtElo && (
                    <div className="text-center p-1 bg-blue-500/10 dark:bg-blue-500/20 rounded text-xs">
                      <div className="font-bold text-blue-600 dark:text-blue-400">{Math.round(parseFloat(player.hardcourtElo))}</div>
                      <div className="text-muted-foreground text-[10px]">Hard</div>
                    </div>
                  )}
                  {player.grassElo && (
                    <div className="text-center p-1 bg-green-500/10 dark:bg-green-500/20 rounded text-xs">
                      <div className="font-bold text-green-600">{Math.round(parseFloat(player.grassElo))}</div>
                      <div className="text-muted-foreground text-[10px]">Grass</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Peak ELO - More compact */}
              {player.peakElo && (
                <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 dark:from-amber-500/20 dark:to-yellow-500/20 rounded p-1.5 border border-amber-200/50 dark:border-amber-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-amber-500" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Peak ELO</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        {parseFloat(player.peakElo).toFixed(1)}
                      </div>
                      {player.peakMonth && (
                        <div className="text-[10px] text-amber-600/70 dark:text-amber-400/70">
                          {player.peakMonth}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2024 Season Stats Section */}
          {isExpanded && player.stats2024 && (
            <div className="p-2 border-t border-muted/20">
              <div className="mb-1">
                <span className="text-xs font-medium text-blue-600">2024 Season Stats</span>
              </div>
              
              {/* W/L Record */}
              <div className="bg-muted/10 rounded p-1.5 mb-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Record</span>
                  <span className="text-sm font-bold text-foreground">
                    {player.stats2024.totalWins}W-{player.stats2024.totalLosses}L
                  </span>
                </div>
                
                {/* Win percentage */}
                <div className="text-[10px] text-muted-foreground">
                  Win Rate: {((player.stats2024.totalWins / (player.stats2024.totalWins + player.stats2024.totalLosses)) * 100).toFixed(1)}%
                </div>
              </div>

              {/* Streaks */}
              <div className="grid grid-cols-2 gap-1 mb-1">
                <div className="text-center p-1.5 bg-green-500/10 dark:bg-green-500/20 rounded text-xs">
                  <div className="font-bold text-green-600">{player.stats2024.longestWinStreak}</div>
                  <div className="text-muted-foreground text-[10px]">Best Win Streak</div>
                </div>
                <div className="text-center p-1.5 bg-red-500/10 dark:bg-red-500/20 rounded text-xs">
                  <div className="font-bold text-red-600">{player.stats2024.longestLoseStreak}</div>
                  <div className="text-muted-foreground text-[10px]">Worst Lose Streak</div>
                </div>
              </div>

              {/* Surface Stats */}
              <div className="grid grid-cols-3 gap-1">
                <div className="text-center p-1 bg-orange-500/10 dark:bg-orange-500/20 rounded text-xs">
                  <div className="font-bold text-orange-600">
                    {player.stats2024.surfaceStats.Clay.wins}-{player.stats2024.surfaceStats.Clay.losses}
                  </div>
                  <div className="text-muted-foreground text-[10px]">Clay</div>
                </div>
                <div className="text-center p-1 bg-blue-500/10 dark:bg-blue-500/20 rounded text-xs">
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    {player.stats2024.surfaceStats.Hard.wins}-{player.stats2024.surfaceStats.Hard.losses}
                  </div>
                  <div className="text-muted-foreground text-[10px]">Hard</div>
                </div>
                <div className="text-center p-1 bg-green-500/10 dark:bg-green-500/20 rounded text-xs">
                  <div className="font-bold text-green-600">
                    {player.stats2024.surfaceStats.Grass.wins}-{player.stats2024.surfaceStats.Grass.losses}
                  </div>
                  <div className="text-muted-foreground text-[10px]">Grass</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Check if H2H data is available for exactly 2 pinned players
  const hasH2HData = () => {
    if (pinnedPlayers.length !== 2) return false;
    const [player1, player2] = pinnedPlayers;
    const h2hRecord = getH2BtwPlayers(player1, player2);
    return h2hRecord !== null;
  };

  return (
    <>
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left side - Search and Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search Input */}
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for a tennis player..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-lg py-3 theme-transition w-full"
              />
            </div>

            {/* Results Header */}
            <div className="mt-6 mb-4">
              {searchTerm.trim() ? (
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Search Results ({filteredPlayers.length} found)
                  </h3>
                  {filteredPlayers.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      Showing top 5 results
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <h3 className="text-sm font-medium text-foreground">
                      Top ATP Players
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click on any player below to see detailed stats and ELO ratings
                  </p>
                </div>
              )}
            </div>

            {/* Results */}
            <div className="space-y-2 max-w-lg">
              {searchTerm.trim() !== '' && filteredPlayers.length === 0 && (
                <Card className="theme-transition-bg theme-transition-border">
                  <CardContent className="p-4 text-center">
                    <div className="text-muted-foreground">
                      No players found matching "{searchTerm}"
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Show top 3 preview cards when not searching */}
              {!searchTerm.trim() && getTopPlayers().slice(0, 3).map((player, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-all duration-300 theme-transition-bg theme-transition-border border-primary/20 hover:border-primary/40 overflow-hidden cursor-pointer hover:scale-[1.02]"
                  onClick={() => handleTopPlayerClick(player.name)}
                >
                  <CardContent className="p-2 flex items-center gap-2">
                    {/* Rank Badge */}
                    <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs border-2 border-green-700">
                      #{player.rank}
                    </div>
                    {/* Name & Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate mb-0.5">
                        {player.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-1 py-0">
                          {player.country}
                        </Badge>
                        <span>Age {player.age}</span>
                      </div>
                    </div>
                    {/* Click to search button */}
                    <Button size="sm" variant="secondary" className="px-2 py-1 text-xs font-medium">
                      Click to search
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Show detailed search result cards when searching */}
              {searchTerm.trim() && filteredPlayers.map((player, index) => (
                <SearchResultCard 
                  key={index} 
                  player={player} 
                  isPlayerPinned={isPlayerPinned}
                  handlePinPlayer={handlePinPlayer}
                  handleUnpinPlayer={handleUnpinPlayer}
                  pinnedPlayers={pinnedPlayers}
                  isExpanded={isCardExpanded(player.name)}
                  onToggleExpansion={() => toggleCardExpansion(player.name)}
                />
              ))}

              {/* Show recommended players when searching and have results */}
              {searchTerm.trim() && filteredPlayers.length > 0 && getRecommendedPlayers().length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-500 font-medium px-1">Recommended Players</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const recommendedPlayers = getRecommendedPlayers();
                        if (recommendedPlayers.length > 1) {
                          setRecommendedIndex((prev) => (prev + 1) % recommendedPlayers.length);
                        }
                      }}
                      className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {(() => {
                      const recommendedPlayers = getRecommendedPlayers();
                      if (recommendedPlayers.length === 0) return null;
                      const player = recommendedPlayers[recommendedIndex % recommendedPlayers.length];
                      return (
                        <div 
                          key={`rec-${recommendedIndex}`} 
                          className="flex items-center justify-between p-2 rounded-lg bg-card/30 hover:bg-card/60 transition-colors border border-border/20 hover:border-border/40"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-xs font-bold text-green-600">#{player.rank}</span>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-xs truncate">{player.name}</div>
                              <div className="text-xs text-muted-foreground">{player.country} • {parseInt(player.points).toLocaleString()}</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={isPlayerPinned(player.name) ? "default" : "outline"}
                            onClick={(e) => {
                              e.stopPropagation();
                              isPlayerPinned(player.name) ? handleUnpinPlayer(player.name) : handlePinPlayer(player);
                            }}
                            disabled={!isPlayerPinned(player.name) && pinnedPlayers.length >= 3}
                            className="h-6 w-6 p-0 shrink-0"
                          >
                            {isPlayerPinned(player.name) ? (
                              <X className="h-3 w-3" />
                            ) : (
                              <Pin className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Pinned Players */}
          <div className="lg:col-span-2">
            <div className="sticky top-4">
              <Card className="bg-green-900/10 dark:bg-green-900/20 backdrop-blur-md border-2 border-green-300/50 dark:border-green-700/50 rounded-3xl">
                <CardContent className="p-6 rounded-3xl">
                  {/* Header with Navigation Buttons */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-green-100/80 dark:bg-green-900/40 border border-green-300/40 dark:border-green-700/40">
                        <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">Pinned Players</h3>
                      <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-500/10 dark:bg-green-500/20 border border-green-300/50 dark:border-green-700/50">{pinnedPlayers.length}/3</Badge>
                    </div>
                    {pinnedPlayers.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearPinned}
                        className="bg-red-500/10 dark:bg-red-500/20 border border-red-300/50 dark:border-red-700/50 hover:bg-red-500/20 dark:hover:bg-red-500/30"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* Navigation Tabs */}
                  {pinnedPlayers.length > 0 && (
                    <div className="flex gap-2 mb-6">
                      <Button
                        variant={currentView === 'list' ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentView('list')}
                        className={`flex items-center gap-2 text-xs ${currentView === 'list' ? 'bg-green-500/80 hover:bg-green-600/80 text-white' : 'bg-green-500/10 dark:bg-green-500/20 border border-green-300/50 dark:border-green-700/50 hover:bg-green-500/20 dark:hover:bg-green-500/30'}`}
                      >
                        <Target className="h-3 w-3" />
                        Players
                      </Button>
                      
                      <Button
                        variant={currentView === 'details' ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentView('details')}
                        className={`flex items-center gap-2 text-xs ${currentView === 'details' ? 'bg-green-500/80 hover:bg-green-600/80 text-white' : 'bg-green-500/10 dark:bg-green-500/20 border border-green-300/50 dark:border-green-700/50 hover:bg-green-500/20 dark:hover:bg-green-500/30'}`}
                      >
                        <BarChart3 className="h-3 w-3" />
                        Details
                      </Button>
                      
                      {pinnedPlayers.length === 2 && hasH2HData() && (
                        <Button
                          variant={currentView === 'h2h' ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentView('h2h')}
                          className={`flex items-center gap-2 text-xs ${currentView === 'h2h' ? 'bg-green-500/80 hover:bg-green-600/80 text-white' : 'bg-green-500/10 dark:bg-green-500/20 border border-green-300/50 dark:border-green-700/50 hover:bg-green-500/20 dark:hover:bg-green-500/30'}`}
                        >
                          <Swords className="h-3 w-3" />
                          H2H
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {pinnedPlayers.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <div className="mb-6">
                        <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      </div>
                      <p className="text-lg mb-4">No players pinned</p>
                      <p className="text-base text-muted-foreground/70">Search and click the pin button to compare up to 3 players</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Tab Content */}
                      {currentView === 'list' && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                          {pinnedPlayers.map((player, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-green-500/5 dark:bg-green-500/10 rounded-2xl border border-green-200/30 dark:border-green-700/30 hover:border-green-400/50 transition-all duration-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/15 dark:bg-green-500/25 border border-green-300/50 dark:border-green-700/50 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                                  #{player.rank}
                                </div>
                                <div>
                                  <div className="font-semibold text-sm text-foreground">{player.name}</div>
                                  <div className="text-xs text-muted-foreground/80">{player.country}</div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUnpinPlayer(player.name)}
                                className="h-8 w-8 p-0 bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30 hover:text-red-600 dark:hover:text-red-400 border border-red-300/50 dark:border-red-700/50 hover:border-red-400/70 rounded-lg transition-all duration-200"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Details Tab Content */}
                      {currentView === 'details' && (
                        <div className="animate-in fade-in duration-200">
                          <div className="bg-green-500/5 dark:bg-green-500/10 rounded-2xl p-4 border border-green-200/30 dark:border-green-700/30">
                            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Comparison Overview
                            </h4>
                            
                            {/* Compact Table Format */}
                            <div className="space-y-3 text-xs">
                              {/* ATP Rankings & ELO */}
                              <div>
                                <div className="grid grid-cols-4 gap-2 mb-2 font-medium text-muted-foreground">
                                  <div>Player</div>
                                  <div>ATP Rank</div>
                                  <div>ELO</div>
                                  <div>ATP Points</div>
                                </div>
                                {pinnedPlayers.map((player, index) => (
                                  <div key={index} className="grid grid-cols-4 gap-2 py-1 border-b border-border/20 last:border-b-0">
                                    <div className="font-medium truncate">{player.name}</div>
                                    <div className="font-bold">#{player.rank}</div>
                                    <div className="font-bold text-blue-500">
                                      {player.elo ? parseFloat(player.elo).toFixed(1) : 'N/A'}
                                    </div>
                                    <div className="font-bold text-green-500">
                                      {parseInt(player.points).toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Surface ELO */}
                              {pinnedPlayers.some(p => p.clayElo || p.hardcourtElo || p.grassElo) && (
                                <div className="pt-2 border-t border-border/30">
                                  <div className="font-medium text-muted-foreground mb-2">Surface ELO</div>
                                  <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-medium text-muted-foreground">
                                    <div>Player</div>
                                    <div className="text-orange-500">Clay</div>
                                    <div className="text-gray-500">Hard</div>
                                    <div className="text-green-500">Grass</div>
                                  </div>
                                  {pinnedPlayers.map((player, index) => (
                                    <div key={index} className="grid grid-cols-4 gap-2 py-1 border-b border-border/20 last:border-b-0">
                                      <div className="font-medium truncate">{player.name}</div>
                                      <div className="font-bold text-orange-500">
                                        {player.clayElo ? Math.round(parseFloat(player.clayElo)) : '-'}
                                      </div>
                                      <div className="font-bold text-gray-500">
                                        {player.hardcourtElo ? Math.round(parseFloat(player.hardcourtElo)) : '-'}
                                      </div>
                                      <div className="font-bold text-green-500">
                                        {player.grassElo ? Math.round(parseFloat(player.grassElo)) : '-'}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* H2H Tab Content */}
                      {currentView === 'h2h' && pinnedPlayers.length === 2 && hasH2HData() && (
                        <div className="animate-in fade-in duration-200">
                          <div className="bg-green-50/60 dark:bg-green-900/20 rounded-2xl p-4 border border-green-300/50 dark:border-green-700/40">
                            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                              <Swords className="h-4 w-4" />
                              Head-to-Head Analysis
                            </h4>
                            {(() => {
                              const [player1, player2] = pinnedPlayers;
                              const h2hRecord = getH2BtwPlayers(player1, player2);
                              
                              if (!h2hRecord) return null;
                              
                              return (
                                <div className="space-y-3">
                                  {/* Main H2H Record */}
                                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="text-sm font-medium">{player1.name}</span>
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline" className={`text-sm px-2 py-1 ${h2hRecord.wins > h2hRecord.losses ? 'border-green-500 text-green-700 bg-green-500/10' : 'border-red-500 text-red-700 bg-red-500/10'}`}>
                                        {h2hRecord.wins}
                                      </Badge>
                                      <span className="text-sm text-gray-500 font-bold">-</span>
                                      <Badge variant="outline" className={`text-sm px-2 py-1 ${h2hRecord.losses > h2hRecord.wins ? 'border-green-500 text-green-700 bg-green-500/10' : 'border-red-500 text-red-700 bg-red-500/10'}`}>
                                        {h2hRecord.losses}
                                      </Badge>
                                    </div>
                                    <span className="text-sm font-medium">{player2.name}</span>
                                  </div>
                                  
                                  {/* Stats Comparison */}
                                  <div className="grid grid-cols-3 gap-3 text-xs">
                                    <div className="text-center p-2 bg-white/5 rounded">
                                      <div className="text-muted-foreground mb-1">vs Top 10</div>
                                      <div className="font-bold">{player1.h2hData?.vsTop10 || 'N/A'}</div>
                                    </div>
                                    <div className="text-center p-2 bg-white/5 rounded">
                                      <div className="text-muted-foreground mb-1">Total Matches</div>
                                      <div className="font-bold">{h2hRecord.total}</div>
                                      <div className="text-xs text-muted-foreground">{h2hRecord.percentage.toFixed(0)}% win rate</div>
                                    </div>
                                    <div className="text-center p-2 bg-white/5 rounded">
                                      <div className="text-muted-foreground mb-1">vs Top 10</div>
                                      <div className="font-bold">{player2.h2hData?.vsTop10 || 'N/A'}</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}