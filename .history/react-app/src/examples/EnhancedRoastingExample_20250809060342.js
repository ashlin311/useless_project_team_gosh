/**
 * Integration Example: How to use the Spotify Data Scripts with your existing Roasting functionality
 * 
 * This file shows how to integrate the new data fetching scripts with your existing
 * RoastingPage component and Gemini service.
 */

import React, { useState, useEffect } from 'react';
import { useSpotifyData } from '../hooks/useSpotifyData';
import SpotifyDataManager from '../scripts/spotifyDataManager';
import { generateRoast } from '../services/geminiService';

/**
 * Enhanced RoastingPage component with localStorage integration
 */
const EnhancedRoastingPage = ({ accessToken, selectedActor }) => {
  const [roastResult, setRoastResult] = useState(null);
  const [roasting, setRoasting] = useState(false);

  // Use the enhanced hook with localStorage support
  const {
    musicData,
    loading: dataLoading,
    error: dataError,
    hasData,
    isFresh,
    refreshData,
    isReady
  } = useSpotifyData(accessToken, {
    useLocalStorage: true,
    autoRefresh: true,
    refreshInterval: 30 * 60 * 1000, // 30 minutes
    maxDataAge: 2 * 60 * 60 * 1000   // 2 hours
  });

  // Generate roast using cached data
  const handleGenerateRoast = async () => {
    if (!isReady || !selectedActor) return;

    setRoasting(true);
    setRoastResult(null);

    try {
      // Get roasting-optimized data
      const roastingData = SpotifyDataManager.getUserMusicData('roasting');
      
      if (!roastingData) {
        throw new Error('No music data available for roasting');
      }

      // Transform data to match existing generateRoast function format
      const spotifyDataForRoast = {
        topArtists: {
          mediumTerm: roastingData.topArtists
        },
        topTracks: {
          mediumTerm: roastingData.topTracks
        },
        insights: {
          topGenres: roastingData.topGenres,
          ...roastingData.insights
        }
      };

      console.log('🎭 Generating roast with data:', {
        actor: selectedActor,
        tracks: roastingData.topTracks.length,
        artists: roastingData.topArtists.length,
        genres: roastingData.topGenres.length,
        flags: roastingData.roastingFlags
      });

      const result = await generateRoast(selectedActor, spotifyDataForRoast);
      setRoastResult(result);

    } catch (error) {
      console.error('❌ Error generating roast:', error);
      setRoastResult({
        success: false,
        error: error.message,
        fallbackRoast: `Ayyo, even I'm confused by your music taste! Try refreshing your data, machane! 😅`
      });
    } finally {
      setRoasting(false);
    }
  };

  // Auto-generate roast when data becomes ready
  useEffect(() => {
    if (isReady && selectedActor && !roastResult && !roasting) {
      handleGenerateRoast();
    }
  }, [isReady, selectedActor]);

  // Show loading state while fetching data
  if (dataLoading) {
    return (
      <div className="roasting-page loading">
        <div className="loading-content">
          <h2>🎵 Analyzing your music taste...</h2>
          <p>Fetching your Spotify data for the ultimate roast</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (dataError) {
    return (
      <div className="roasting-page error">
        <div className="error-content">
          <h2>❌ Oops! Something went wrong</h2>
          <p>Error: {dataError}</p>
          <button onClick={() => refreshData()} className="retry-button">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show no data state
  if (!hasData) {
    return (
      <div className="roasting-page no-data">
        <div className="no-data-content">
          <h2>🎵 No Music Data Found</h2>
          <p>We need your Spotify data to create the perfect roast!</p>
          <button onClick={() => refreshData()} className="fetch-button">
            📡 Fetch My Music Data
          </button>
        </div>
      </div>
    );
  }

  // Show stale data warning
  if (!isFresh) {
    return (
      <div className="roasting-page stale-data">
        <div className="stale-data-content">
          <h2>⚠️ Your music data is a bit stale</h2>
          <p>Let's get fresh data for a better roast!</p>
          <button onClick={() => refreshData()} className="refresh-button">
            🔄 Refresh Data
          </button>
          <button onClick={handleGenerateRoast} className="proceed-button">
            🎭 Proceed with Old Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="roasting-page">
      {/* Data Status Indicator */}
      <div className="data-status">
        <span className="status-indicator fresh">✅ Fresh data loaded</span>
        <button onClick={() => refreshData()} className="refresh-mini">
          🔄
        </button>
      </div>

      {/* Music Summary */}
      <div className="music-summary">
        <h3>🎵 Your Music at a Glance</h3>
        {musicData && (
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Top Track:</span>
              <span className="value">
                {musicData.topTracks?.mediumTerm?.[0]?.name || 'Unknown'}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Top Artist:</span>
              <span className="value">
                {musicData.topArtists?.mediumTerm?.[0]?.name || 'Unknown'}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Top Genres:</span>
              <span className="value">
                {musicData.insights?.topGenres?.slice(0, 3).join(', ') || 'Various'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Roast Generation */}
      <div className="roast-section">
        {roasting ? (
          <div className="generating-roast">
            <h3>🎭 {selectedActor} is preparing your roast...</h3>
            <div className="roast-spinner"></div>
          </div>
        ) : roastResult ? (
          <div className="roast-result">
            {roastResult.success ? (
              <div className="successful-roast">
                <h3>🎭 {roastResult.actor} says:</h3>
                <p className="roast-text">{roastResult.roast}</p>
                <button onClick={handleGenerateRoast} className="regenerate-button">
                  🔄 Get Another Roast
                </button>
              </div>
            ) : (
              <div className="failed-roast">
                <h3>❌ Roast Failed</h3>
                <p>{roastResult.fallbackRoast || roastResult.error}</p>
                <button onClick={handleGenerateRoast} className="retry-roast-button">
                  🎭 Try Again
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="ready-to-roast">
            <h3>🎭 Ready for your roast?</h3>
            <button onClick={handleGenerateRoast} className="generate-roast-button">
              🔥 Generate Roast
            </button>
          </div>
        )}
      </div>

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <details>
            <summary>🐛 Debug Info</summary>
            <pre>{JSON.stringify({
              hasData,
              isFresh,
              tracksCount: musicData?.topTracks?.mediumTerm?.length || 0,
              artistsCount: musicData?.topArtists?.mediumTerm?.length || 0,
              genresCount: musicData?.insights?.topGenres?.length || 0,
              lastUpdated: musicData?.metadata?.fetchedAt
            }, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

/**
 * Utility function to check if user has sufficient data for roasting
 */
export const hasMinimumDataForRoasting = () => {
  const roastingData = SpotifyDataManager.getUserMusicData('roasting');
  
  if (!roastingData) return false;

  return (
    roastingData.topTracks.length >= 3 &&
    roastingData.topArtists.length >= 3 &&
    roastingData.topGenres.length >= 1
  );
};

/**
 * Function to get roast difficulty level based on user's music data
 */
export const getRoastDifficultyLevel = () => {
  const roastingData = SpotifyDataManager.getUserMusicData('roasting');
  
  if (!roastingData) return 'unknown';

  const flags = roastingData.roastingFlags || [];
  
  if (flags.length >= 3) return 'extreme'; // Lots of roastable material
  if (flags.length >= 2) return 'high';
  if (flags.length >= 1) return 'medium';
  return 'low'; // Diverse, well-rounded taste
};

/**
 * Function to get personalized roast prompt enhancements
 */
export const getRoastPromptEnhancements = () => {
  const roastingData = SpotifyDataManager.getUserMusicData('roasting');
  
  if (!roastingData) return '';

  const flags = roastingData.roastingFlags || [];
  const enhancements = [];

  if (flags.includes('low_artist_diversity')) {
    enhancements.push('Focus on their limited artist variety and repetitive listening habits.');
  }

  if (flags.includes('narrow_genre_taste')) {
    enhancements.push('Mock their narrow musical horizons and genre tunnel vision.');
  }

  if (flags.includes('excessive_repeats')) {
    enhancements.push('Call out their obsessive track repetition and inability to discover new music.');
  }

  if (roastingData.insights?.mainstreamScore > 80) {
    enhancements.push('Roast their basic, mainstream music taste.');
  }

  if (roastingData.insights?.mainstreamScore < 20) {
    enhancements.push('Mock their pretentious indie/underground music snobbery.');
  }

  return enhancements.join(' ');
};

export default EnhancedRoastingPage;
