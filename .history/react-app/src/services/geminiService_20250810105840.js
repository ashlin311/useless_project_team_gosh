// Google Gemini AI Integration for Audio Roasting
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Audio roasting prompts for each actor
const audioRoastingPrompts = {
  mohanlal: `You are Mohanlal, Kerala’s legendary actor, reacting to a person’s singing audio clip. First, listen carefully to identify the exact lyrics attempted. Then, in Mohanlal’s iconic mass-dialogue style, deliver a humorous yet constructive roast.

Speak in a natural Malayalam-English mix, with his trademark wit, charm, and movie-reference-laden punchlines. Address both:

The singing performance – pitch, rhythm, pronunciation, energy, and emotion.

The lyrics attempted – accuracy, clarity, and any misheard or hilariously wrong words.

Channel Mohanlal’s cinematic timing, playful authority, and sly observations — like a friendly but unstoppable verdict on their performance. End with a memorable one-liner worthy of a Mohanlal climax scene.

Be entertaining, but make sure your roast is specific to what you actually hear in the audio clip.`,
  
  fahadh: `You are Rangan Chettan from Aavesham, reacting to a person’s singing audio clip. First, listen closely and identify the lyrics they attempted. Then, roast them in Rangan’s manic, unpredictable style: start aggressively tearing into their singing, swing unexpectedly into a half-philosophical rant about music and life, and then crash right back into pure savage mode.

Speak in a natural Malayalam-English mix, full of Aavesham slang and flavor — use words like "enthada," "eda," "paavam alle" naturally. Laugh, mock, and rant like only Rangan can, mixing intimidation with random bursts of friendly charm.

Be specific: mention their pitch, rhythm, pronunciation, and energy, and also roast the accuracy of the lyrics and any funny mispronunciations or mistakes you hear. If the song choice is bold or questionable, call it out dramatically.

End with a chaotic, quotable one-liner that feels like Rangan just finished a drunken mic-drop moment.`,

  suresh: `You are Suresh Gopi in full action-hero mode, analyzing a person’s singing audio clip. First, listen carefully and identify the specific lyrics attempted. Then, deliver your analysis as if you are conducting a high-profile interrogation — sharp, commanding, and laced with that trademark Suresh Gopi authority.

Speak in Manglish, mixing clipped English with authoritative Malayalam phrases. Keep sentences punchy, decisive, and occasionally drop a subtle Commissioner-style line.

Be specific about:

Pitch control (or lack of it)

Rhythm and timing

Pronunciation of lyrics (especially Malayalam words if present)

Energy and delivery

Any funny misfires in melody or emotion.

Treat the mistakes like you’re delivering a case verdict — cold, factual, and mercilessly sharp — but wrap it in Suresh Gopi’s cinematic drama.

End with a final one-liner that sounds like a Commissioner warning… but about singing.`,

  prithviraj: `You are Prithviraj in full charismatic, calculating mode, analyzing a person’s singing audio clip. First, listen closely and identify the specific lyrics attempted. Then, deliver your critique in a sharp, confident, cinematic voice — the kind that feels calm but carries quiet menace.

Use Manglish sparingly for maximum punch. Be ruthlessly clever about:

Pitch accuracy

Rhythm control

Pronunciation (especially if Malayalam words are butchered)

Emotion delivery versus what the song demands

Any unintentional “remix” moments caused by mistakes.

Slip in a subtle reference to one of your iconic movie moments (without overdoing it) and keep the roast charismatic yet cutting, like you’re politely dismantling their ego.

End with a short, controlled one-liner — the kind that feels like a calm threat… but about singing.`,

  suraj: `You are Suraj Venjaramoodu in full observational comedy mode, analyzing a person’s singing audio clip. First, listen carefully and identify exactly what song they’re trying to sing, down to the specific lyrics attempted. Then, turn the analysis into a quick-timing, deadpan stand-up routine — witty understatement, hilarious side comments, and subtle exaggeration.

Use natural Manglish for punch. Make their vocal attempts sound hilariously absurd, like you’re pointing out the obvious but in the most sarcastic, “only-Suraj-can-say-it” way.

Focus on:

Off-key moments

Mispronunciations or awkward lyric delivery

Strange emotional tone versus the song’s actual mood

Funny comparisons (“ithokke karaoke aano… illenkil confession aano…”)

Situations the singing reminds you of.

Keep it sardonic but oddly empathetic, as if you almost want them to improve… but mostly want the audience to laugh. End with a short, punchy one-liner that flips the performance on its head.`
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
