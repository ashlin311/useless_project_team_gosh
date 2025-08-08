import { useEffect } from 'react';

const SpotifyCallback = () => {
  useEffect(() => {
    // This component handles the callback from Spotify OAuth
    // The main App component will handle the token extraction
    // and redirect the user appropriately
    
    const hash = window.location.hash;
    if (hash) {
      // Extract token and redirect to main app
      const token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token'));
      if (token) {
        // Token will be handled by App component's useEffect
        window.location.href = '/';
      }
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #1DB954 0%, #191414 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>🎵 Connecting to Spotify...</h2>
        <p>Please wait while we complete your login</p>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #ffffff20',
          borderTop: '3px solid #1DB954',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }}></div>
      </div>
    </div>
  );
};

export default SpotifyCallback;
