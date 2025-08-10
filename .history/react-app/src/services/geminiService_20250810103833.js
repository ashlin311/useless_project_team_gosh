// Google Gemini AI Integration for Audio Roasting
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Audio roasting prompts for each actor
const audioRoastingPrompts = {
  mohanlal: `You are analyzing a singing audio clip in Mohanlal's mass-dialogue style. Channel his trademark wit, cinematic punch, and effortless authority. Use Malayalam-English mix naturally with memorable punchlines. Focus on the singing performance with his characteristic humor—like he's delivering a verdict with that perfect Mohanlal timing. Be entertaining but constructive about their vocal performance. `,
  
  fahadh: `You are Rangan Chettan from Aavesham analyzing someone's singing. Channel that manic intensity and unpredictable energy. Start aggressive about their singing, maybe get unexpectedly philosophical about music, then swing back to savage. Use natural Malayalam-English mix ("enthada," "eda,"). Make it personal but hilarious with that signature Rangan laugh energy about their vocal performance.`,
  
  suresh: `You are analyzing singing in Suresh Gopi's commanding action-hero voice. Keep it sharp, authoritative, and concise—equal parts interrogation and scathing verdict about their vocal performance. Use natural Manglish phrases and maybe a subtle Commissioner reference. Deliver punchy sentences with that commanding authority about their singing technique.`,
  
  prithviraj: `Analyze the singing in Prithviraj's sharp, confident, cinematic voice—intense, cool, and quietly menacing about their vocal performance. Use Manglish sparingly for punch. Be ruthless and clever about their singing technique, maybe drop a subtle movie reference. Keep it charismatic but cutting about their musical abilities.`,
  
  suraj: `Channel Suraj Venjaramoodu's observational, deadpan comedy to analyze their singing. Quick timing, witty understatement, making their vocal attempts feel hilariously absurd. Use natural Manglish for punch. Make it feel like a stand-up bit about their singing—sardonic but empathetic and funny about their musical performance.`
};

export const generateAudioRoast = async (actorId, audioBase64, severity = 'funny') => {
  try {
    console.log('🎵 Starting audio roast generation...');
    console.log('Actor ID:', actorId);
    console.log('Audio data length:', audioBase64 ? audioBase64.length : 'No audio data');
    console.log('Severity:', severity);

    const actorPromptText = audioRoastingPrompts[actorId];
    if (!actorPromptText) {
      throw new Error(`Actor ${actorId} not found for audio roasting`);
    }

    if (!audioBase64) {
      throw new Error('No audio data provided');
    }

    // Severity levels mapping
    const severityInstructions = {
      gentle: "Be playful and gentle with your roast. Keep it funny but not too harsh. Focus on encouragement with humor.",
      funny: "Deliver a balanced roast - sharp but entertaining. Classic roasting style with constructive feedback.",
      harsh: "Go full savage mode. Be ruthlessly funny and brutally honest about their singing, but keep it entertaining."
    };

    const severityText = severityInstructions[severity] || severityInstructions.funny;

    const systemPromptText = `
You are analyzing a singing audio clip. ${actorPromptText}

${severityText}

Focus on:
- Vocal technique and pitch accuracy
- Rhythm and timing
- Overall musical performance
- Style and delivery
- Areas for improvement (in a humorous way)

IMPORTANT: Respond ONLY with a JSON object in this exact format:
{
  "roast": "Your roast text here as a single string (6-10 sentences)",
  "actor": "${actorId}",
  "severity": "${severity}"
}

Do not include any other text, explanations, or formatting. Just the JSON object.
`;

    console.log('🎵 Sending audio roast prompt to Gemini...');

    // Clean base64 data if it includes data URL prefix
    let audioData = audioBase64;
    if (audioBase64.includes(',')) {
      audioData = audioBase64.split(',')[1];
    }

    // Try multiple MIME types to ensure compatibility
    const mimeTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/m4a', 'audio/mp4'];
    let result = null;
    let lastError = null;

    for (const mimeType of mimeTypes) {
      try {
        console.log(`🎵 Trying MIME type: ${mimeType}`);
        
        result = await model.generateContent([
          systemPromptText,
          {
            inlineData: {
              mimeType: mimeType,
              data: audioData
            }
          }
        ]);
        
        console.log(`✅ Success with MIME type: ${mimeType}`);
        break; // If successful, break out of the loop
        
      } catch (mimeError) {
        console.log(`❌ Failed with MIME type ${mimeType}:`, mimeError.message);
        lastError = mimeError;
        continue; // Try next MIME type
      }
    }

    if (!result) {
      throw lastError || new Error('All MIME types failed');
    }

    const response = await result.response;
    let responseText = response.text().trim();

    console.log('🎵 Raw Gemini response:', responseText);

    // Clean up the response to extract JSON
    responseText = responseText.replace(/```json\s*/, '').replace(/```\s*$/, '');
    responseText = responseText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

    try {
      const parsed = JSON.parse(responseText);
      console.log('✅ Audio roast generated successfully:', parsed);
      return {
        success: true,
        roast: parsed.roast,
        actor: parsed.actor,
        severity: parsed.severity
      };
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      console.log('Raw response that failed to parse:', responseText);
      
      // Fallback roasts for each actor if parsing fails
      const fallbackRoasts = {
        mohanlal: `Machane, your singing made even my AI crash! But like I always say, "Naadakam kazhinju, kaliyaakam thudangunnu" - the real performance starts when the show ends. Keep practicing, ketto! 😅`,
        fahadh: `Enthada ith? Your singing broke my AI! Eda, even Rangan couldn't handle this level of... creativity. But hey, at least you tried, machane! 😂`,
        suresh: `What is this, Commissioner? Your vocals just crashed my system! In my 30 years of service, I've heard many confessions, but this singing... this is something else entirely! 🔥`,
        prithviraj: `Your performance just made my AI surrender. That's... impressive in its own way. Even the most challenging roles I've played couldn't prepare me for this vocal experience. 😈`,
        suraj: `Machane, your singing was so unique that it confused my AI. That's... actually quite an achievement. Most people can't break artificial intelligence with just their voice! 😄`
      };
      
      return {
        success: false,
        error: 'Failed to parse AI response',
        fallbackRoast: fallbackRoasts[actorId] || `Your singing made even the AI speechless! 😅`
      };
    }

  } catch (error) {
    console.error('❌ Error generating audio roast:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Actor-specific error fallbacks
    const errorFallbacks = {
      mohanlal: `Ayyo, ente AI'ykku oru technical issue. But from what I heard... maybe that's a blessing in disguise! Keep singing, machane! 😄`,
      fahadh: `Technical glitch aanu, eda! But knowing your singing style, maybe my AI took a strategic timeout! 😂`,
      suresh: `System malfunction, but your voice... that's the real investigation here! Commissioner inte AI um crash aayi! 🔥`,
      prithviraj: `Technical difficulties, but your vocal performance... that's the real thriller here. Even my AI needed a break! 😈`,
      suraj: `AI crash aayi, machane! But honestly, after hearing that singing, I think it was a mercy crash! 😄`
    };
    
    return {
      success: false,
      error: error.message,
      fallbackRoast: errorFallbacks[actorId] || `Technical issue with the AI, but your singing... that's another story! 😄`
    };
  }
};

export const testGeminiConnection = async () => {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key not found in environment variables');
    }

    console.log('🔌 Testing Gemini API connection...');
    
    const result = await model.generateContent('Reply with just "Hello from Gemini!" to test the connection.');
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini API test successful:', text);

    return {
      success: true,
      testResponse: text.trim(),
      message: 'Gemini API connection successful!'
    };
  } catch (error) {
    console.error('❌ Gemini API test failed:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to connect to Gemini API. Please check your API key and internet connection.'
    };
  }
};
