# Pokémon Battle Royale 🥊⚡

A React TypeScript application where users vote between two Pokémon (Bulbasaur vs Pikachu) with **real-time vote updates across all users** using **Supabase WebSocket connections** and localStorage fallback.

🌐 **Live Demo**: [pokemon-battle-vav4.onrender.com](http://pokemon-battle-vav4.onrender.com/)

## ✨ Features

- **Live Pokémon Display**: Fetches Bulbasaur vs Pikachu from PokéAPI with sprites, stats, and info
- **Voting System**: One vote per user with instant feedback and result visualization
- **Real-time Vote Syncing**: Live vote updates across all users using **Supabase WebSocket connections**
- **React State Management**: Clean implementation using hooks (useState, useEffect, useCallback)
- **Error Handling**: Graceful loading states and API failure handling

- **New Battle Button**: Generate random Pokémon battles
- **Smooth Animations**: Framer Motion transitions and micro-interactions
- **Duplicate Vote Warning**: Prevents and warns about multiple voting attempts
- **Cross-device Sync**: Real-time updates across all devices and browsers
- **localStorage Fallback**: Works offline with cross-tab synchronization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

### Environment Setup (Required for Full Functionality)

For **real-time vote synchronization across all users**, create a `.env.local` file:

```bash
cp env.example .env.local
# Edit .env.local with your Supabase credentials
```

**Without Supabase setup**: The app will work with localStorage fallback (cross-tab only)
**With Supabase setup**: Full real-time sync across all devices and users

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

## 🏗️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Framer Motion** for smooth animations
- **PokéAPI** for Pokémon data
- **Supabase** for real-time WebSocket connections and database
- **localStorage + Storage API** for offline fallback and cross-tab sync
- **Lucide React** for beautiful icons

## 🎮 How to Use

1. **View the Battle**: See Bulbasaur vs Pikachu with their stats and official artwork
2. **Cast Your Vote**: Click the vote button for your preferred Pokémon
3. **See Results**: Watch real-time vote counts and percentages with animated bars
4. **Try New Battles**: Click "New Battle" for random Pokémon matchups
5. **Reset to Default**: Use "Reset to Default" to return to Bulbasaur vs Pikachu
6. **Test Real-time**: Open multiple tabs or devices to see live vote synchronization

## 🔧 Real-time Implementation

The app provides **true real-time vote synchronization** using **Supabase WebSocket connections**:

### Primary: Supabase Real-time WebSockets
- **True WebSocket connections** via Supabase real-time subscriptions
- **Cross-device synchronization** - votes sync across all users worldwide
- **Persistent database storage** - votes are saved and retrieved from Supabase
- **Battle-specific tracking** - each Pokémon pair has independent vote tracking
- **Automatic reconnection** - handles network interruptions gracefully

### Fallback: localStorage + Storage API
- **Offline functionality** when Supabase is not configured
- **Cross-tab synchronization** using browser storage events
- **Immediate setup** - works without any configuration
- **Perfect for development** and demonstration purposes

### How It Works
1. **Vote Submission**: Votes are sent to Supabase database
2. **Real-time Broadcast**: Supabase broadcasts updates to all connected clients
3. **Instant UI Updates**: All users see vote changes in real-time
4. **Fallback Mode**: If Supabase is unavailable, uses localStorage for local sync

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
- **Supabase Integration**: Test database connections and real-time subscriptions
