import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { getUserMusicAnalysis } from './services/spotifyService';
import ActorSelection from './components/ActorSelection';

// Import actor images for home page
// import mohanlalImg from './images/mohanlal.webp';
// import fafaImg from './images/fafa.jpg';
// import prithiviImg from './images/prithivi.jpg';
// import sureshImg from './images/suresh.jpeg';
// import surajImg from './images/suraj.jpg';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [musicData, setMusicData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedActor, setSelectedActor] = useState(null);
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'actor-selection', 'roasting'

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

  // Check for access token in URL on component mount (supports /callback path)
  useEffect(() => {
    const isCallback = window.location.pathname === '/callback';
    const hash = window.location.hash;
    let token = window.localStorage.getItem('spotify_token');

    // Handle OAuth callback with new token
    if (!token && hash) {
      const tokenMatch = hash.substring(1).split('&').find(elem => elem.startsWith('access_token'));
      if (tokenMatch) {
        token = tokenMatch.split('=')[1];
        window.localStorage.setItem('spotify_token', token);
        console.log('🔑 New token received from OAuth callback');
      }
    }

    if (token) {
      setAccessToken(token);
      fetchUserProfile(token);
      // If we're on /callback, clean the URL back to root without reloading
      if (isCallback) {
        window.history.replaceState({}, document.title, '/');
      }
    } else {
      console.log('📝 No token found, staying on login page');
      setCurrentPage('login');
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
    window.location.href = authUrl;
  };

  return (
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
                    const token = 'BQBfsOwv4NqKBWdF3DisqkLbyPGFeTBSi4joEb28QfRTpfG_F4fUaVDZ7aLpxdaFyyOaz3XZuVDc2SNHStKnN45IfXu_35kXhINs8T2mlLdQVP_qWbvFdKoS2Wm6GFXzQEVwPnuG5HaLo23k5_jbd9TOkAkdPIyxUrDrffzn9reJL6IsXtmxCJPZRnkX2s5OZJSuIgDfylReooxzi6GBbL2treULeaVymysYbsqW8SCZIrzxe8DsR3XU2RXTXpBmQqO0_KIDU5MU7AVR8Fs7ysJJS0ZnB9aw_lVyGvI-fsq4Orbuq-QEAyPEAYFr';
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
        <div className="roasting-page">
          <div className="dashboard">
            <div className="user-profile">
              <h2>Welcome back, {userProfile?.display_name || 'User'}!</h2>
              {userProfile?.images?.[0]?.url && (
                <img 
                  src={userProfile.images[0].url} 
                  alt="Profile" 
                  className="profile-image"
                />
              )}
              <p className="user-email">{userProfile?.email}</p>
              <div className="user-actions">
                <button className="back-btn" onClick={() => setCurrentPage('actor-selection')}>
                  ← Change Actor
                </button>
                <button className="logout-btn" onClick={logout}>
                  Logout
                </button>
              </div>
            </div>
            
            <div className="app-content">
              <h3>🎬 {selectedActor?.name} is ready to roast! 🎵</h3>
              {dataLoading ? (
                <div className="loading-section">
                  <div className="loading-spinner"></div>
                  <p>🎵 Analyzing your music taste...</p>
                  <p>Getting ready to roast your musical choices!</p>
                </div>
              ) : musicData ? (
                <div className="data-ready">
                  <p>✅ Your music data has been analyzed!</p>
                  <div className="music-stats">
                    <p><strong>Top Tracks:</strong> {musicData.topTracks?.mediumTerm?.length || 0} tracks analyzed</p>
                    <p><strong>Top Artists:</strong> {musicData.topArtists?.mediumTerm?.length || 0} artists analyzed</p>
                    <p><strong>Genres:</strong> {musicData.insights?.topGenres?.length || 0} genres identified</p>
                    <p><strong>Selected Roaster:</strong> {selectedActor?.name}</p>
                  </div>
                  <div className="next-steps">
                    <p>🎭 {selectedActor?.name} has analyzed your music taste and is ready to deliver some epic roasts!</p>
                    <p>Your roasting session will begin shortly...</p>
                  </div>
                </div>
              ) : (
                <div className="data-error">
                  <p>❌ Unable to fetch your music data. Please try refreshing the page.</p>
                </div>
              )}
              
              <div className="spotify-data-preview">
                <p><strong>Connected Account:</strong> {userProfile?.display_name}</p>
                <p><strong>Email:</strong> {userProfile?.email}</p>
                <p><strong>Followers:</strong> {userProfile?.followers?.total || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
