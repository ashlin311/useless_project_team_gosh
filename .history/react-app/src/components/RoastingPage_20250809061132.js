import React, { useState, useEffect } from 'react';
import { generateRoast, testGeminiConnection } from '../services/geminiService';
import './RoastingPage.css';

// Import actor images
import mohanlalImg from '../images/mohanlal.webp';
import fafaImg from '../images/fafa.jpg';
import sureshImg from '../images/suresh.jpeg';
import prithiviImg from '../images/prithivi.jpg';
import surajImg from '../images/suraj.jpg';

const RoastingPage = ({ selectedActor, spotifyData, onBack, onAudioRoast }) => {
  const [roast, setRoast] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateActorRoast = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🎭 Generating roast for:', selectedActor.id);
        console.log('📊 Spotify data structure:', spotifyData);
        console.log('🎵 Top artists available:', spotifyData?.topArtists);
        console.log('🎤 Top tracks available:', spotifyData?.topTracks);
        console.log('� Data insights available:', spotifyData?.insights);
        console.log('�🔑 Gemini API Key exists:', !!process.env.REACT_APP_GEMINI_API_KEY);
        
        // Wait for data to load - if no spotifyData, don't try to generate roast yet
        if (!spotifyData) {
          console.log('⏳ Waiting for Spotify data to load...');
          setLoading(true);
          return;
        }
        
        // Enhanced validation with detailed logging
        if (!spotifyData?.topArtists?.mediumTerm || !spotifyData?.topTracks?.mediumTerm) {
          console.log('❌ Detailed Spotify data analysis:', {
            hasSpotifyData: !!spotifyData,
            hasTopArtists: !!spotifyData?.topArtists,
            hasMediumTermArtists: !!spotifyData?.topArtists?.mediumTerm,
            artistsCount: spotifyData?.topArtists?.mediumTerm?.length || 0,
            hasTopTracks: !!spotifyData?.topTracks,
            hasMediumTermTracks: !!spotifyData?.topTracks?.mediumTerm,
            tracksCount: spotifyData?.topTracks?.mediumTerm?.length || 0,
            hasInsights: !!spotifyData?.insights,
            topGenres: spotifyData?.insights?.topGenres?.slice(0, 3) || [],
            dataKeys: Object.keys(spotifyData || {})
          });
          throw new Error('Insufficient Spotify data - missing top artists or tracks for medium term');
        }
        
        console.log('✅ Data validation passed! Proceeding with roast generation...', {
          artistsCount: spotifyData.topArtists.mediumTerm.length,
          tracksCount: spotifyData.topTracks.mediumTerm.length,
          topArtists: spotifyData.topArtists.mediumTerm.slice(0, 3).map(a => a.name),
          topTracks: spotifyData.topTracks.mediumTerm.slice(0, 3).map(t => t.name),
          topGenres: spotifyData.insights?.topGenres?.slice(0, 3) || []
        });
        
        const result = await generateRoast(selectedActor.id, spotifyData);
        
        if (result.success) {
          setRoast(result.roast);
          console.log('✅ Roast generated successfully:', result.roast);
        } else {
          setError(result.error);
          setRoast(result.fallbackRoast || "Ayyo, something went wrong! Try again ketto!");
          console.error('❌ Roast generation failed:', result.error);
        }
      } catch (err) {
        console.error('❌ Error generating roast:', err);
        setError(err.message);
        setRoast("Ente AI'yk oru technical issue undu. Pinne try cheyyam! 😅");
      } finally {
        setLoading(false);
      }
    };

    if (selectedActor && spotifyData) {
      generateActorRoast();
    }
  }, [selectedActor, spotifyData]);

  const handleShareRoast = () => {
    const shareText = `${selectedActor.name} just roasted my music taste! 🔥\n\n"${roast}"\n\n#Mollywoodify #MalayalamCinema`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Music Roast',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Roast copied to clipboard!');
    }
  };

  const handleTestGemini = async () => {
    console.log('🧪 Testing Gemini connection...');
    const testResult = await testGeminiConnection();
    console.log('🧪 Test result:', testResult);
    alert(`Gemini Test: ${testResult.success ? 'SUCCESS' : 'FAILED'}\n${testResult.success ? testResult.testResponse : testResult.error}`);
  };

  const getActorImage = () => {
    switch(selectedActor.id) {
      case 'mohanlal':
        return mohanlalImg;
      case 'fahadh':
        return fafaImg;
      case 'suresh':
        return sureshImg;
      case 'prithviraj':
        return prithiviImg;
      case 'suraj':
        return surajImg;
      default:
        return mohanlalImg; // Fallback to Mohanlal
    }
  };

  return (
    <div className="roasting-page">
      <div className="roast-container">
        <div className="actor-section">
          <div className="actor-avatar">
            <img src={getActorImage()} alt={selectedActor.name} />
          </div>
          <h2 className="actor-name">{selectedActor.name}</h2>
          <p className="roast-intro">is about to roast your music taste! 🔥</p>
        </div>

        <div className="roast-content">
          {loading ? (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>Preparing the roast...</p>
              <span className="loading-subtitle">Mohanlal is analyzing your music taste 🎭</span>
            </div>
          ) : (
            <div className="roast-text-container">
              <div className="speech-bubble">
                <p className="roast-text">{roast}</p>
                {error && (
                  <div className="error-notice">
                    <small>⚠️ AI had a hiccup, but the roast continues!</small>
                  </div>
                )}
                
                {/* Debug section for development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="debug-section" style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}>
                    <h4 style={{ color: '#495057', marginBottom: '10px' }}>🐛 Debug Info</h4>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Data Status:</strong> {spotifyData ? '✅ Available' : '❌ Missing'}
                    </div>
                    {spotifyData && (
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Data Structure:</strong>
                        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                          <li>Artists: {spotifyData?.topArtists?.mediumTerm?.length || 0}</li>
                          <li>Tracks: {spotifyData?.topTracks?.mediumTerm?.length || 0}</li>
                          <li>Genres: {spotifyData?.insights?.topGenres?.length || 0}</li>
                        </ul>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={handleTestGemini}
                        style={{
                          padding: '5px 10px',
                          fontSize: '11px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        🧪 Test Gemini
                      </button>
                      <button 
                        onClick={() => console.log('📊 Current Spotify Data:', spotifyData)}
                        style={{
                          padding: '5px 10px',
                          fontSize: '11px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        📊 Log Data
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="roast-actions">
          <button className="action-btn secondary" onClick={onBack}>
            🔄 Choose Another Actor
          </button>
          <button className="action-btn audio" onClick={onAudioRoast}>
            🎤 Try Singing Roast
          </button>
          {!loading && (
            <button className="action-btn primary" onClick={handleShareRoast}>
              📱 Share Roast
            </button>
          )}
          {process.env.NODE_ENV === 'development' && (
            <button className="action-btn secondary" onClick={handleTestGemini} style={{fontSize: '0.8rem'}}>
              🧪 Test Gemini API
            </button>
          )}
        </div>

        {spotifyData && (
          <div className="music-summary">
            <h4>Your Top Music:</h4>
            <div className="music-grid">
              <div className="music-column">
                <h5>Top Artists:</h5>
                <ul>
                  {spotifyData.topArtists?.mediumTerm?.slice(0, 3).map((artist, index) => (
                    <li key={index}>{artist.name}</li>
                  ))}
                </ul>
              </div>
              <div className="music-column">
                <h5>Top Tracks:</h5>
                <ul>
                  {spotifyData.topTracks?.mediumTerm?.slice(0, 3).map((track, index) => (
                    <li key={index}>{track.name}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
                <summary>🔍 Debug: Data Structure</summary>
                <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '5px', overflow: 'auto' }}>
                  {JSON.stringify({
                    topArtistsLength: spotifyData.topArtists?.mediumTerm?.length || 0,
                    topTracksLength: spotifyData.topTracks?.mediumTerm?.length || 0,
                    insightsAvailable: !!spotifyData.insights,
                    topGenres: spotifyData.insights?.topGenres?.slice(0, 3) || [],
                    artistDiversity: spotifyData.insights?.artistDiversity || 0
                  }, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoastingPage;
