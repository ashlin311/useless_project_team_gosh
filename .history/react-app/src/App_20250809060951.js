import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { getUserMusicAnalysis } from './services/spotifyService';
import SpotifyDataManager from './scripts/spotifyDataManager';
import ActorSelection from './components/ActorSelection';
import RoastingPage from './components/RoastingPage';
import AudioRoastPage from './components/AudioRoastPage';

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

  // Handle logout - now just resets the app state
  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setAccessToken(null);
    setMusicData(null);
    setSelectedActor(null);
    setCurrentPage('actor-selection');
    window.localStorage.removeItem('spotify_token');
    window.localStorage.removeItem('spotify_music_data');
  }, []);

  // Fetch user music data from Spotify API with enhanced localStorage integration
  const fetchMusicData = useCallback(async (token) => {
    setDataLoading(true);
    try {
      console.log('🎵 Fetching user music data with enhanced system...');
      
      // First try our new data manager for smart caching
      const result = await SpotifyDataManager.initializeSpotifyData(token, {
        autoRefresh: true,
        refreshInterval: 30 * 60 * 1000, // 30 minutes
        maxDataAge: 2 * 60 * 60 * 1000   // 2 hours
      });
      
      if (result.success) {
        // Get the full data for the app
        const fullData = SpotifyDataManager.getUserMusicData('full');
        setMusicData(fullData);
        console.log('✅ Enhanced music data fetched and stored successfully:', {
          tracks: fullData?.topTracks?.mediumTerm?.length || 0,
          artists: fullData?.topArtists?.mediumTerm?.length || 0,
          genres: fullData?.insights?.topGenres?.length || 0
        });
      } else {
        // Fallback to original method if new system fails
        console.log('⚠️ New system failed, falling back to original method...');
        const fallbackResult = await getUserMusicAnalysis(token);
        
        if (fallbackResult.success) {
          setMusicData(fallbackResult.data);
          // Store data in localStorage for persistence
          window.localStorage.setItem('spotify_music_data', JSON.stringify(fallbackResult.data));
          console.log('✅ Fallback music data fetched and stored successfully:', fallbackResult.data);
        } else {
          console.error('❌ Both systems failed to fetch music data:', fallbackResult.error);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching music data:', error);
      
      // Try to use any cached data as last resort
      const cachedData = SpotifyDataManager.getUserMusicData('full');
      if (cachedData) {
        console.log('📦 Using cached data as fallback');
        setMusicData(cachedData);
      }
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

  // Auto-login with environment token on component mount with enhanced data loading
  useEffect(() => {
    // First, check for cached data immediately
    const status = SpotifyDataManager.getDataStatus();
    if (status.hasData) {
      console.log('📦 Found cached music data:', status);
      const cachedData = SpotifyDataManager.getUserMusicData('full');
      if (cachedData) {
        setMusicData(cachedData);
        console.log('✅ Loaded cached music data with', {
          tracks: cachedData?.topTracks?.mediumTerm?.length || 0,
          artists: cachedData?.topArtists?.mediumTerm?.length || 0,
          genres: cachedData?.insights?.topGenres?.length || 0
        });
      }
    }

    const envToken = process.env.REACT_APP_SPOTIFY_TEST_TOKEN;
    
    if (envToken) {
      console.log('🔑 Using environment token for auto-login');
      window.localStorage.setItem('spotify_token', envToken);
      setAccessToken(envToken);
      fetchUserProfile(envToken);
    } else {
      console.error('❌ No Spotify token found in environment variables');
      alert('Spotify token not configured. Please check your .env file.');
      
      // Still try to use cached data even without token
      if (!status.hasData) {
        const legacyCachedData = window.localStorage.getItem('spotify_music_data');
        if (legacyCachedData) {
          try {
            setMusicData(JSON.parse(legacyCachedData));
            console.log('📦 Loaded legacy cached data as fallback');
          } catch (error) {
            console.error('Error parsing legacy cached data:', error);
          }
        }
      }
    }
  }, [fetchUserProfile]);

  // Handle actor selection
  const handleActorSelect = (actor) => {
    setSelectedActor(actor);
    setCurrentPage('roasting');
    console.log('Selected actor:', actor);
  };  return (
    <div className="App">
      <div className="home-container">
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
    </div>
  );
}

export default App;
