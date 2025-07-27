# Media Builder Card System

## Overview
The Media Builder now supports multiple card layouts through a flexible rendering system. This allows for easy extension and maintenance of different card types.

## Architecture

### Components
- **`MatchCard.tsx`** - Single match display card with French Open finals data
- **`stat-cards.css`** - Shared styling for consistent dimensions across all cards

### Card Types
1. **Season Card** (`cardType: 'sinner'`) - Original player statistics card for full season data
2. **Match Card** (`cardType: 'alt'`) - Single match display card optimized for match results
3. **Blank Card** (`cardType: 'blank'`) - Placeholder for future layouts

### Key Features
- **Independent State**: Each card has its own props, state, and logic
- **Consistent Dimensions**: All cards use shared `.stat-card` class (800x450px)
- **Scalable Architecture**: Easy to add new card types
- **Export Support**: All cards work with the export functionality via `ref={cardRef}`
- **Auto Data Loading**: Match Card automatically loads 2025 French Open finals data

## Usage

### Card Type Selection
Users can switch between card layouts using the "Card Layout" selector in the Controls panel:
- **Season Card**: Original data-driven card for full season statistics
- **Match Card**: Single match display optimized for match results and details
- **Blank**: Placeholder for future development

### Match Card Features
The Match Card automatically loads and displays:
- **Tournament Information**: Name, round, date, surface (positioned in corners)
- **Bold Winner Display**: Large, centered winner name with highlight green accent
- **Score Display**: Clean, monospace font for easy reading
- **Match Statistics**: Prominently displayed match points saved and additional stats
- **TennisMenace Theming**: Dark navy background with cyan and green accents
- **Blocky Layout**: Bold, athletic design matching the brand aesthetic

### Visual Design
- **Background**: Dark navy/midnight blue (`bg-slate-900`) with subtle gradient overlays
- **Highlight Text**: Bright green (`text-green-400`) for winner and key stats
- **Accent Colors**: Cyan (`text-cyan-400`, `text-cyan-300`) for tournament info and scores  
- **Typography**: Bold, uppercase labels with clean hierarchy
- **Layout**: Corner-positioned metadata, center-focused winner, bottom stats row

### Data Source
The Match Card reads from `/public/data/2025_RG_Finals.csv` which contains:
```csv
Date,Tournament,Surface,Round,Player and Rank,Opponent and Rank,Result,Score,Match Points Saved,Time,Stat #1,Stat #2
"May 26th, 2025",Roland Garros,Clay,Finals,Carlos Alcaraz #2,Jannik Sinner #1,(2)Alcaraz [SPA] d. (1)Jannik Sinner [ITA],4-6 6-7(4) 6-4 7-6(3) 7-6(2),3,5 Hours and 29 minutes,third man in Open Era history to save championship points and win a major final,"second man in Open Era to win his first five majors, joining Roger Federer"
```

### Adding New Card Types

1. Create a new component in `/components/` (e.g., `ProPlayerCard.tsx`)
2. Use `forwardRef` for export support:
   ```tsx
   export const ProPlayerCard = forwardRef<HTMLDivElement, Props>(({ ...props }, ref) => {
     return <div ref={ref} className="stat-card">...</div>
   })
   ```
3. Add the card type to the renderCardByType switch statement
4. Add a button to the Card Layout selector

### Flexible Rendering System
```tsx
const renderCardByType = () => {
  switch (cardType) {
    case 'sinner': return renderSinnerCard()
    case 'alt': return <MatchCard ref={cardRef} />
    case 'blank': return renderBlankCard()
    case 'future': return <ProPlayerCard ref={cardRef} />
    default: return renderSinnerCard()
  }
}
```

## Design Principles
- **Modularity**: Each card is self-contained
- **Consistency**: Shared dimensions and export functionality
- **Scalability**: Easy to extend with new card types
- **Independence**: No conflicts between card states or logic
- **Data Specificity**: Match Card optimized for single match data vs Season Card for aggregate stats

## File Structure
```
components/
  ├── MatchCard.tsx            # Single match display card
  └── ui/                      # Existing UI components

styles/
  └── stat-cards.css           # Shared card dimensions

app/
  └── media-builder/
      └── page.tsx             # Main page with flexible rendering

public/
  └── data/
      └── 2025_RG_Finals.csv   # French Open finals match data
```
