import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { getUserMusicAnalysis } from './services/spotifyService';
import ActorSelection from './components/ActorSelection';
import RoastingPage from './components/RoastingPage';
import AudioRoastPage from './components/AudioRoastPage';

// Import actor images for home page
// import mohanlalImg from './images/mohanlal.webp';
// import fafaImg from './images/fafa.jpg';
// import prithiviImg from './images/prithivi.jpg';
// import sureshImg from './images/suresh.jpeg';
// import surajImg from './images/suraj.jpg';

function App() {
  // eslint-disable-next-line no-unused-vars
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [userProfile, setUserProfile] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [accessToken, setAccessToken] = useState(null);
  const [musicData, setMusicData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedActor, setSelectedActor] = useState(null);
  const [currentPage, setCurrentPage] = useState('actor-selection'); // Start directly at actor selection

  // Spotify OAuth configuration
  const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
  const RESPONSE_TYPE = 'token';
  const SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played',
    'user-library-read'
  ].join('%20');

  // Handle logout
  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setAccessToken(null);
    setMusicData(null);
    setSelectedActor(null);
    setCurrentPage('login');
    window.localStorage.removeItem('spotify_token');
    window.localStorage.removeItem('spotify_music_data');
  }, []);

  // Fetch user music data from Spotify API
  const fetchMusicData = useCallback(async (token) => {
    setDataLoading(true);
    try {
      console.log('🎵 Fetching user music data...');
      const result = await getUserMusicAnalysis(token);
      
      if (result.success) {
        setMusicData(result.data);
        // Store data in localStorage for persistence
        window.localStorage.setItem('spotify_music_data', JSON.stringify(result.data));
        console.log('✅ Music data fetched and stored successfully:', result.data);
      } else {
        console.error('❌ Failed to fetch music data:', result.error);
      }
    } catch (error) {
      console.error('❌ Error fetching music data:', error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Fetch user profile from Spotify API
  const fetchUserProfile = useCallback(async (token) => {
    if (!token) {
      console.error('No token provided for profile fetch');
      return;
    }

    try {
      console.log('🔍 Fetching user profile...');
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User profile fetched successfully:', userData.display_name);
        setUserProfile(userData);
        setIsLoggedIn(true);
        setCurrentPage('actor-selection');
        
        // Fetch music data after successful login
        fetchMusicData(token);
        
        // Load cached music data if available
        const cachedData = window.localStorage.getItem('spotify_music_data');
        if (cachedData) {
          setMusicData(JSON.parse(cachedData));
        }
      } else {
        console.error('❌ Failed to fetch user profile:', response.status, response.statusText);
        if (response.status === 401) {
          // Token expired or invalid
          logout();
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      logout();
    }
  }, [fetchMusicData, logout]);

  // Auto-login with environment token on component mount
  useEffect(() => {
    const envToken = process.env.REACT_APP_SPOTIFY_TEST_TOKEN;
    
    if (envToken) {
      console.log('🔑 Using environment token for auto-login');
      window.localStorage.setItem('spotify_token', envToken);
      setAccessToken(envToken);
      fetchUserProfile(envToken);
    } else {
      console.error('❌ No Spotify token found in environment variables');
      alert('Spotify token not configured. Please check your .env file.');
    }
  }, [fetchUserProfile]);

  // Handle actor selection
  const handleActorSelect = (actor) => {
    setSelectedActor(actor);
    setCurrentPage('roasting');
    console.log('Selected actor:', actor);
  };

  // Handle Spotify login
  const handleSpotifyLogin = () => {
    console.log('🔑 Starting Spotify login...');
    console.log('CLIENT_ID:', CLIENT_ID);
    console.log('REDIRECT_URI:', REDIRECT_URI);
    
    if (!CLIENT_ID) {
      alert('Spotify Client ID is not configured. Please check your .env file.');
      return;
    }
    
    if (!REDIRECT_URI) {
      alert('Spotify Redirect URI is not configured. Please check your .env file.');
      return;
    }

    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`;
    console.log('🔗 Auth URL:', authUrl);
    
    // Direct redirect since we're using https://localhost:3000
    window.location.href = authUrl;
  };  return (
    <div className="App">
      <div className="home-container">
        {currentPage === 'login' && (
          <>
            {/* Welcome Message */}
            <div className="welcome-section">
              <h1 className="welcome-text">Get Ready to be Roasted by</h1>
            </div>

            {/* Title with Actor Images */}
            <div className="title-section">
              <div className="actors-row top-row">
                <div className="actor-placeholder" data-actor="mohanlal">
                  {/* <img src={mohanlalImg} alt="Mohanlal" /> */}
                  <span>👑 Mohanlal</span>
                </div>
                <div className="actor-placeholder" data-actor="suraj">
                  {/* <img src={surajImg} alt="Suraj Venjaramoodu" /> */}
                  <span>🎭 Suraj</span>
                </div>
              </div>
              
              <h1 className="main-title">MOLLYWOODIFY</h1>
              
              <div className="actors-row bottom-row">
                <div className="actor-placeholder" data-actor="prithviraj">
                  {/* <img src={prithiviImg} alt="Prithviraj" /> */}
                  <span>🎬 Prithviraj</span>
                </div>
                <div className="actor-placeholder" data-actor="fahadh">
                  {/* <img src={fafaImg} alt="Fahadh Faasil" /> */}
                  <span>⭐ Fahadh</span>
                </div>
                <div className="actor-placeholder" data-actor="suresh">
                  {/* <img src={sureshImg} alt="Suresh Gopi" /> */}
                  <span>🎪 Suresh</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="description-section">
              <p className="main-description">
                🎭 Your favorite Malayalam actors are about to roast your music taste! 🎵
              </p>
              <p className="sub-description">
                We'll analyze your top tracks and artists, then let our legendary actors give you their honest (and hilarious) opinions about your musical choices.
              </p>
              <div className="features-list">
                <div className="feature-item">🎤 Get roasted by Mollywood legends</div>
                <div className="feature-item">📊 See your top tracks & artists</div>
                <div className="feature-item">😂 Laugh at their witty comebacks</div>
              </div>
            </div>

            {/* Spotify Login Section */}
            <div className="login-section">
              <p className="login-prompt">Connect your Spotify to start the roasting session</p>
              <button className="spotify-login-btn" onClick={handleSpotifyLogin}>
                <span className="spotify-icon">🎵</span>
                Login with Spotify & Get Roasted
              </button>
              <p className="privacy-note">
                We only read your music data - no posting or modifications to your account
              </p>
              
              {/* Developer test button - remove in production */}
              <div style={{marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px', fontSize: '12px'}}>
                <p style={{margin: '0 0 10px 0', color: '#666'}}>Developer Testing:</p>
                <button 
                  onClick={() => {
                    const token = process.env.REACT_APP_SPOTIFY_TEST_TOKEN;
                    if (!token) {
                      alert('Test token not found in environment variables');
                      return;
                    }
                    console.log('🧪 Using test token from environment');
                    window.localStorage.setItem('spotify_token', token);
                    setAccessToken(token);
                    fetchUserProfile(token);
                  }} 
                  style={{
                    padding: '5px 10px', 
                    fontSize: '11px', 
                    background: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Use Test Token
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {currentPage === 'actor-selection' && (
        <ActorSelection onActorSelect={handleActorSelect} />
      )}

      {currentPage === 'roasting' && (
        <RoastingPage 
          selectedActor={selectedActor}
          spotifyData={musicData}
          onBack={() => setCurrentPage('actor-selection')}
          onAudioRoast={() => setCurrentPage('audio-roasting')}
        />
      )}

      {currentPage === 'audio-roasting' && (
        <AudioRoastPage 
          spotifyData={musicData}
          onBack={() => setCurrentPage('roasting')}
        />
      )}
    </div>
  );
}

export default App;
