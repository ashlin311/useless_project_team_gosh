/**
 * Spotify Data Fetcher Script
 * 
 * This script fetches user's top tracks and artists from Spotify API
 * and stores them in localStorage for offline use and roasting functionality.
 * 
 * Usage:
 * import { fetchAndStoreSpotifyData, scheduleDataRefresh } from './scripts/fetchSpotifyData';
 * 
 * // Fetch and store data
 * await fetchAndStoreSpotifyData(accessToken);
 * 
 * // Set up automatic refresh
 * scheduleDataRefresh(accessToken, 60 * 60 * 1000); // Refresh every hour
 */

import { 
  getUserMusicAnalysis, 
  getTopTracks, 
  getTopArtists, 
  getRecentlyPlayed,
  formatTrackData,
  formatArtistData 
} from '../services/spotifyService.js';

// Storage keys
const STORAGE_KEYS = {
  MUSIC_DATA: 'spotify_music_data',
  LAST_UPDATED: 'spotify_data_last_updated',
  USER_PREFERENCES: 'spotify_user_preferences'
};

// Default configuration
const DEFAULT_CONFIG = {
  trackLimits: {
    shortTerm: 10,
    mediumTerm: 20,
    longTerm: 15
  },
  artistLimits: {
    shortTerm: 10,
    mediumTerm: 20,
    longTerm: 15
  },
  recentlyPlayedLimit: 25,
  refreshIntervalMs: 30 * 60 * 1000, // 30 minutes
  maxStorageAge: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Main function to fetch comprehensive Spotify data and store in localStorage
 * @param {string} accessToken - Valid Spotify access token
 * @param {Object} config - Optional configuration overrides
 * @returns {Promise<Object>} - Result object with success status and data
 */
export const fetchAndStoreSpotifyData = async (accessToken, config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    console.log('🎵 Starting Spotify data fetch...');
    
    // Validate access token
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Valid access token is required');
    }

    // Fetch all data in parallel for optimal performance
    const fetchPromises = [
      // Top Tracks - Different time ranges
      getTopTracks(accessToken, 'short_term', finalConfig.trackLimits.shortTerm),
      getTopTracks(accessToken, 'medium_term', finalConfig.trackLimits.mediumTerm),
      getTopTracks(accessToken, 'long_term', finalConfig.trackLimits.longTerm),
      
      // Top Artists - Different time ranges
      getTopArtists(accessToken, 'short_term', finalConfig.artistLimits.shortTerm),
      getTopArtists(accessToken, 'medium_term', finalConfig.artistLimits.mediumTerm),
      getTopArtists(accessToken, 'long_term', finalConfig.artistLimits.longTerm),
      
      // Recently played tracks
      getRecentlyPlayed(accessToken, finalConfig.recentlyPlayedLimit)
    ];

    console.log('📡 Fetching data from Spotify API...');
    const [
      topTracksShort,
      topTracksMedium,
      topTracksLong,
      topArtistsShort,
      topArtistsMedium,
      topArtistsLong,
      recentlyPlayed
    ] = await Promise.all(fetchPromises);

    // Check if all requests were successful
    const results = [topTracksShort, topTracksMedium, topTracksLong, topArtistsShort, topArtistsMedium, topArtistsLong, recentlyPlayed];
    const failedRequests = results.filter(result => !result.success);
    
    if (failedRequests.length > 0) {
      console.warn('⚠️ Some requests failed:', failedRequests);
    }

    // Format and structure the data
    const musicData = {
      topTracks: {
        shortTerm: topTracksShort.success ? topTracksShort.data.map(formatTrackData) : [],
        mediumTerm: topTracksMedium.success ? topTracksMedium.data.map(formatTrackData) : [],
        longTerm: topTracksLong.success ? topTracksLong.data.map(formatTrackData) : []
      },
      topArtists: {
        shortTerm: topArtistsShort.success ? topArtistsShort.data.map(formatArtistData) : [],
        mediumTerm: topArtistsMedium.success ? topArtistsMedium.data.map(formatArtistData) : [],
        longTerm: topArtistsLong.success ? topArtistsLong.data.map(formatArtistData) : []
      },
      recentlyPlayed: recentlyPlayed.success ? 
        recentlyPlayed.data.map(item => ({
          ...formatTrackData(item.track),
          played_at: item.played_at,
          context: item.context
        })) : [],
      insights: generateAdvancedInsights(results),
      metadata: {
        fetchedAt: new Date().toISOString(),
        version: '2.0',
        config: finalConfig,
        totalItems: {
          tracks: (topTracksShort.data?.length || 0) + (topTracksMedium.data?.length || 0) + (topTracksLong.data?.length || 0),
          artists: (topArtistsShort.data?.length || 0) + (topArtistsMedium.data?.length || 0) + (topArtistsLong.data?.length || 0),
          recentlyPlayed: recentlyPlayed.data?.length || 0
        }
      }
    };

    // Store in localStorage
    await storeSpotifyData(musicData);
    
    console.log('✅ Spotify data successfully fetched and stored!');
    console.log('📊 Data summary:', {
      tracks: musicData.metadata.totalItems.tracks,
      artists: musicData.metadata.totalItems.artists,
      recentlyPlayed: musicData.metadata.totalItems.recentlyPlayed,
      genres: musicData.insights.topGenres?.length || 0
    });

    return {
      success: true,
      data: musicData,
      message: 'Spotify data successfully fetched and stored',
      errors: failedRequests.map(req => req.error)
    };

  } catch (error) {
    console.error('❌ Error fetching Spotify data:', error);
    
    return {
      success: false,
      error: error.message,
      data: null,
      message: 'Failed to fetch Spotify data'
    };
  }
};

/**
 * Store Spotify data in localStorage with compression and validation
 * @param {Object} musicData - Formatted music data
 */
const storeSpotifyData = async (musicData) => {
  try {
    // Store main data
    localStorage.setItem(STORAGE_KEYS.MUSIC_DATA, JSON.stringify(musicData));
    
    // Store timestamp
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, Date.now().toString());
    
    // Store quick access summary for performance
    const summary = {
      topTrack: musicData.topTracks.mediumTerm[0]?.name || 'Unknown',
      topArtist: musicData.topArtists.mediumTerm[0]?.name || 'Unknown',
      topGenres: musicData.insights.topGenres?.slice(0, 3) || [],
      totalItems: musicData.metadata.totalItems,
      lastUpdated: musicData.metadata.fetchedAt
    };
    
    localStorage.setItem('spotify_summary', JSON.stringify(summary));
    
    console.log('💾 Data stored in localStorage');
    
  } catch (error) {
    console.error('Error storing data:', error);
    
    // Try to free up space by removing old data
    clearOldSpotifyData();
    
    // Retry with essential data only
    const essentialData = {
      topTracks: { mediumTerm: musicData.topTracks.mediumTerm.slice(0, 10) },
      topArtists: { mediumTerm: musicData.topArtists.mediumTerm.slice(0, 10) },
      insights: musicData.insights,
      metadata: musicData.metadata
    };
    
    localStorage.setItem(STORAGE_KEYS.MUSIC_DATA, JSON.stringify(essentialData));
    console.log('💾 Essential data stored after cleanup');
  }
};

/**
 * Generate advanced insights for roasting and analysis
 * @param {Array} results - Array of API results
 * @returns {Object} - Advanced insights object
 */
const generateAdvancedInsights = (results) => {
  const [topTracksShort, topTracksMedium, topTracksLong, topArtistsShort, topArtistsMedium, topArtistsLong, recentlyPlayed] = results;
  
  const insights = {
    genres: new Set(),
    topGenres: [],
    artistDiversity: 0,
    trackDiversity: 0,
    repeatListeningHabits: [],
    musicalJourney: [],
    energyProfile: {},
    listeningPatterns: {},
    roastingFlags: []
  };

  // Collect all genres
  [topArtistsShort.data, topArtistsMedium.data, topArtistsLong.data]
    .filter(data => data)
    .flat()
    .forEach(artist => {
      if (artist?.genres) {
        artist.genres.forEach(genre => insights.genres.add(genre));
      }
    });

  insights.topGenres = Array.from(insights.genres).slice(0, 15);

  // Calculate diversity metrics
  const allArtistIds = new Set();
  const allTrackIds = new Set();
  
  [topArtistsShort.data, topArtistsMedium.data, topArtistsLong.data]
    .filter(data => data)
    .flat()
    .forEach(artist => {
      if (artist?.id) allArtistIds.add(artist.id);
    });

  [topTracksShort.data, topTracksMedium.data, topTracksLong.data]
    .filter(data => data)
    .flat()
    .forEach(track => {
      if (track?.id) allTrackIds.add(track.id);
    });

  insights.artistDiversity = allArtistIds.size;
  insights.trackDiversity = allTrackIds.size;

  // Analyze repeat listening
  const trackFrequency = {};
  [topTracksShort.data, topTracksMedium.data, topTracksLong.data]
    .filter(data => data)
    .flat()
    .forEach(track => {
      if (track?.id) {
        trackFrequency[track.id] = (trackFrequency[track.id] || 0) + 1;
      }
    });

  insights.repeatListeningHabits = Object.entries(trackFrequency)
    .filter(([_, count]) => count > 1)
    .map(([trackId, count]) => ({ trackId, count }))
    .sort((a, b) => b.count - a.count);

  // Generate roasting flags
  if (insights.artistDiversity < 10) {
    insights.roastingFlags.push('low_artist_diversity');
  }
  
  if (insights.topGenres.length < 3) {
    insights.roastingFlags.push('narrow_genre_taste');
  }
  
  if (insights.repeatListeningHabits.length > 5) {
    insights.roastingFlags.push('excessive_repeats');
  }

  // Musical journey analysis (comparing time ranges)
  const shortTermArtists = topArtistsShort.data?.map(a => a.name) || [];
  const longTermArtists = topArtistsLong.data?.map(a => a.name) || [];
  
  const consistent = shortTermArtists.filter(artist => longTermArtists.includes(artist));
  const evolving = shortTermArtists.filter(artist => !longTermArtists.includes(artist));
  
  insights.musicalJourney = {
    consistentFavorites: consistent.slice(0, 5),
    recentDiscoveries: evolving.slice(0, 5),
    stabilityScore: consistent.length / Math.max(shortTermArtists.length, 1)
  };

  return insights;
};

/**
 * Get stored Spotify data from localStorage
 * @param {boolean} includeMetadata - Whether to include metadata
 * @returns {Object|null} - Stored data or null
 */
export const getStoredSpotifyData = (includeMetadata = false) => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MUSIC_DATA);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    if (!includeMetadata && parsed.metadata) {
      delete parsed.metadata;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error reading stored Spotify data:', error);
    return null;
  }
};

/**
 * Check if stored data is fresh enough
 * @param {number} maxAgeMs - Maximum age in milliseconds
 * @returns {boolean} - Whether data is fresh
 */
export const isStoredDataFresh = (maxAgeMs = DEFAULT_CONFIG.maxStorageAge) => {
  try {
    const lastUpdated = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
    if (!lastUpdated) return false;
    
    const age = Date.now() - parseInt(lastUpdated);
    return age < maxAgeMs;
  } catch (error) {
    console.error('Error checking data freshness:', error);
    return false;
  }
};

/**
 * Clear old or corrupted Spotify data
 */
export const clearOldSpotifyData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('spotify_summary');
    console.log('🗑️ Old Spotify data cleared');
  } catch (error) {
    console.error('Error clearing old data:', error);
  }
};

/**
 * Get quick summary of stored data
 * @returns {Object|null} - Quick summary or null
 */
export const getStoredDataSummary = () => {
  try {
    const summary = localStorage.getItem('spotify_summary');
    return summary ? JSON.parse(summary) : null;
  } catch (error) {
    console.error('Error reading data summary:', error);
    return null;
  }
};

/**
 * Refresh data if it's stale
 * @param {string} accessToken - Spotify access token
 * @param {number} maxAgeMs - Maximum age before refresh
 * @returns {Promise<Object>} - Result of refresh operation
 */
export const refreshIfStale = async (accessToken, maxAgeMs = DEFAULT_CONFIG.maxStorageAge) => {
  try {
    if (isStoredDataFresh(maxAgeMs)) {
      console.log('✅ Stored data is fresh, no refresh needed');
      return {
        success: true,
        refreshed: false,
        data: getStoredSpotifyData(),
        message: 'Data is fresh'
      };
    }
    
    console.log('🔄 Data is stale, refreshing...');
    return await fetchAndStoreSpotifyData(accessToken);
    
  } catch (error) {
    console.error('Error in refresh check:', error);
    return {
      success: false,
      refreshed: false,
      error: error.message
    };
  }
};

/**
 * Schedule automatic data refresh
 * @param {string} accessToken - Spotify access token
 * @param {number} intervalMs - Refresh interval in milliseconds
 * @returns {Function} - Function to cancel the scheduled refresh
 */
export const scheduleDataRefresh = (accessToken, intervalMs = DEFAULT_CONFIG.refreshIntervalMs) => {
  console.log(`⏰ Scheduled data refresh every ${intervalMs / 1000 / 60} minutes`);
  
  const intervalId = setInterval(async () => {
    console.log('🔄 Auto-refreshing Spotify data...');
    await refreshIfStale(accessToken);
  }, intervalMs);
  
  // Return cancel function
  return () => {
    clearInterval(intervalId);
    console.log('⏹️ Scheduled refresh cancelled');
  };
};

/**
 * Export data for backup or transfer
 * @returns {Object|null} - Exportable data object
 */
export const exportSpotifyData = () => {
  try {
    const data = getStoredSpotifyData(true);
    if (!data) return null;
    
    return {
      ...data,
      exportedAt: new Date().toISOString(),
      version: '2.0'
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

/**
 * Import data from backup
 * @param {Object} importData - Data to import
 * @returns {boolean} - Success status
 */
export const importSpotifyData = (importData) => {
  try {
    if (!importData || typeof importData !== 'object') {
      throw new Error('Invalid import data');
    }
    
    // Validate structure
    if (!importData.topTracks || !importData.topArtists) {
      throw new Error('Import data missing required fields');
    }
    
    // Store imported data
    localStorage.setItem(STORAGE_KEYS.MUSIC_DATA, JSON.stringify(importData));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, Date.now().toString());
    
    console.log('📥 Data imported successfully');
    return true;
    
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Development helper functions
export const devHelpers = {
  /**
   * Log detailed information about stored data
   */
  logStoredData: () => {
    const data = getStoredSpotifyData(true);
    const summary = getStoredDataSummary();
    
    console.group('🎵 Spotify Data Debug Info');
    console.log('Summary:', summary);
    console.log('Full Data:', data);
    console.log('Data Fresh:', isStoredDataFresh());
    console.log('Storage Usage:', {
      mainData: JSON.stringify(data || {}).length,
      summary: JSON.stringify(summary || {}).length
    });
    console.groupEnd();
  },
  
  /**
   * Simulate data fetch without API calls (for testing)
   */
  generateMockData: () => {
    const mockData = {
      topTracks: {
        shortTerm: [
          { id: '1', name: 'Mock Track 1', artist: 'Mock Artist 1', popularity: 80 }
        ],
        mediumTerm: [
          { id: '2', name: 'Mock Track 2', artist: 'Mock Artist 2', popularity: 75 }
        ],
        longTerm: [
          { id: '3', name: 'Mock Track 3', artist: 'Mock Artist 3', popularity: 70 }
        ]
      },
      topArtists: {
        shortTerm: [
          { id: '1', name: 'Mock Artist 1', genres: ['pop', 'rock'], popularity: 85 }
        ],
        mediumTerm: [
          { id: '2', name: 'Mock Artist 2', genres: ['indie', 'alternative'], popularity: 80 }
        ],
        longTerm: [
          { id: '3', name: 'Mock Artist 3', genres: ['electronic', 'dance'], popularity: 75 }
        ]
      },
      recentlyPlayed: [],
      insights: {
        topGenres: ['pop', 'rock', 'indie'],
        artistDiversity: 3,
        trackDiversity: 3,
        repeatListeningHabits: [],
        roastingFlags: []
      },
      metadata: {
        fetchedAt: new Date().toISOString(),
        version: '2.0',
        config: DEFAULT_CONFIG,
        totalItems: { tracks: 3, artists: 3, recentlyPlayed: 0 }
      }
    };
    
    localStorage.setItem(STORAGE_KEYS.MUSIC_DATA, JSON.stringify(mockData));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, Date.now().toString());
    
    console.log('🧪 Mock data generated and stored');
    return mockData;
  }
};

export default {
  fetchAndStoreSpotifyData,
  getStoredSpotifyData,
  refreshIfStale,
  scheduleDataRefresh,
  isStoredDataFresh,
  clearOldSpotifyData,
  getStoredDataSummary,
  exportSpotifyData,
  importSpotifyData,
  devHelpers
};
