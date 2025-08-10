# Spotify Data Fetcher - Usage Guide

This guide shows you how to use the Spotify data fetching scripts to get user's top tracks and artists and store them in localStorage.

## 📁 Files Overview

- `src/scripts/fetchSpotifyData.js` - Main script with comprehensive data fetching functionality
- `src/scripts/spotifyDataManager.js` - Simplified manager for easy integration
- `src/components/SpotifyDataDemo.js` - Demo component showing usage
- `src/services/spotifyService.js` - Existing Spotify API service (already in your project)

## 🚀 Quick Start

### 1. Basic Usage

```javascript
import SpotifyDataManager from './scripts/spotifyDataManager';

// Initialize and fetch data
const accessToken = 'your_spotify_access_token';
const result = await SpotifyDataManager.initializeSpotifyData(accessToken);

if (result.success) {
  console.log('✅ Data fetched and stored!');
  
  // Get user's music summary
  const musicSummary = SpotifyDataManager.getUserMusicData('summary');
  console.log('Top track:', musicSummary.topTrack);
  console.log('Top artist:', musicSummary.topArtist);
  console.log('Genres:', musicSummary.topGenres);
}
```

### 2. React Component Integration

```javascript
import React, { useState, useEffect } from 'react';
import SpotifyDataManager from '../scripts/spotifyDataManager';

const MyMusicComponent = () => {
  const [musicData, setMusicData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMusicData = async () => {
      // Check if we have stored data
      const status = SpotifyDataManager.getDataStatus();
      
      if (status.hasData && status.isFresh) {
        // Use cached data
        const data = SpotifyDataManager.getUserMusicData('summary');
        setMusicData(data);
        setLoading(false);
      } else {
        // Fetch fresh data (you need to provide access token)
        const accessToken = getAccessTokenFromSomewhere();
        if (accessToken) {
          const result = await SpotifyDataManager.initializeSpotifyData(accessToken);
          if (result.success) {
            const data = SpotifyDataManager.getUserMusicData('summary');
            setMusicData(data);
          }
        }
        setLoading(false);
      }
    };

    loadMusicData();
  }, []);

  if (loading) return <div>Loading music data...</div>;
  if (!musicData) return <div>No music data available</div>;

  return (
    <div>
      <h2>Your Music Taste</h2>
      <p>Top Track: {musicData.topTrack?.name} by {musicData.topTrack?.artist}</p>
      <p>Top Artist: {musicData.topArtist?.name}</p>
      <p>Genres: {musicData.topGenres?.join(', ')}</p>
    </div>
  );
};
```

## 📊 Data Formats

### Summary Format
```javascript
const summary = SpotifyDataManager.getUserMusicData('summary');
// Returns:
{
  topTrack: { name, artist, popularity, ... },
  topArtist: { name, genres, popularity, ... },
  topGenres: ['pop', 'rock', 'indie'],
  totalTracks: 15,
  totalArtists: 12,
  lastUpdated: '2025-01-09T10:30:00.000Z'
}
```

### Roasting Format (for AI roasting feature)
```javascript
const roastingData = SpotifyDataManager.getUserMusicData('roasting');
// Returns:
{
  topTracks: [...], // Top 10 tracks
  topArtists: [...], // Top 10 artists
  topGenres: [...], // Top 8 genres
  recentlyPlayed: [...], // Recent 5 tracks
  insights: {...}, // Analysis data
  roastingFlags: ['low_artist_diversity', 'excessive_repeats']
}
```

### Full Format
```javascript
const fullData = SpotifyDataManager.getUserMusicData('full');
// Returns complete dataset with all time ranges and metadata
```

## ⚙️ Configuration Options

```javascript
const result = await SpotifyDataManager.initializeSpotifyData(accessToken, {
  autoRefresh: true,           // Enable automatic data refresh
  refreshInterval: 30 * 60 * 1000, // Refresh every 30 minutes
  maxDataAge: 2 * 60 * 60 * 1000   // Consider data stale after 2 hours
});
```

## 🔄 Advanced Usage

### Manual Data Refresh
```javascript
// Force refresh data
const result = await SpotifyDataManager.forceRefreshData(accessToken);

// Check if refresh is needed
if (!SpotifyDataManager.isDataFresh()) {
  await SpotifyDataManager.forceRefreshData(accessToken);
}
```

### Data Status Monitoring
```javascript
const status = SpotifyDataManager.getDataStatus();
console.log({
  hasData: status.hasData,
  ageMinutes: status.ageMinutes,
  isFresh: status.isFresh,
  totalTracks: status.totalTracks
});
```

### Automatic Refresh with Cleanup
```javascript
const result = await SpotifyDataManager.initializeSpotifyData(accessToken, {
  autoRefresh: true,
  refreshInterval: 15 * 60 * 1000 // 15 minutes
});

// Later, cancel auto-refresh
if (result.cancelAutoRefresh) {
  result.cancelAutoRefresh();
}
```

## 🧪 Development & Testing

### Generate Mock Data
```javascript
import { devHelpers } from './scripts/fetchSpotifyData';

// Generate mock data for testing
devHelpers.generateMockData();

// Debug stored data
devHelpers.logStoredData();
```

### Demo Component
Add the demo component to your app to test the functionality:

```javascript
import SpotifyDataDemo from './components/SpotifyDataDemo';

// In your app
<SpotifyDataDemo />
```

## 📱 Integration with Existing Code

### Using with Gemini Service
```javascript
import { generateRoast } from './services/geminiService';
import SpotifyDataManager from './scripts/spotifyDataManager';

// Get roasting data and generate roast
const roastingData = SpotifyDataManager.getUserMusicData('roasting');
if (roastingData) {
  const roast = await generateRoast('mohanlal', {
    topArtists: { mediumTerm: roastingData.topArtists },
    topTracks: { mediumTerm: roastingData.topTracks },
    insights: roastingData.insights
  });
}
```

### Storage Management
```javascript
// Clear all data
SpotifyDataManager.clearAllData();

// Export data for backup
import { exportSpotifyData, importSpotifyData } from './scripts/fetchSpotifyData';
const backup = exportSpotifyData();

// Import data from backup
importSpotifyData(backup);
```

## 🛠️ Error Handling

```javascript
try {
  const result = await SpotifyDataManager.initializeSpotifyData(accessToken);
  
  if (!result.success) {
    console.error('Failed to fetch data:', result.error);
    // Handle error (show message to user, use cached data, etc.)
  }
} catch (error) {
  console.error('Unexpected error:', error);
  // Handle unexpected errors
}
```

## 📈 Performance Tips

1. **Use cached data when possible**: Always check `getDataStatus()` before fetching new data
2. **Configure refresh intervals**: Don't refresh too frequently to avoid rate limits
3. **Use appropriate data formats**: Use 'summary' or 'roasting' formats instead of 'full' when you don't need all data
4. **Monitor storage usage**: Large datasets might fill localStorage quickly

## 🔐 Security Notes

- Never store access tokens in localStorage
- Always validate tokens before making API calls
- Handle token expiration gracefully
- Consider implementing token refresh logic

## 📋 API Rate Limits

Spotify API has rate limits. The script handles this by:
- Batching requests efficiently
- Providing configurable refresh intervals
- Caching data to reduce API calls
- Graceful error handling for rate limit errors

## 🚦 Production Deployment

For production, consider:

1. Setting longer refresh intervals (30-60 minutes)
2. Implementing proper error logging
3. Adding user notifications for data refresh status
4. Monitoring localStorage usage
5. Implementing data compression for large datasets

---

## Example: Complete Integration

```javascript
// App.js or main component
import React, { useEffect, useState } from 'react';
import SpotifyDataManager from './scripts/spotifyDataManager';

const App = () => {
  const [musicReady, setMusicReady] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // Get token from OAuth or stored location
    const token = getSpotifyToken(); // Your token retrieval logic
    setAccessToken(token);

    if (token) {
      initializeMusicData(token);
    }
  }, []);

  const initializeMusicData = async (token) => {
    try {
      const result = await SpotifyDataManager.initializeSpotifyData(token, {
        autoRefresh: true,
        refreshInterval: 30 * 60 * 1000, // 30 minutes
        maxDataAge: 2 * 60 * 60 * 1000   // 2 hours
      });

      if (result.success) {
        setMusicReady(true);
        console.log('🎵 Music data ready for roasting!');
      }
    } catch (error) {
      console.error('Failed to initialize music data:', error);
    }
  };

  return (
    <div>
      {musicReady ? (
        <YourMainApp />
      ) : (
        <div>Loading your music taste...</div>
      )}
    </div>
  );
};
```

This setup ensures your app always has fresh music data available for the roasting functionality!
