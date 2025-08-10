# Pokémon Battle Royale 🥊⚡

A React TypeScript application where users vote between two Pokémon (Bulbasaur vs Pikachu) with real-time vote updates across all users using WebSocket-like functionality.

![Pokemon Battle Royale](https://img.shields.io/badge/Pokemon-Battle%20Royale-blue?style=for-the-badge&logo=pokemon)
![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-purple?style=flat&logo=vite)

## ✨ Features

### Core Requirements ✅
- **Live Pokémon Display**: Fetches Bulbasaur vs Pikachu from PokéAPI with sprites, stats, and info
- **Voting System**: One vote per user with instant feedback and result visualization
- **Real-time Vote Syncing**: Live vote updates across all users using localStorage + Storage API
- **React State Management**: Clean implementation using hooks (useState, useEffect, useCallback)
- **Error Handling**: Graceful loading states and API failure handling

### Bonus Features 🎁
- **New Battle Button**: Generate random Pokémon battles
- **Smooth Animations**: Framer Motion transitions and micro-interactions
- **Duplicate Vote Warning**: Prevents and warns about multiple voting attempts
- **Beautiful UI**: Modern glassmorphism design with responsive layout
- **Cross-tab Sync**: Real-time updates across multiple browser tabs

## 🚀 Quick Start

```bash
# Clone and setup
cd pokemon-battle-app
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## 🏗️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Framer Motion** for smooth animations
- **PokéAPI** for Pokémon data
- **localStorage + Storage API** for real-time cross-tab sync
- **Lucide React** for beautiful icons

## 📁 Project Structure

```
src/
├── components/
│   ├── PokemonBattle.tsx    # Main battle component
│   ├── PokemonCard.tsx      # Individual Pokémon display
│   └── LoadingSpinner.tsx   # Loading animation
├── services/
│   ├── pokemonApi.ts        # PokéAPI integration
│   ├── voteService.ts       # Vote management with localStorage
│   └── supabase.ts          # Optional Supabase real-time (advanced)
├── types/
│   └── pokemon.ts           # TypeScript interfaces
└── App.tsx                  # Main app component
```

## 🎮 How to Use

1. **View the Battle**: See Bulbasaur vs Pikachu with their stats and official artwork
2. **Cast Your Vote**: Click the vote button for your preferred Pokémon
3. **See Results**: Watch real-time vote counts and percentages with animated bars
4. **Try New Battles**: Click "New Battle" for random Pokémon matchups
5. **Reset Votes**: Use "Reset Votes" to start fresh
6. **Test Real-time**: Open multiple tabs to see live vote synchronization

## 🔧 Real-time Implementation

The app fulfills the "WebSocket without server" requirement using two approaches:

### Primary: localStorage + Storage API
- Uses browser's `storage` events for cross-tab communication
- Simulates real-time WebSocket functionality
- Works immediately without any setup
- Perfect for demonstration and development

### Optional: Supabase WebSocket
- True WebSocket connections via Supabase real-time
- Cross-device synchronization
- Requires setup (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))

## 🐛 Debug Mode

The app includes comprehensive debugging features that can be controlled via environment variables:

### Development Mode (Default)
- Debug features are automatically enabled when `import.meta.env.DEV` is true
- Shows debug panel, console logs, and real-time status

### Production Debug Mode
- Set `VITE_DEBUG_MODE=true` in your `.env.local` file to enable debug features in production
- Useful for troubleshooting real-time issues in deployed environments

### Debug Features
- **Real-time Status Panel**: Shows Supabase connection status and test buttons
- **Console Logging**: Detailed logs for vote updates, battle changes, and subscription events
- **Manual Refresh**: Test buttons to manually refresh votes and test connections
- **Battle ID Tracking**: Visual display of current battle ID and Pokémon IDs

## 🎨 Design Features

- **Glassmorphism UI**: Modern translucent cards with backdrop blur
- **Gradient Backgrounds**: Beautiful purple-blue gradients
- **Smooth Animations**: Micro-interactions and state transitions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects, scale animations, and visual feedback
- **Winner Celebration**: Crown badges and special highlighting for winners

## 📱 Responsive Design

The app is fully responsive with:
- **Desktop**: Side-by-side Pokémon cards with VS divider
- **Tablet**: Optimized layout with adjusted spacing
- **Mobile**: Stacked layout with reordered VS divider

## 🧩 State Management

Clean React patterns using:
- `useState` for component state
- `useEffect` for side effects and subscriptions
- `useCallback` for memoized functions
- Custom hooks pattern for reusable logic
- Predictable state updates with error boundaries

## 🚀 Performance

- **Fast API calls**: Parallel fetching of Pokémon data
- **Optimized renders**: Memoized components and callbacks
- **Lazy loading**: Efficient image loading with fallbacks
- **Small bundle**: Tree-shaking and modern build tools

## 🔮 Future Enhancements

- [ ] Pokémon type advantages calculation
- [ ] Battle history and statistics
- [ ] User profiles and avatars
- [ ] Tournament bracket system
- [ ] Sound effects and music
- [ ] Share results on social media

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
