// Spotify API service for fetching user's music data

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * Get user's top tracks from Spotify
 * @param {string} accessToken - Spotify access token
 * @param {string} timeRange - Time range: 'short_term', 'medium_term', 'long_term'
 * @param {number} limit - Number of tracks to fetch (max 50)
 * @returns {Promise<Object>} - Top tracks data
 */
export const getTopTracks = async (accessToken, timeRange = 'medium_term', limit = 20) => {
  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.items,
      total: data.total,
      timeRange
    };
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Get user's top artists from Spotify
 * @param {string} accessToken - Spotify access token
 * @param {string} timeRange - Time range: 'short_term', 'medium_term', 'long_term'
 * @param {number} limit - Number of artists to fetch (max 50)
 * @returns {Promise<Object>} - Top artists data
 */
export const getTopArtists = async (accessToken, timeRange = 'medium_term', limit = 20) => {
  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/me/top/artists?time_range=${timeRange}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.items,
      total: data.total,
      timeRange
    };
  } catch (error) {
    console.error('Error fetching top artists:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Get user's recently played tracks
 * @param {string} accessToken - Spotify access token
 * @param {number} limit - Number of tracks to fetch (max 50)
 * @returns {Promise<Object>} - Recently played tracks data
 */
export const getRecentlyPlayed = async (accessToken, limit = 20) => {
  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/me/player/recently-played?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.items,
      cursors: data.cursors
    };
  } catch (error) {
    console.error('Error fetching recently played tracks:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Get comprehensive user music data for roasting
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<Object>} - Complete music analysis data
 */
export const getUserMusicAnalysis = async (accessToken) => {
  try {
    // Fetch data in parallel for better performance
    const [
      topTracksShort,
      topTracksMedium,
      topTracksLong,
      topArtistsShort,
      topArtistsMedium,
      topArtistsLong,
      recentlyPlayed
    ] = await Promise.all([
      getTopTracks(accessToken, 'short_term', 10),
      getTopTracks(accessToken, 'medium_term', 15),
      getTopTracks(accessToken, 'long_term', 10),
      getTopArtists(accessToken, 'short_term', 10),
      getTopArtists(accessToken, 'medium_term', 15),
      getTopArtists(accessToken, 'long_term', 10),
      getRecentlyPlayed(accessToken, 15)
    ]);

    // Process and analyze the data
    const analysis = {
      topTracks: {
        shortTerm: topTracksShort.data,
        mediumTerm: topTracksMedium.data,
        longTerm: topTracksLong.data
      },
      topArtists: {
        shortTerm: topArtistsShort.data,
        mediumTerm: topArtistsMedium.data,
        longTerm: topArtistsLong.data
      },
      recentlyPlayed: recentlyPlayed.data,
      insights: generateMusicInsights({
        topTracksShort,
        topTracksMedium,
        topTracksLong,
        topArtistsShort,
        topArtistsMedium,
        topArtistsLong,
        recentlyPlayed
      })
    };

    return {
      success: true,
      data: analysis
    };
  } catch (error) {
    console.error('Error getting user music analysis:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Generate insights for roasting material
 * @param {Object} musicData - All fetched music data
 * @returns {Object} - Insights for roasting
 */
const generateMusicInsights = (musicData) => {
  const insights = {
    genres: new Set(),
    topGenres: [],
    artistDiversity: 0,
    trackDiversity: 0,
    repeatListeningHabits: [],
    musicalEras: [],
    energyLevels: [],
    danceability: [],
    valence: [] // musical positivity
  };

  // Extract genres from top artists
  [musicData.topArtistsShort.data, musicData.topArtistsMedium.data, musicData.topArtistsLong.data]
    .flat()
    .forEach(artist => {
      if (artist && artist.genres) {
        artist.genres.forEach(genre => insights.genres.add(genre));
      }
    });

  insights.topGenres = Array.from(insights.genres).slice(0, 10);
  
  // Calculate diversity (unique artists vs total plays)
  const allArtists = new Set();
  [musicData.topArtistsShort.data, musicData.topArtistsMedium.data, musicData.topArtistsLong.data]
    .flat()
    .forEach(artist => {
      if (artist && artist.id) allArtists.add(artist.id);
    });
  
  insights.artistDiversity = allArtists.size;

  // Find repeat listening patterns
  const trackCounts = {};
  [musicData.topTracksShort.data, musicData.topTracksMedium.data, musicData.topTracksLong.data]
    .flat()
    .forEach(track => {
      if (track && track.id) {
        trackCounts[track.id] = (trackCounts[track.id] || 0) + 1;
      }
    });

  insights.repeatListeningHabits = Object.entries(trackCounts)
    .filter(([_, count]) => count > 1)
    .map(([trackId, count]) => ({ trackId, count }));

  return insights;
};

/**
 * Format track data for display
 * @param {Object} track - Spotify track object
 * @returns {Object} - Formatted track data
 */
export const formatTrackData = (track) => {
  return {
    id: track.id,
    name: track.name,
    artist: track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist',
    album: track.album?.name || 'Unknown Album',
    image: track.album?.images?.[0]?.url || null,
    preview_url: track.preview_url,
    external_url: track.external_urls?.spotify,
    popularity: track.popularity,
    duration_ms: track.duration_ms,
    explicit: track.explicit
  };
};

/**
 * Format artist data for display
 * @param {Object} artist - Spotify artist object
 * @returns {Object} - Formatted artist data
 */
export const formatArtistData = (artist) => {
  return {
    id: artist.id,
    name: artist.name,
    genres: artist.genres || [],
    image: artist.images?.[0]?.url || null,
    external_url: artist.external_urls?.spotify,
    popularity: artist.popularity,
    followers: artist.followers?.total || 0
  };
};
