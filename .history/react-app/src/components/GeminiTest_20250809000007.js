import React, { useState } from 'react';
import { testGeminiConnection } from '../services/geminiService';

const GeminiTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const testResult = await testGeminiConnection();
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Gemini API Test</h2>
      <button 
        onClick={handleTest} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Gemini Connection'}
      </button>
      
      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '5px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          color: result.success ? '#155724' : '#721c24'
        }}>
          <h3>Result:</h3>
          <p><strong>Status:</strong> {result.success ? 'Success ✅' : 'Failed ❌'}</p>
          {result.success && (
            <div>
              <p><strong>Message:</strong> {result.message}</p>
              <p><strong>Test Response:</strong> {result.testResponse}</p>
            </div>
          )}
          {!result.success && (
            <p><strong>Error:</strong> {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GeminiTest;
