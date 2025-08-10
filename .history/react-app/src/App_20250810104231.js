import { useState } from 'react';
import './App.css';
import AudioRoastPage from './components/AudioRoastPage';

function App() {
  const [currentPage, setCurrentPage] = useState('audio-roasting');

  return (
    <div className="App">
      <div className="home-container">
        <header className="app-header">
          <h1>Mollywoodify</h1>
        </header>

        {currentPage === 'audio-roasting' && (
          <AudioRoastPage 
            onBack={() => setCurrentPage('audio-roasting')}
          />
        )}
      </div>
    </div>
  );
}export default App;
