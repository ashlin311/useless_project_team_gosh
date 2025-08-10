/**
 * Demo Component: Spotify Data Fetcher
 * 
 * This component demonstrates how to use the Spotify data fetching scripts
 * and provides a UI for testing the functionality.
 */

import React, { useState, useEffect } from 'react';
import SpotifyDataManager from '../scripts/spotifyDataManager';
import { devHelpers } from '../scripts/fetchSpotifyData';

const SpotifyDataDemo = () => {
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [musicData, setMusicData] = useState(null);
  const [autoRefreshCancel, setAutoRefreshCancel] = useState(null);

  // Load status on component mount
  useEffect(() => {
    const currentStatus = SpotifyDataManager.getDataStatus();
    setStatus(currentStatus);
    
    if (currentStatus.hasData) {
      const data = SpotifyDataManager.getUserMusicData('summary');
      setMusicData(data);
    }
  }, []);

  // Extract token from URL if available (for development)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const tokenMatch = hash.match(/access_token=([^&]*)/);
      if (tokenMatch) {
        setAccessToken(tokenMatch[1]);
      }
    }
  }, []);

  const handleFetchData = async () => {
    if (!accessToken) {
      alert('Please provide a valid Spotify access token');
      return;
    }

    setLoading(true);
    try {
      const result = await SpotifyDataManager.initializeSpotifyData(accessToken, {
        autoRefresh: true,
        refreshInterval: 5 * 60 * 1000, // 5 minutes for demo
        maxDataAge: 1 * 60 * 60 * 1000   // 1 hour
      });

      if (result.success) {
        setStatus(SpotifyDataManager.getDataStatus());
        setMusicData(SpotifyDataManager.getUserMusicData('summary'));
        setAutoRefreshCancel(() => result.cancelAutoRefresh);
        alert('✅ Data fetched successfully!');
      } else {
        alert('❌ Failed to fetch data: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceRefresh = async () => {
    if (!accessToken) {
      alert('Please provide a valid Spotify access token');
      return;
    }

    setLoading(true);
    try {
      const result = await SpotifyDataManager.forceRefreshData(accessToken);
      
      if (result.success) {
        setStatus(SpotifyDataManager.getDataStatus());
        setMusicData(SpotifyDataManager.getUserMusicData('summary'));
        alert('✅ Data refreshed successfully!');
      } else {
        alert('❌ Failed to refresh data: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    if (autoRefreshCancel) {
      autoRefreshCancel();
      setAutoRefreshCancel(null);
    }
    
    SpotifyDataManager.clearAllData();
    setStatus(SpotifyDataManager.getDataStatus());
    setMusicData(null);
    alert('🗑️ All data cleared!');
  };

  const handleGenerateMockData = () => {
    const mockData = devHelpers.generateMockData();
    setStatus(SpotifyDataManager.getDataStatus());
    setMusicData(SpotifyDataManager.getUserMusicData('summary'));
    alert('🧪 Mock data generated!');
  };

  const handleViewFullData = () => {
    const fullData = SpotifyDataManager.getUserMusicData('full');
    console.log('🎵 Full Spotify Data:', fullData);
    
    const roastingData = SpotifyDataManager.getUserMusicData('roasting');
    console.log('🎭 Roasting Data:', roastingData);
    
    alert('📊 Full data logged to console. Check developer tools!');
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px'
    }}>
      <h1 style={{ color: '#1DB954', textAlign: 'center' }}>
        🎵 Spotify Data Fetcher Demo
      </h1>
      
      {/* Access Token Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Spotify Access Token:
        </label>
        <input
          type="password"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder="Paste your Spotify access token here..."
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '14px'
          }}
        />
        <small style={{ color: '#666', fontSize: '12px' }}>
          Get your token from Spotify Web API Console or OAuth flow
        </small>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px', 
        flexWrap: 'wrap' 
      }}>
        <button
          onClick={handleFetchData}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#1DB954',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {loading ? '⏳ Loading...' : '📡 Fetch Data'}
        </button>

        <button
          onClick={handleForceRefresh}
          disabled={loading || !status?.hasData}
          style={{
            padding: '10px 15px',
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (loading || !status?.hasData) ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Force Refresh
        </button>

        <button
          onClick={handleClearData}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          🗑️ Clear Data
        </button>

        <button
          onClick={handleGenerateMockData}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          🧪 Mock Data
        </button>

        <button
          onClick={handleViewFullData}
          disabled={!status?.hasData}
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !status?.hasData ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          📊 View Full Data
        </button>
      </div>

      {/* Status Display */}
      {status && (
        <div style={{
          padding: '15px',
          backgroundColor: status.hasData ? '#d4edda' : '#f8d7da',
          border: `1px solid ${status.hasData ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: status.hasData ? '#155724' : '#721c24' }}>
            📊 Data Status
          </h3>
          <div style={{ fontSize: '14px', color: status.hasData ? '#155724' : '#721c24' }}>
            <div><strong>Has Data:</strong> {status.hasData ? '✅ Yes' : '❌ No'}</div>
            {status.hasData && (
              <>
                <div><strong>Age:</strong> {status.message}</div>
                <div><strong>Fresh:</strong> {status.isFresh ? '✅ Yes' : '⚠️ Stale'}</div>
                <div><strong>Tracks:</strong> {status.totalTracks}</div>
                <div><strong>Artists:</strong> {status.totalArtists}</div>
                <div><strong>Genres:</strong> {status.topGenres}</div>
                <div><strong>Last Updated:</strong> {new Date(status.lastUpdated).toLocaleString()}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Music Data Preview */}
      {musicData && (
        <div style={{
          padding: '15px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '5px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1DB954' }}>
            🎵 Your Music Summary
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Top Track */}
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🎵 Top Track</h4>
              {musicData.topTrack ? (
                <div style={{ fontSize: '14px' }}>
                  <div><strong>{musicData.topTrack.name}</strong></div>
                  <div style={{ color: '#666' }}>{musicData.topTrack.artist}</div>
                  <div style={{ color: '#999', fontSize: '12px' }}>
                    Popularity: {musicData.topTrack.popularity}/100
                  </div>
                </div>
              ) : (
                <div style={{ color: '#999', fontSize: '14px' }}>No top track found</div>
              )}
            </div>

            {/* Top Artist */}
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🎤 Top Artist</h4>
              {musicData.topArtist ? (
                <div style={{ fontSize: '14px' }}>
                  <div><strong>{musicData.topArtist.name}</strong></div>
                  <div style={{ color: '#666' }}>
                    {musicData.topArtist.genres?.slice(0, 2).join(', ') || 'No genres'}
                  </div>
                  <div style={{ color: '#999', fontSize: '12px' }}>
                    Popularity: {musicData.topArtist.popularity}/100
                  </div>
                </div>
              ) : (
                <div style={{ color: '#999', fontSize: '14px' }}>No top artist found</div>
              )}
            </div>
          </div>

          {/* Top Genres */}
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🎭 Top Genres</h4>
            <div style={{ fontSize: '14px' }}>
              {musicData.topGenres?.length > 0 ? (
                musicData.topGenres.map((genre, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      margin: '2px',
                      backgroundColor: '#1DB954',
                      color: 'white',
                      borderRadius: '15px',
                      fontSize: '12px'
                    }}
                  >
                    {genre}
                  </span>
                ))
              ) : (
                <span style={{ color: '#999' }}>No genres found</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '5px',
            fontSize: '12px',
            color: '#666'
          }}>
            <strong>Stats:</strong> {musicData.totalTracks} tracks, {musicData.totalArtists} artists
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        border: '1px solid #b8daff',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#004085' }}>📋 How to Use</h4>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#004085' }}>
          <li>Get your Spotify access token from the Spotify Web API Console</li>
          <li>Paste it in the input field above</li>
          <li>Click "Fetch Data" to retrieve your music data</li>
          <li>Use "View Full Data" to see the complete dataset in console</li>
          <li>The script will automatically refresh data every 5 minutes (demo setting)</li>
        </ol>
      </div>
    </div>
  );
};

export default SpotifyDataDemo;
