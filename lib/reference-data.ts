// Reference data to ensure exact matches between custom mode and reference cards

export const REFERENCE_DATA = {
  seasonCard: {
    playerName: 'Jannik Sinner',
    atpRank: '#1',
    season: '2024 Season',
    winRate: '91%',
    winRateLabel: 'WIN RATE',
    overallRecord: '73-6', // Exact formatting with dash, corrected from 73-7
    totalMatches: '79', // Corrected to match 73+6
    clayRecord: '14-1', // Exact formatting
    clayPercentage: '93%', // Corrected calculation 
    grassRecord: '7-1', 
    grassPercentage: '88%',
    hardRecord: '52-4', // Corrected from 51-3
    hardPercentage: '93%', // Corrected calculation
    highlightsTitle: '2024 Season Highlights',
    highlightsSubtext: 'First Italian to win 2 Grand Slams in a year',
    grandSlamCount: '2',
    trophyIcon: 'trophy',
    trophyLabel: 'Grand Slams',
    footerBrand: 'TennisMenace Analytics',
    footerHandle: '@TmTennisX',
    recentFormTitle: 'End of Season Form',
    recentFormResults: ['W', 'W', 'W', 'W', 'W', 'W'],
    clayLabel: 'Clay',
    grassLabel: 'Grass', 
    hardLabel: 'Hard',
    matchesLabel: 'MATCHES',
    overallRecordLabel: 'OVERALL RECORD',
    defaultImage: '/sinner2024.png'
  },
  
  matchCard: {
    tournamentName: 'French Open Final 2025',
    date: 'June 8, 2025',
    surface: 'Clay',
    surfaceLabel: 'Surface',
    player1Name: 'Carlos Alcaraz',
    player1Seed: '#2',
    player2Name: 'Jannik Sinner',
    player2Seed: '#1',
    score: '2-6, 6-1, 6-4, 6-3', // Exact formatting with spaces after commas - corrected score
    duration: '3h 21m', // Exact formatting - corrected from 4h 19m
    matchPointsSaved: '1', // Corrected from 3
    stat1: 'Historic Clay Court Battle',
    stat2: 'Epic 5-set final on Philippe-Chatrier',
    footerBrand: 'TennisMenace Analytics',
    footerHandle: '@TmTennisX',
    defaultImage: '/rg2025.png'
  }
};
