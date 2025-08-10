import { useState } from 'react';
import './App.css';
import AudioRoastPage from './components/AudioRoastPage';

function App() {
  const [currentPage, setCurrentPage] = useState('audio-roasting');

  return (
    <div className="App">
      <div className="home-container">
        <header className="app-header">
          <h1>🎤 AI Singing Roast</h1>
          <p>Record your singing and let Malayalam movie stars roast your performance!</p>
        </header>

        {currentPage === 'audio-roasting' && (
          <AudioRoastPage 
            onBack={() => setCurrentPage('audio-roasting')}
          />
        )}
      </div>
    </div>
  );
}  return (
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
