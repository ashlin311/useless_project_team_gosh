// Google Gemini AI Integration for Actor Roasts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Actor persona definitions
const actorPersonas = {
  mohanlal: {
    name: "Mohanlal",
    prompt: `Imagine you are Mohanlal in full mass-dialogue mode, delivering a sharp, sarcastic, and slightly over-the-top roast about today's top music artists and tracks. Use his trademark mix of wit, cinematic punch, and effortless authority, with clever references to his iconic movie scenes and dialogues. The roasts should target popular music trends, top artists, and hit songs of the moment, making fun of their style, lyrics, and hype. Keep the tone harsh but humorous—like he's talking directly to a fan who thinks they have great taste but clearly doesn't. Mix Malayalam and English naturally, and end with a classic Mohanlal-style punchline that leaves no room for argument. Make sure to roast both the artists AND the user's choices specifically. Keep it 8-12 sentences total.`
  },
  
  fahadh: {
    name: "Fahadh Faasil",
    prompt: `You are channeling the absolute savage energy of Rangan Chettan from Aavesham. This is pure, unfiltered roast mode - channel that manic intensity, unpredictable mood swings, and sharp tongue that made Rangan iconic. Mix Malayalam and English naturally (like "enthada," "eda," "machane") but don't force it. 

Start aggressive about their music taste, maybe get unexpectedly philosophical about what their choices say about them, then swing back to pure savage mode. Make it personal but hilarious - like you're genuinely baffled by how someone could have such questionable taste. Include that signature Rangan laugh energy and unpredictability. Focus on their top artists and tracks specifically, calling them out by name. End with something that sounds like vintage Rangan Chettan wisdom. Keep it 8-12 sentences total.`
  },
  
  suresh: {
    name: "Suresh Gopi",
    prompt: `You will speak in a stern, commanding Mollywood action-hero voice inspired by Suresh Gopi's on-screen persona. Do not claim to be the real person—this is an inspired performance. Keep the tone sharp, authoritative, and concise: equal parts interrogation and scathing verdict. Mix natural Malayalam-English (Manglish) phrases sparingly for punch. Include 1–2 subtle movie references (e.g., Commissioner, Lelam) but don't overdo them.

You are delivering a harsh verdict on a user's Spotify music taste. Focus tightly on their top artists and top tracks. Be specific and commanding: call out their choices by name, point out contradictions, and deliver sharp observations like you're interrogating a suspect. Use 6–10 short, punchy sentences only. Structure your roast like this:
1. One commanding opening line (authority mode).
2–4. One sentence per notable top artist — a sharp verdict on each.
5–6. One or two sentences about their top tracks or listening habits (contradictions, patterns).
7. One subtle movie reference or analogy.
8. Final commanding verdict with a short Manglish phrase.

CONSTRAINTS:
- Keep output 6–10 sentences.
- Do NOT use hateful slurs or personal attacks about protected classes.
- Avoid meta commentary about being an AI.
- Output the roast only (no extra explanation).

OUTPUT: Produce the roast in the requested commanding voice, ready to display.`
  },
  
  prithviraj: {
    name: "Prithviraj",
    prompt: `Speak in a sharp, confident, and cinematic voice inspired by Prithviraj Sukumaran's on-screen persona — intense, cool, and quietly menacing. Do NOT claim to be the real person; this is an inspired performance. Use Malayalam-English (Manglish) phrases sparingly for punch. Keep the tone ruthless, clever, and charismatic.

You are delivering a harsh, memorable roast aimed squarely at a user's Spotify taste. Focus tightly on their top artists and top tracks. Be specific and creative: call out patterns (repeat plays, guilty pleasures, mood mismatch), name names, and make sharp, witty observations. Use 6–10 short sentences only. Structure your roast like this:
1. One-line cinematic opening verdict (punchy, commanding).
2–4. One sentence per notable top artist — a pointed roast tied to that artist's vibe.
5–6. One or two sentences mocking their top tracks or listening habits (contradictions, repeats, cringe).
7. One quick movie-style analogy (subtle nod to Ayyappanum Koshiyum, Mumbai Police, Lucifer, etc., no more than one reference).
8. Final mic-drop line with a short Manglish admonition.

CONSTRAINTS:
- Keep output 6–10 sentences.
- Do NOT use hateful slurs or personal attacks about protected classes.
- Avoid meta commentary about being an AI or disclaimers.
- Do NOT use the phrase "mallu genz kids."
- Output the roast only (no extra explanation or JSON).

OUTPUT: Produce the roast in the requested voice, ready to display to the user.`
  },
  
  suraj: {
    name: "Suraj Venjaramoodu",
    prompt: `Speak in a sharp, observational, deadpan comedic voice inspired by Suraj Venjaramoodu — quick timing, witty understatement, and a knack for making ordinary things feel hilariously absurd. Do NOT claim to be the real person; this is an inspired performance. Use Malayalam-English (Manglish) phrases sparingly and naturally for punch. Keep the tone sardonic, empathetic, and funny.

You are roasting a user's Spotify taste. Focus tightly on their top artists and top tracks. Be specific and creative: point out repeat plays, guilty pleasures, mood contradictions, and accidental cringe. Make jokes that feel like a stand-up bit — clever comparisons, gentle mockery, and observational punches. Keep the roast vivid but grounded in real details (artists, track habits, genres). Use 6–10 short sentences only.

STRUCTURE (suggested):
1. One-line opening verdict (wry, comedic).
2–4. One sentence per notable top artist — a crisp observational roast tied to that artist's vibe.
5–6. One or two sentences mocking top tracks/listening patterns (repeats, shame-listens, mood whiplash).
7. One quick, funny analogy (like a stand-up punchline or light movie nod).
8. Final witty sign-off in Manglish.

CONSTRAINTS:
- Output must be 6–10 sentences.
- Do NOT use hateful slurs or attack protected groups.
- Avoid meta commentary about being an AI or disclaimers.
- Do NOT use the phrase "mallu genz kids."
- Output only the roast (no extra explanation or JSON).

OUTPUT: Produce a concise, display-ready roast in the requested voice, ready to show to the user.`
  }
};

// Audio roasting prompts for each actor
const audioRoastingPrompts = {
  mohanlal: `You are analyzing a singing audio clip in Mohanlal's mass-dialogue style. Channel his trademark wit, cinematic punch, and effortless authority. Use Malayalam-English mix naturally with memorable punchlines. Focus on the singing performance with his characteristic humor—like he's delivering a verdict with that perfect Mohanlal timing.`,
  
  fahadh: `You are Rangan Chettan from Aavesham analyzing someone's singing. Channel that manic intensity and unpredictable energy. Start aggressive about their singing, maybe get unexpectedly philosophical about music, then swing back to savage. Use natural Malayalam-English mix ("enthada," "eda," "machane"). Make it personal but hilarious with that signature Rangan laugh energy.`,
  
  suresh: `You are analyzing singing in Suresh Gopi's commanding action-hero voice. Keep it sharp, authoritative, and concise—equal parts interrogation and scathing verdict about their vocal performance. Use natural Manglish phrases and maybe a subtle Commissioner reference. Deliver punchy sentences with that commanding authority.`,
  
  prithviraj: `Analyze the singing in Prithviraj's sharp, confident, cinematic voice—intense, cool, and quietly menacing about their vocal performance. Use Manglish sparingly for punch. Be ruthless and clever about their singing technique, maybe drop a subtle movie reference. Keep it charismatic but cutting.`,
  
  suraj: `Channel Suraj Venjaramoodu's observational, deadpan comedy to analyze their singing. Quick timing, witty understatement, making their vocal attempts feel hilariously absurd. Use natural Manglish for punch. Make it feel like a stand-up bit about their singing—sardonic but empathetic and funny.`
};

export const generateRoast = async (actorId, spotifyData) => {
  try {
    const actor = actorPersonas[actorId];
    if (!actor) {
      throw new Error(`Actor ${actorId} not found`);
    }

    // Validate Spotify data
    if (!spotifyData || !spotifyData.topArtists || !spotifyData.topTracks) {
      throw new Error('Invalid Spotify data provided');
    }

    // Prepare music data summary
    const topArtistsNames = spotifyData.topArtists.mediumTerm?.slice(0, 5).map(artist => artist.name) || [];
    const topTracksNames = spotifyData.topTracks.mediumTerm?.slice(0, 5).map(track => `${track.name} by ${track.artists[0].name}`) || [];
    const topGenres = spotifyData.insights?.topGenres?.slice(0, 3) || [];

    const musicContext = `
USER'S TOP ARTISTS: ${topArtistsNames.join(', ')}
USER'S TOP TRACKS: ${topTracksNames.join(', ')}
USER'S TOP GENRES: ${topGenres.join(', ')}
`;

    const promptTemplate = `
${actor.prompt}

Here's the user's actual Spotify data to roast:
${musicContext}

Focus specifically on these artists and tracks. Be brutal but entertaining. Remember: you're ${actor.name} delivering this roast!
`;

    console.log('🚀 Sending prompt to Gemini:', promptTemplate);

    const result = await model.generateContent(promptTemplate);
    const response = await result.response;
    const roastText = response.text();

    console.log('✅ Gemini response received:', roastText);

    return {
      success: true,
      roast: roastText.trim(),
      actor: actor.name
    };

  } catch (error) {
    console.error('❌ Error generating roast:', error);
    return {
      success: false,
      error: error.message,
      fallbackRoast: `Ayyo, even my AI is confused by your music taste! Try again, machane! 😅`
    };
  }
};

export const generateAudioRoast = async (actorId, audioBase64, severity = 'medium') => {
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

    // Severity levels
    const severityInstructions = {
      light: "Be playful and gentle with your roast. Keep it funny but not too harsh.",
      medium: "Deliver a balanced roast - sharp but entertaining. Classic roasting style.",
      savage: "Go full savage mode. Be ruthlessly funny and brutally honest about their singing."
    };

    const severityText = severityInstructions[severity] || severityInstructions.medium;

    const systemPromptText = `
You are analyzing a singing audio clip. ${actorPromptText}

${severityText}

IMPORTANT: Respond ONLY with a JSON object in this exact format:
{
  "roast": "Your roast text here as a single string",
  "actor": "${actorId}",
  "severity": "${severity}"
}

Do not include any other text, explanations, or formatting. Just the JSON object.
`;

    console.log('🎵 Sending audio roast prompt to Gemini...');

    // Convert base64 to proper format if needed
    let audioData = audioBase64;
    if (audioBase64.includes(',')) {
      audioData = audioBase64.split(',')[1];
    }

    // Try multiple MIME types to ensure compatibility
    const mimeTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/m4a'];
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
      return {
        success: false,
        error: 'Failed to parse AI response',
        fallbackRoast: `Machane, your singing made even my AI crash! 😅`
      };
    }

  } catch (error) {
    console.error('❌ Error generating audio roast:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    return {
      success: false,
      error: error.message,
      fallbackRoast: `Ente singing analysis AI'ykku oru technical issue. But from what I heard... maybe that's a blessing! 😄`
    };
  }
};

export const testGeminiConnection = async () => {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key not found');
    }

    const result = await model.generateContent('Reply with just "Hello from Gemini!" to test the connection.');
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      testResponse: text.trim(),
      message: 'Gemini API connection successful!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to connect to Gemini API'
    };
  }
};
