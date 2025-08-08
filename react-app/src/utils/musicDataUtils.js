// Utility functions to access stored Spotify music data

/**
 * Get stored music data from localStorage
 * @returns {Object|null} - Stored music data or null if not found
 */
export const getStoredMusicData = () => {
  try {
    const data = window.localStorage.getItem('spotify_music_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading stored music data:', error);
    return null;
  }
};

/**
 * Check if user has stored music data
 * @returns {boolean} - True if music data exists
 */
export const hasMusicData = () => {
  return getStoredMusicData() !== null;
};

/**
 * Get user's top tracks (medium term by default)
 * @param {string} timeRange - 'shortTerm', 'mediumTerm', or 'longTerm'
 * @returns {Array} - Array of top tracks
 */
export const getTopTracks = (timeRange = 'mediumTerm') => {
  const data = getStoredMusicData();
  return data?.topTracks?.[timeRange] || [];
};

/**
 * Get user's top artists (medium term by default)
 * @param {string} timeRange - 'shortTerm', 'mediumTerm', or 'longTerm'
 * @returns {Array} - Array of top artists
 */
export const getTopArtists = (timeRange = 'mediumTerm') => {
  const data = getStoredMusicData();
  return data?.topArtists?.[timeRange] || [];
};

/**
 * Get user's recently played tracks
 * @returns {Array} - Array of recently played tracks
 */
export const getRecentlyPlayed = () => {
  const data = getStoredMusicData();
  return data?.recentlyPlayed || [];
};

/**
 * Get music insights for roasting
 * @returns {Object|null} - Music insights or null
 */
export const getMusicInsights = () => {
  const data = getStoredMusicData();
  return data?.insights || null;
};

/**
 * Get roasting material summary
 * @returns {Object} - Summary of user's music taste for roasting
 */
export const getRoastingMaterial = () => {
  const data = getStoredMusicData();
  if (!data) return null;

  const insights = data.insights || {};
  const topTracks = data.topTracks?.mediumTerm || [];
  const topArtists = data.topArtists?.mediumTerm || [];

  return {
    // Basic stats
    totalTopTracks: topTracks.length,
    totalTopArtists: topArtists.length,
    totalGenres: insights.topGenres?.length || 0,
    
    // Top items for roasting
    mostPlayedTrack: topTracks[0] || null,
    mostPlayedArtist: topArtists[0] || null,
    topGenres: insights.topGenres?.slice(0, 5) || [],
    
    // Roasting insights
    genreDiversity: insights.topGenres?.length || 0,
    artistDiversity: insights.artistDiversity || 0,
    repeatListening: insights.repeatListeningHabits?.length || 0,
    
    // For roasting level calculation
    isGenreDiverse: (insights.topGenres?.length || 0) >= 5,
    isArtistDiverse: (insights.artistDiversity || 0) >= 15,
    hasRepeatListening: (insights.repeatListeningHabits?.length || 0) > 0,
    
    // Full data for detailed roasting
    allTopTracks: topTracks,
    allTopArtists: topArtists,
    recentlyPlayed: data.recentlyPlayed || []
  };
};

/**
 * Clear stored music data
 */
export const clearMusicData = () => {
  window.localStorage.removeItem('spotify_music_data');
};

/**
 * Log current music data to console (for debugging)
 */
export const debugMusicData = () => {
  const data = getStoredMusicData();
  console.log('🎵 Stored Music Data:', data);
  
  if (data) {
    console.log('📊 Roasting Material:', getRoastingMaterial());
  }
};
