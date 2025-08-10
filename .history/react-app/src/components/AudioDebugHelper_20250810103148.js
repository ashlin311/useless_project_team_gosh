// Debug component to test audio functionality
import React, { useState } from 'react';
import { testGeminiConnection } from '../services/geminiService';

const AudioDebugHelper = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const info = {
      browser: navigator.userAgent,
      mediaDevicesSupported: !!navigator.mediaDevices,
      getUserMediaSupported: !!navigator.mediaDevices?.getUserMedia,
      mediaRecorderSupported: !!window.MediaRecorder,
      fileReaderSupported: !!window.FileReader,
      supportedMimeTypes: [],
      geminiApiTest: null
    };

    // Test supported MIME types
    const mimeTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/m4a', 'audio/mp4'];
    mimeTypes.forEach(type => {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) {
        info.supportedMimeTypes.push(type);
      }
    });

    // Test Gemini API connection
    try {
      const geminiTest = await testGeminiConnection();
      info.geminiApiTest = geminiTest;
    } catch (error) {
      info.geminiApiTest = { success: false, error: error.message };
    }

    setDebugInfo(info);
    setTesting(false);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <h4>Audio Debug Helper</h4>
      <button onClick={runDiagnostics} disabled={testing}>
        {testing ? 'Testing...' : 'Run Diagnostics'}
      </button>
      
      {debugInfo && (
        <div style={{ marginTop: '10px' }}>
          <p><strong>Browser:</strong> {debugInfo.browser.includes('Chrome') ? 'Chrome' : debugInfo.browser.includes('Firefox') ? 'Firefox' : 'Other'}</p>
          <p><strong>Media Devices:</strong> {debugInfo.mediaDevicesSupported ? '✅' : '❌'}</p>
          <p><strong>getUserMedia:</strong> {debugInfo.getUserMediaSupported ? '✅' : '❌'}</p>
          <p><strong>MediaRecorder:</strong> {debugInfo.mediaRecorderSupported ? '✅' : '❌'}</p>
          <p><strong>FileReader:</strong> {debugInfo.fileReaderSupported ? '✅' : '❌'}</p>
          <p><strong>Supported Audio Types:</strong></p>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {debugInfo.supportedMimeTypes.map(type => (
              <li key={type}>{type}</li>
            ))}
          </ul>
          <p><strong>Gemini API:</strong> {debugInfo.geminiApiTest?.success ? '✅' : '❌'}</p>
          {!debugInfo.geminiApiTest?.success && (
            <p style={{ color: 'red', fontSize: '10px' }}>
              Error: {debugInfo.geminiApiTest?.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioDebugHelper;
