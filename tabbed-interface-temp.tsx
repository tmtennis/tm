// This is the new tabbed interface content
// Will integrate this into the main component

{/* Header with Navigation Buttons */}
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/30 backdrop-blur-sm border border-green-500/30">
      <Target className="h-5 w-5 text-green-400" />
    </div>
    <h3 className="text-xl font-bold text-foreground">Pinned Players</h3>
    <Badge variant="secondary" className="text-sm px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20">{pinnedPlayers.length}/3</Badge>
  </div>
  {pinnedPlayers.length > 0 && (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClearPinned}
      className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
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
      className={`flex items-center gap-2 text-xs ${currentView === 'list' ? 'bg-green-600 hover:bg-green-700' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'}`}
    >
      <Target className="h-3 w-3" />
      Players
    </Button>
    
    {pinnedPlayers.length >= 2 && (
      <Button
        variant={currentView === 'details' ? "default" : "ghost"}
        size="sm"
        onClick={() => setCurrentView('details')}
        className={`flex items-center gap-2 text-xs ${currentView === 'details' ? 'bg-green-600 hover:bg-green-700' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'}`}
      >
        <BarChart3 className="h-3 w-3" />
        Details
      </Button>
    )}
    
    {pinnedPlayers.length === 2 && hasH2HData() && (
      <Button
        variant={currentView === 'h2h' ? "default" : "ghost"}
        size="sm"
        onClick={() => setCurrentView('h2h')}
        className={`flex items-center gap-2 text-xs ${currentView === 'h2h' ? 'bg-green-600 hover:bg-green-700' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'}`}
      >
        <Swords className="h-3 w-3" />
        H2H
      </Button>
    )}
  </div>
)}
