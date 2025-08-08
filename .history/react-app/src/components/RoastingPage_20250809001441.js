import React, { useState, useEffect } from 'react';
import { generateRoast } from '../services/geminiService';
import './RoastingPage.css';

// Import Mohanlal's image
import mohanlalImg from '../images/mohanlal.webp';

const RoastingPage = ({ selectedActor, spotifyData, onBack }) => {
  const [roast, setRoast] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateActorRoast = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Generating roast for:', selectedActor.id);
        console.log('Spotify data:', spotifyData);
        
        const result = await generateRoast(selectedActor.id, spotifyData);
        
        if (result.success) {
          setRoast(result.roast);
        } else {
          setError(result.error);
          setRoast(result.fallbackRoast || "Ayyo, something went wrong! Try again ketto!");
        }
      } catch (err) {
        console.error('Error generating roast:', err);
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

  const getActorImage = () => {
    switch(selectedActor.id) {
      case 'mohanlal':
        return mohanlalImg;
      default:
        return mohanlalImg; // Fallback for now
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
              </div>
            </div>
          )}
        </div>

        <div className="roast-actions">
          <button className="action-btn secondary" onClick={onBack}>
            🔄 Choose Another Actor
          </button>
          {!loading && (
            <button className="action-btn primary" onClick={handleShareRoast}>
              📱 Share Roast
            </button>
          )}
        </div>

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
        </div>
      </div>
    </div>
  );
};

export default RoastingPage;
