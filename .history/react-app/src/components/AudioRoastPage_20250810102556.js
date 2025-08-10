import React, { useState, useRef } from 'react';
import './AudioRoastPage.css';

// Import actor images
import mohanlalImg from '../images/mohanlal.webp';
import fahadhImg from '../images/fafa.jpg';
import sureshImg from '../images/suresh.jpeg';
import prithivrajImg from '../images/prithivi.jpg';
import surajImg from '../images/suraj.jpg';

// Import the new audio roasting service
import { generateAudioRoast } from '../services/geminiService';

const AudioRoastPage = ({ onBack }) => {
  const [selectedActor, setSelectedActor] = useState(null);
  const [severity, setSeverity] = useState('funny');
  const [audioFile, setAudioFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [roastResult, setRoastResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const actors = [
    { id: 'mohanlal', name: 'Mohanlal', image: mohanlalImg, description: 'Mass dialogue style' },
    { id: 'fahadh', name: 'Fahadh Faasil', image: fahadhImg, description: 'Rangan Chettan savage mode' },
    { id: 'suresh', name: 'Suresh Gopi', image: sureshImg, description: 'Commissioner authority' },
    { id: 'prithivraj', name: 'Prithviraj', image: prithivrajImg, description: 'Cinematic intensity' },
    { id: 'suraj', name: 'Suraj Venjaramoodu', image: surajImg, description: 'Deadpan comedy' }
  ];

  const severityOptions = [
    { value: 'gentle', label: 'Gentle Roast 😊', description: 'Constructive but funny' },
    { value: 'funny', label: 'Funny Roast 😂', description: 'Balanced humor and critique' },
    { value: 'harsh', label: 'Harsh Roast 🔥', description: 'No mercy, brutal honesty' }
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        // Use the actual MIME type from MediaRecorder
        const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        console.log('🎤 Recording stopped, MIME type:', mimeType, 'Size:', audioBlob.size);
        setAudioFile(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('📁 File upload details:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
      
      if (file.type.startsWith('audio/')) {
        // Check file size (limit to ~10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert('File too large! Please upload an audio file smaller than 10MB.');
          return;
        }
        
        setAudioFile(file);
        setRoastResult(null);
      } else {
        alert('Please upload a valid audio file (MP3, WAV, M4A, etc.)');
      }
    }
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove the data:audio/wav;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleGetRoasted = async () => {
    if (!selectedActor || !audioFile) {
      alert('Please select an actor and provide an audio file');
      return;
    }

    setLoading(true);
    setRoastResult(null);

    try {
      // Debug logging for audio file
      console.log('🎵 Audio file details:', {
        type: audioFile.type,
        size: audioFile.size,
        name: audioFile.name || 'recorded-audio'
      });

      // Convert audio file to base64 for Gemini API
      const audioBase64 = await convertBlobToBase64(audioFile);
      
      // Log first 100 chars of base64 for debugging
      console.log('🎵 Base64 preview:', audioBase64.slice(0, 100));
      
      const result = await generateAudioRoast(selectedActor, audioBase64, severity);
      
      if (result.success) {
        setRoastResult({
          roastText: result.roast,
          actor: result.actor,
          severity: result.severity,
          observations: ['Audio successfully analyzed'],
          tips: ['Great job recording!'],
          score: 8
        });
      } else {
        setRoastResult({
          roastText: result.fallbackRoast || 'Sorry, could not analyze your singing right now!',
          observations: ['Audio analysis failed'],
          tips: ['Try again with a clearer recording'],
          score: null,
          severity: severity
        });
      }
    } catch (error) {
      console.error('Error getting audio roast:', error);
      setRoastResult({
        roastText: 'Ayyo, technical issue with the roasting! Try again, ketto! 😅',
        observations: ['Error occurred during analysis'],
        tips: ['Check your internet connection and try again'],
        score: null,
        severity: severity
      });
    } finally {
      setLoading(false);
    }
  };

  const getActorImage = (actorId) => {
    const actor = actors.find(a => a.id === actorId);
    return actor ? actor.image : mohanlalImg;
  };

  const clearAudio = () => {
    setAudioFile(null);
    setRoastResult(null);
  };

  return (
    <div className="audio-roast-page">
      <div className="header">
        <h1>🎤 Let </h1>
        <p>Let Malayalam movie stars roast your singing skills with AI!</p>
      </div>

      {!roastResult ? (
        <div className="setup-section">
          {/* Actor Selection */}
          <div className="actor-selection">
            <h2>Choose Your Roaster</h2>
            <div className="actors-grid">
              {actors.map(actor => (
                <div 
                  key={actor.id} 
                  className={`actor-card ${selectedActor === actor.id ? 'selected' : ''}`}
                  onClick={() => setSelectedActor(actor.id)}
                >
                  <img src={actor.image} alt={actor.name} />
                  <h3>{actor.name}</h3>
                  <p>{actor.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Selection */}
          <div className="severity-selection">
            <h2>Choose Roast Intensity</h2>
            <div className="severity-options">
              {severityOptions.map(option => (
                <div 
                  key={option.value}
                  className={`severity-card ${severity === option.value ? 'selected' : ''}`}
                  onClick={() => setSeverity(option.value)}
                >
                  <div className="severity-label">{option.label}</div>
                  <div className="severity-description">{option.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Audio Input */}
          <div className="audio-input">
            <h2>Provide Your Singing</h2>
            <div className="audio-options">
              <div className="record-option">
                <h3>🎙️ Record Live</h3>
                {!recording ? (
                  <button onClick={startRecording} className="record-button">
                    Start Recording
                  </button>
                ) : (
                  <button onClick={stopRecording} className="stop-button">
                    Stop Recording ({recording ? '🔴' : ''})
                  </button>
                )}
                {recording && (
                  <div className="recording-indicator">
                    🎤 Recording... Sing something!
                  </div>
                )}
              </div>

              <div className="upload-option">
                <h3>📁 Upload Audio</h3>
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileUpload}
                  className="file-input"
                />
              </div>
            </div>

            {audioFile && (
              <div className="audio-preview">
                <p>✅ Audio ready: {audioFile.name || 'Recorded audio'}</p>
                <button onClick={clearAudio} className="clear-button">
                  Clear Audio
                </button>
              </div>
            )}
          </div>

          {/* Get Roasted Button */}
          <div className="roast-action">
            <button 
              onClick={handleGetRoasted}
              disabled={!selectedActor || !audioFile || loading}
              className="roast-button"
            >
              {loading ? '🔥 Analyzing Your Singing...' : '🔥 Get Roasted!'}
            </button>
          </div>
        </div>
      ) : (
        <div className="roast-result">
          <div className="roast-header">
            <img 
              src={getActorImage(selectedActor)} 
              alt={actors.find(a => a.id === selectedActor)?.name} 
              className="roaster-image"
            />
            <div className="roast-info">
              <h2>{actors.find(a => a.id === selectedActor)?.name} says:</h2>
              <div className="severity-badge">{severity} roast</div>
              {roastResult.score !== null && (
                <div className="score-badge">
                  Score: {roastResult.score}/100
                </div>
              )}
            </div>
          </div>

          <div className="roast-content">
            <div className="roast-text">
              {roastResult.roastText}
            </div>

            {roastResult.observations && roastResult.observations.length > 0 && (
              <div className="observations">
                <h3>🎵 Technical Observations:</h3>
                <ul>
                  {roastResult.observations.map((obs, index) => (
                    <li key={index}>{obs}</li>
                  ))}
                </ul>
              </div>
            )}

            {roastResult.tips && roastResult.tips.length > 0 && (
              <div className="tips">
                <h3>💡 Improvement Tips:</h3>
                <ul>
                  {roastResult.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="result-actions">
            <button onClick={() => setRoastResult(null)} className="try-again-button">
              🎤 Try Another Recording
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRoastPage;
