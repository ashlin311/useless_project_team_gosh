/**
 * Spotify Data Manager - Simple Integration Script
 * 
 * This is a simplified version for easy integration into components.
 * It provides high-level functions to manage Spotify data fetching and storage.
 */

import { fetchAndStoreSpotifyData, getStoredSpotifyData, scheduleDataRefresh } from './fetchSpotifyData.js';

/**
 * Initialize Spotify data management for the app
 * @param {string} accessToken - Spotify access token
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Initialization result
 */
export const initializeSpotifyData = async (accessToken, options = {}) => {
  const config = {
    autoRefresh: true,
    refreshInterval: 30 * 60 * 1000, // 30 minutes
    maxDataAge: 2 * 60 * 60 * 1000,  // 2 hours
    ...options
  };

  try {
    console.log('🎵 Initializing Spotify data management...');

    // Check if we have fresh data
    const existingData = getStoredSpotifyData();
    const needsRefresh = !existingData || !isDataFresh(config.maxDataAge);

    let result;
    if (needsRefresh) {
      console.log('📡 Fetching fresh Spotify data...');
      result = await fetchAndStoreSpotifyData(accessToken);
    } else {
      console.log('✅ Using existing fresh data');
      result = {
        success: true,
        data: existingData,
        message: 'Using cached data',
        fromCache: true
      };
    }

    // Set up auto-refresh if enabled
    let cancelRefresh = null;
    if (config.autoRefresh && result.success) {
      cancelRefresh = scheduleDataRefresh(accessToken, config.refreshInterval);
    }

    return {
      ...result,
      cancelAutoRefresh: cancelRefresh,
      config
    };

  } catch (error) {
    console.error('❌ Failed to initialize Spotify data:', error);
    return {
      success: false,
      error: error.message,
      message: 'Initialization failed'
    };
  }
};

/**
 * Get user's music data for roasting or display
 * @param {string} format - 'full' | 'summary' | 'roasting'
 * @returns {Object|null} - Formatted music data
 */
export const getUserMusicData = (format = 'full') => {
  const data = getStoredSpotifyData();
  if (!data) return null;

  switch (format) {
    case 'summary':
      return {
        topTrack: data.topTracks?.mediumTerm?.[0],
        topArtist: data.topArtists?.mediumTerm?.[0],
        topGenres: data.insights?.topGenres?.slice(0, 5) || [],
        totalTracks: data.topTracks?.mediumTerm?.length || 0,
        totalArtists: data.topArtists?.mediumTerm?.length || 0,
        lastUpdated: data.metadata?.fetchedAt
      };

    case 'roasting':
      return {
        topTracks: data.topTracks?.mediumTerm?.slice(0, 10) || [],
        topArtists: data.topArtists?.mediumTerm?.slice(0, 10) || [],
        topGenres: data.insights?.topGenres?.slice(0, 8) || [],
        recentlyPlayed: data.recentlyPlayed?.slice(0, 5) || [],
        insights: data.insights || {},
        roastingFlags: data.insights?.roastingFlags || []
      };

    case 'full':
    default:
      return data;
  }
};

/**
 * Check if current data is fresh enough
 * @param {number} maxAge - Maximum age in milliseconds
 * @returns {boolean} - Whether data is fresh
 */
export const isDataFresh = (maxAge = 2 * 60 * 60 * 1000) => {
  try {
    const lastUpdated = localStorage.getItem('spotify_data_last_updated');
    if (!lastUpdated) return false;
    
    const age = Date.now() - parseInt(lastUpdated);
    return age < maxAge;
  } catch (error) {
    return false;
  }
};

/**
 * Force refresh user's music data
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<Object>} - Refresh result
 */
export const forceRefreshData = async (accessToken) => {
  try {
    console.log('🔄 Force refreshing Spotify data...');
    return await fetchAndStoreSpotifyData(accessToken);
  } catch (error) {
    console.error('❌ Force refresh failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get data status and statistics
 * @returns {Object} - Data status information
 */
export const getDataStatus = () => {
  const data = getStoredSpotifyData();
  const lastUpdated = localStorage.getItem('spotify_data_last_updated');
  
  if (!data) {
    return {
      hasData: false,
      message: 'No data available'
    };
  }

  const age = lastUpdated ? Date.now() - parseInt(lastUpdated) : 0;
  const ageMinutes = Math.floor(age / (1000 * 60));
  
  return {
    hasData: true,
    dataAge: age,
    ageMinutes,
    isFresh: isDataFresh(),
    totalTracks: data.metadata?.totalItems?.tracks || 0,
    totalArtists: data.metadata?.totalItems?.artists || 0,
    topGenres: data.insights?.topGenres?.length || 0,
    lastUpdated: data.metadata?.fetchedAt || 'Unknown',
    message: `Data is ${ageMinutes} minutes old`
  };
};

/**
 * Clear all stored Spotify data
 */
export const clearAllData = () => {
  try {
    ['spotify_music_data', 'spotify_data_last_updated', 'spotify_summary', 'spotify_user_preferences']
      .forEach(key => localStorage.removeItem(key));
    
    console.log('🗑️ All Spotify data cleared');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

// Export as default object for easy importing
export default {
  initializeSpotifyData,
  getUserMusicData,
  forceRefreshData,
  getDataStatus,
  isDataFresh,
  clearAllData
};
