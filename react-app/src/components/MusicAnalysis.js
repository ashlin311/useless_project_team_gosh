import React from 'react';
import { useSpotifyData, useRoastingInsights } from '../hooks/useSpotifyData';
import './MusicAnalysis.css';

const MusicAnalysis = ({ accessToken }) => {
  const { 
    musicData, 
    topTracks, 
    topArtists, 
    loading, 
    error, 
    fetchTimeRangeData 
  } = useSpotifyData(accessToken);

  const roastingInsights = useRoastingInsights(musicData);

  if (loading) {
    return (
      <div className="music-analysis-loading">
        <div className="loading-spinner"></div>
        <h3>🎵 Analyzing your music taste...</h3>
        <p>Getting ready to roast your musical choices!</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="music-analysis-error">
        <h3>❌ Oops! Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!musicData) {
    return (
      <div className="music-analysis-empty">
        <h3>🎼 No music data found</h3>
        <p>Make sure you have some listening history on Spotify!</p>
      </div>
    );
  }

  return (
    <div className="music-analysis">
      <div className="analysis-header">
        <h2>🎭 Your Music Analysis is Ready for Roasting!</h2>
        <p>Here's what our Malayalam actors will be commenting on:</p>
      </div>

      {/* Time Range Selector */}
      <div className="time-range-selector">
        <button 
          onClick={() => fetchTimeRangeData('short_term')}
          className="time-btn"
        >
          Last Month
        </button>
        <button 
          onClick={() => fetchTimeRangeData('medium_term')}
          className="time-btn active"
        >
          Last 6 Months
        </button>
        <button 
          onClick={() => fetchTimeRangeData('long_term')}
          className="time-btn"
        >
          All Time
        </button>
      </div>

      {/* Roasting Insights Summary */}
      {roastingInsights && (
        <div className="roasting-summary">
          <h3>🔥 Roasting Material Summary</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Genre Diversity</h4>
              <p>{roastingInsights.genreDiversity.score} genres</p>
              <span className={`roast-level ${roastingInsights.genreDiversity.roastLevel}`}>
                {roastingInsights.genreDiversity.roastLevel === 'high' ? '🎯 Easy Target' : '😅 Diverse Taste'}
              </span>
            </div>
            <div className="insight-card">
              <h4>Artist Loyalty</h4>
              <p>{roastingInsights.artistLoyalty.totalArtists} artists</p>
              <span className={`roast-level ${roastingInsights.artistLoyalty.roastLevel}`}>
                {roastingInsights.artistLoyalty.roastLevel === 'high' ? '🎯 Predictable' : '😅 Explorer'}
              </span>
            </div>
            <div className="insight-card">
              <h4>Mainstream Score</h4>
              <p>{roastingInsights.mainstreamScore}%</p>
              <span className={`roast-level ${roastingInsights.mainstreamScore > 70 ? 'high' : 'low'}`}>
                {roastingInsights.mainstreamScore > 70 ? '🎯 Basic Taste' : '😅 Indie Vibes'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Tracks Section */}
      <div className="music-section">
        <h3>🎵 Your Top Tracks</h3>
        <div className="tracks-grid">
          {topTracks.slice(0, 8).map((track, index) => (
            <div key={track.id} className="track-card">
              <div className="track-number">#{index + 1}</div>
              {track.image && (
                <img src={track.image} alt={track.name} className="track-image" />
              )}
              <div className="track-info">
                <h4 className="track-name">{track.name}</h4>
                <p className="track-artist">{track.artist}</p>
                <div className="track-stats">
                  <span className="popularity">🔥 {track.popularity}%</span>
                  {track.explicit && <span className="explicit">🚫 Explicit</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Artists Section */}
      <div className="music-section">
        <h3>🎤 Your Top Artists</h3>
        <div className="artists-grid">
          {topArtists.slice(0, 6).map((artist, index) => (
            <div key={artist.id} className="artist-card">
              <div className="artist-number">#{index + 1}</div>
              {artist.image && (
                <img src={artist.image} alt={artist.name} className="artist-image" />
              )}
              <div className="artist-info">
                <h4 className="artist-name">{artist.name}</h4>
                <div className="artist-genres">
                  {artist.genres.slice(0, 2).map(genre => (
                    <span key={genre} className="genre-tag">{genre}</span>
                  ))}
                </div>
                <div className="artist-stats">
                  <span className="popularity">🔥 {artist.popularity}%</span>
                  <span className="followers">👥 {formatFollowers(artist.followers)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ready for Roasting */}
      <div className="roasting-ready">
        <h3>🎬 Ready for the Roasting Session!</h3>
        <p>Our Malayalam actors have analyzed your music taste and are ready to deliver some epic roasts!</p>
        <button className="start-roasting-btn">
          🔥 Start the Roasting Session
        </button>
      </div>
    </div>
  );
};

// Helper function to format follower count
const formatFollowers = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export default MusicAnalysis;
