'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Trophy, TrendingUp, Target, Award, Pin, Sparkles, ChevronDown, ChevronUp, X, ChevronRight } from 'lucide-react';

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
}

export default function PlayerSearch() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedPlayers, setPinnedPlayers] = useState<Player[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        // Load ATP rankings data
        const atpResponse = await fetch('/data/Rankings_July_2025 - Sheet1.csv');
        const atpCsvText = await atpResponse.text();
        
        // Load ELO rankings data
        const eloResponse = await fetch('/data/EloRankingsJuly2025.csv');
        const eloCsvText = await eloResponse.text();
        
        let atpPlayers: any[] = [];
        let eloPlayers: any[] = [];
        
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
            
            // Merge the data
            const mergedPlayers = atpPlayers.map(atpPlayer => {
              const eloData = eloPlayers.find(eloPlayer => 
                eloPlayer.name.toLowerCase() === atpPlayer.name.toLowerCase()
              );
              
              return {
                ...atpPlayer,
                ...eloData
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
  }, [searchTerm, players]);

  const handlePinPlayer = (player: Player) => {
    if (pinnedPlayers.length >= 3) return;
    if (pinnedPlayers.some(p => p.name === player.name)) return;
    setPinnedPlayers([...pinnedPlayers, player]);
  };

  const handleUnpinPlayer = (playerName: string) => {
    setPinnedPlayers(pinnedPlayers.filter(p => p.name !== playerName));
  };

  const handleClearPinned = () => {
    setPinnedPlayers([]);
    setShowComparison(false);
  };

  const isPlayerPinned = (playerName: string) => {
    return pinnedPlayers.some(p => p.name === playerName);
  };

  const handleTopPlayerClick = (playerName: string) => {
    setSearchTerm(playerName);
  };

  const getTopPlayers = () => {
    return players.slice(0, 3);
  };

  const toggleCardExpansion = (playerName: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerName)) {
        newSet.delete(playerName);
      } else {
        newSet.add(playerName);
      }
      return newSet;
    });
  };

  const isCardExpanded = (playerName: string) => {
    return expandedCards.has(playerName);
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
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-primary/10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Rank Badge - Removed ELO badge overlay */}
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm border-2 border-green-700">
                  #{player.rank}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-foreground truncate mb-1">
                    {player.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-2 py-0.5">
                      {player.country}
                    </Badge>
                    <span>Age {player.age}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">ATP Points</div>
                  <div className="text-lg font-bold text-primary">
                    {parseInt(player.points).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={isPlayerPinned(player.name) ? "default" : "outline"}
                    onClick={() => isPlayerPinned(player.name) ? handleUnpinPlayer(player.name) : handlePinPlayer(player)}
                    disabled={!isPlayerPinned(player.name) && pinnedPlayers.length >= 3}
                    className="h-8 w-8 p-0"
                  >
                    {isPlayerPinned(player.name) ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onToggleExpansion}
                    className="h-8 w-8 p-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible ELO Stats Section */}
          {isExpanded && player.elo && (
            <div className="p-3 space-y-2">
              {/* Current ELO - Compact */}
              <div className="bg-muted/30 rounded p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Current ELO</span>
                  <span className="text-lg font-bold text-blue-500">
                    {parseFloat(player.elo).toFixed(1)}
                  </span>
                </div>
                
                {/* Surface ELO breakdown - More compact */}
                <div className="grid grid-cols-3 gap-1">
                  {player.clayElo && (
                    <div className="text-center p-1 bg-orange-50 dark:bg-orange-950/20 rounded text-xs">
                      <div className="font-bold text-orange-600">{Math.round(parseFloat(player.clayElo))}</div>
                      <div className="text-muted-foreground">Clay</div>
                    </div>
                  )}
                  {player.hardcourtElo && (
                    <div className="text-center p-1 bg-gray-50 dark:bg-gray-950/20 rounded text-xs">
                      <div className="font-bold text-gray-600">{Math.round(parseFloat(player.hardcourtElo))}</div>
                      <div className="text-muted-foreground">Hard</div>
                    </div>
                  )}
                  {player.grassElo && (
                    <div className="text-center p-1 bg-green-50 dark:bg-green-950/20 rounded text-xs">
                      <div className="font-bold text-green-600">{Math.round(parseFloat(player.grassElo))}</div>
                      <div className="text-muted-foreground">Grass</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Peak ELO - More compact */}
              {player.peakElo && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded p-2 border border-amber-200/50 dark:border-amber-800/30">
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
                        <div className="text-xs text-amber-600/70 dark:text-amber-400/70">
                          {player.peakMonth}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
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
            </div>
          </div>

          {/* Right side - Pinned Players */}
          <div className="lg:col-span-2">
            <div className="sticky top-4">
              <Card className="theme-transition-bg theme-transition-border">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Target className="h-7 w-7 text-primary" />
                      <h3 className="text-2xl font-bold text-foreground">Pinned Players</h3>
                      <Badge variant="secondary" className="text-sm px-3 py-1">{pinnedPlayers.length}/3</Badge>
                    </div>
                    {pinnedPlayers.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearPinned}
                        className="flex items-center gap-2 h-8"
                      >
                        <Sparkles className="h-4 w-4" />
                        Clear
                      </Button>
                    )}
                  </div>
                  
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
                      {/* Pinned Players List */}
                      <div className="space-y-3">
                        {pinnedPlayers.map((player, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                #{player.rank}
                              </div>
                              <div>
                                <div className="font-semibold text-sm">{player.name}</div>
                                <div className="text-xs text-muted-foreground">{player.country}</div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUnpinPlayer(player.name)}
                              className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Show Details Toggle */}
                      <Button
                        variant="outline"
                        onClick={() => setShowComparison(!showComparison)}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        Show Details
                        {showComparison ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Comparison Panel */}
                      {showComparison && (
                        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="bg-card/50 rounded-lg p-3 border border-border/50">
                            <h4 className="font-semibold mb-3 text-sm">Comparison Overview</h4>
                            
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