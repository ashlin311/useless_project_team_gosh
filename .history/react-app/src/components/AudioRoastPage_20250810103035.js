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
      console.log('🎤 Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      console.log('✅ Microphone access granted');
      
      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        console.warn('⚠️ audio/webm not supported, trying alternatives...');
      }

      // Try different MIME types for better compatibility
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      }

      console.log('🎵 Using MediaRecorder with options:', options);
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('📊 Audio chunk received, size:', event.data.size);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log('⏹️ Recording stopped, processing audio...');
        
        // Use the actual MIME type from MediaRecorder
        const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        console.log('🎤 Recording details:', {
          mimeType: mimeType,
          size: audioBlob.size,
          chunks: audioChunksRef.current.length
        });

        if (audioBlob.size === 0) {
          alert('Recording failed - no audio data captured. Please try again.');
          return;
        }
        
        setAudioFile(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        console.log('✅ Audio recording saved successfully');
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event.error);
        alert('Recording error: ' + event.error);
        setRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(1000); // Collect data every 1 second
      setRecording(true);
      console.log('🔴 Recording started');
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      let errorMessage = 'Could not start recording. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow microphone access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please check your audio devices.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Audio recording not supported in this browser.';
      } else {
        errorMessage += 'Error: ' + error.message;
      }
      
      alert(errorMessage);
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
        try {
          if (!reader.result) {
            throw new Error('FileReader result is null');
          }
          
          // Check if the result contains base64 data
          if (typeof reader.result !== 'string') {
            throw new Error('FileReader result is not a string');
          }
          
          // Split on comma and get the base64 part
          const parts = reader.result.split(',');
          if (parts.length < 2) {
            throw new Error('Invalid data URL format');
          }
          
          const base64 = parts[1];
          if (!base64 || base64.length === 0) {
            throw new Error('Empty base64 data');
          }
          
          console.log('✅ Successfully converted audio to base64, length:', base64.length);
          resolve(base64);
        } catch (error) {
          console.error('❌ Error in convertBlobToBase64:', error);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error('❌ FileReader error:', error);
        reject(new Error('Failed to read audio file'));
      };
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
      // Validate audio file
      if (!audioFile) {
        throw new Error('No audio file provided');
      }

      if (audioFile.size === 0) {
        throw new Error('Audio file is empty');
      }

      if (audioFile.size > 25 * 1024 * 1024) { // 25MB limit for Gemini
        throw new Error('Audio file too large (max 25MB)');
      }

      // Debug logging for audio file
      console.log('🎵 Audio file details:', {
        type: audioFile.type,
        size: audioFile.size,
        name: audioFile.name || 'recorded-audio',
        lastModified: audioFile.lastModified
      });

      // Convert audio file to base64 for Gemini API
      console.log('🔄 Converting audio to base64...');
      const audioBase64 = await convertBlobToBase64(audioFile);
      
      if (!audioBase64 || audioBase64.length === 0) {
        throw new Error('Failed to convert audio to base64');
      }
      
      // Log first 100 chars of base64 for debugging
      console.log('🎵 Base64 conversion successful, preview:', audioBase64.slice(0, 100));
      console.log('🎵 Base64 total length:', audioBase64.length);
      
      console.log('🚀 Sending to Gemini for analysis...');
      const result = await generateAudioRoast(selectedActor, audioBase64, severity);
      
      if (result.success) {
        console.log('✅ Roast generated successfully');
        setRoastResult({
          roastText: result.roast,
          actor: result.actor,
          severity: result.severity,
          observations: ['Audio successfully analyzed'],
          tips: ['Great job recording!'],
          score: 8
        });
      } else {
        console.log('⚠️ Roast generation failed, using fallback');
        setRoastResult({
          roastText: result.fallbackRoast || 'Sorry, could not analyze your singing right now!',
          observations: ['Audio analysis failed: ' + (result.error || 'Unknown error')],
          tips: ['Try again with a clearer recording', 'Ensure good audio quality'],
          score: null,
          severity: severity
        });
      }
    } catch (error) {
      console.error('❌ Error in handleGetRoasted:', error);
      console.error('Error details:', error.message);
      setRoastResult({
        roastText: `Ayyo, technical issue with the roasting! Error: ${error.message} Try again, ketto! 😅`,
        observations: [`Error occurred: ${error.message}`],
        tips: ['Check your internet connection', 'Try a different audio file', 'Ensure the file is a valid audio format'],
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
        <h1>🎤 Singing Roast</h1>
        <p>Let Malayalam movie stars roast your singing skills</p>
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
