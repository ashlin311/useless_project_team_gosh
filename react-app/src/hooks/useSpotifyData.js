import { useState, useEffect, useCallback } from 'react';
import { getUserMusicAnalysis, getTopTracks, getTopArtists, formatTrackData, formatArtistData } from '../services/spotifyService';

/**
 * Custom hook for fetching and managing Spotify music data
 * @param {string} accessToken - Spotify access token
 * @returns {Object} - Music data and loading states
 */
export const useSpotifyData = (accessToken) => {
  const [musicData, setMusicData] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch comprehensive music analysis
  const fetchMusicAnalysis = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getUserMusicAnalysis(accessToken);
      
      if (result.success) {
        setMusicData(result.data);
        
        // Format and set top tracks (medium term as default)
        const formattedTracks = result.data.topTracks.mediumTerm.map(formatTrackData);
        setTopTracks(formattedTracks);

        // Format and set top artists (medium term as default)
        const formattedArtists = result.data.topArtists.mediumTerm.map(formatArtistData);
        setTopArtists(formattedArtists);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Fetch specific time range data
  const fetchTimeRangeData = useCallback(async (timeRange = 'medium_term') => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const [tracksResult, artistsResult] = await Promise.all([
        getTopTracks(accessToken, timeRange, 20),
        getTopArtists(accessToken, timeRange, 20)
      ]);

      if (tracksResult.success && artistsResult.success) {
        const formattedTracks = tracksResult.data.map(formatTrackData);
        const formattedArtists = artistsResult.data.map(formatArtistData);
        
        setTopTracks(formattedTracks);
        setTopArtists(formattedArtists);
      } else {
        setError(tracksResult.error || artistsResult.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Auto-fetch data when access token is available
  useEffect(() => {
    if (accessToken) {
      fetchMusicAnalysis();
    }
  }, [accessToken, fetchMusicAnalysis]);

  return {
    musicData,
    topTracks,
    topArtists,
    loading,
    error,
    fetchMusicAnalysis,
    fetchTimeRangeData,
    refetch: fetchMusicAnalysis
  };
};

/**
 * Hook for getting roasting insights from music data
 * @param {Object} musicData - Processed music data
 * @returns {Object} - Roasting insights and statistics
 */
export const useRoastingInsights = (musicData) => {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (!musicData) return;

    const generateRoastingInsights = () => {
      const roastingMaterial = {
        // Music taste diversity
        genreDiversity: {
          score: musicData.insights?.topGenres?.length || 0,
          genres: musicData.insights?.topGenres || [],
          roastLevel: musicData.insights?.topGenres?.length < 3 ? 'high' : 'low'
        },

        // Artist loyalty vs exploration
        artistLoyalty: {
          totalArtists: musicData.insights?.artistDiversity || 0,
          repeatListening: musicData.insights?.repeatListeningHabits?.length || 0,
          roastLevel: musicData.insights?.artistDiversity < 10 ? 'high' : 'low'
        },

        // Most played tracks for roasting
        mostPlayedTracks: musicData.topTracks?.mediumTerm?.slice(0, 5) || [],
        
        // Most played artists for roasting
        mostPlayedArtists: musicData.topArtists?.mediumTerm?.slice(0, 5) || [],

        // Recent listening habits
        recentHabits: musicData.recentlyPlayed?.slice(0, 5) || [],

        // Time-based listening patterns
        consistencyScore: calculateConsistencyScore(musicData),
        
        // Mainstream vs indie preference
        mainstreamScore: calculateMainstreamScore(musicData)
      };

      return roastingMaterial;
    };

    setInsights(generateRoastingInsights());
  }, [musicData]);

  return insights;
};

// Helper function to calculate how consistent user's taste is across time periods
const calculateConsistencyScore = (musicData) => {
  if (!musicData?.topArtists) return 0;

  const shortTerm = new Set(musicData.topArtists.shortTerm?.map(a => a.id) || []);
  const mediumTerm = new Set(musicData.topArtists.mediumTerm?.map(a => a.id) || []);
  const longTerm = new Set(musicData.topArtists.longTerm?.map(a => a.id) || []);

  // Calculate overlap between time periods
  const shortMediumOverlap = [...shortTerm].filter(id => mediumTerm.has(id)).length;
  const mediumLongOverlap = [...mediumTerm].filter(id => longTerm.has(id)).length;
  
  const totalOverlap = shortMediumOverlap + mediumLongOverlap;
  const maxPossibleOverlap = Math.min(shortTerm.size, mediumTerm.size) + Math.min(mediumTerm.size, longTerm.size);
  
  return maxPossibleOverlap > 0 ? (totalOverlap / maxPossibleOverlap) * 100 : 0;
};

// Helper function to calculate how mainstream user's taste is
const calculateMainstreamScore = (musicData) => {
  if (!musicData?.topTracks?.mediumTerm) return 0;

  const popularityScores = musicData.topTracks.mediumTerm
    .map(track => track.popularity || 0)
    .filter(score => score > 0);

  if (popularityScores.length === 0) return 0;

  const averagePopularity = popularityScores.reduce((sum, score) => sum + score, 0) / popularityScores.length;
  return Math.round(averagePopularity);
};
