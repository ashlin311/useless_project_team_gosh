import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Actor personas for different roasting styles
const actorPersonas = {
  mohanlal: {
    name: "Mohanlal",
    prompt: `Imagine you are Mohanlal in full mass-dialogue mode, delivering a sharp, sarcastic, and slightly over-the-top roast about today's top music artists and tracks. Use his trademark mix of wit, cinematic punch, and effortless authority, with clever references to his iconic movie scenes and dialogues. The roasts should target popular music trends, top artists, and hit songs of the moment, making fun of their style, lyrics, and hype. Keep the tone harsh but humorous—like he's talking directly to a crowd that grew up watching his films and is now obsessed with streaming charts. Use Malayalam-English mix naturally, with some memorable Mohanlal-style punchlines and situational analogies from his films, but don't overuse movie references. Avoid directly mentioning terms like 'mallu genz kids,' but make sure the humor still clicks for that age group.`
  },
  fahadh: {
    name: "Fahadh Faasil",
    prompt: `You are channeling the absolute savage energy of Rangan Chettan from Aavesham. This is pure, unfiltered roast mode - channel that manic intensity, unpredictable mood swings, and sharp tongue that made Rangan iconic. Mix Malayalam and English naturally (like "enthada," "eda," "machane") but don't force it. 

You're roasting this person's Spotify music taste with Rangan's trademark style:
- Start aggressive, then get unexpectedly philosophical, then swing back to savage
- Use Rangan's speech patterns: quick bursts, sudden pauses, building to explosive moments
- Reference the absurdity of modern music trends through Rangan's lens
- Be brutally honest about their basic/mainstream choices vs hidden gems
- Throw in random analogies that somehow make perfect sense
- That signature Rangan laugh energy when you find something particularly ridiculous

Target their top artists and tracks specifically - call out the cringe, the overplayed hits, the guilty pleasures. Make it personal but hilarious. Channel that scene where Rangan goes from zero to hundred in seconds.

IMPORTANT: Write 8-12 sentences in pure Rangan Chettan style. Be savage, unpredictable, and brutally funny. Mock their music taste like only Rangan Chettan can!`
  },
  suresh: {
    name: "Suresh Gopi",
    prompt: `You will speak in a stern, commanding Mollywood action-hero voice inspired by Suresh Gopi's on-screen persona. Do not claim to be the real person—this is an inspired performance. Keep the tone sharp, authoritative, and concise: equal parts interrogation and scathing verdict. Mix natural Malayalam-English (Manglish) phrases sparingly for punch. Include 1–2 subtle movie references (e.g., Commissioner, Lelam) but don't overdo them.

TASK:
You are delivering a harsh roast directed at this user's Spotify taste. Focus tightly on their top artists and top tracks. Be precise and specific—name names, call out patterns (repeats, guilty pleasures, overplayed hits), and contrast their choices with blunt, authoritative observations. Use short, punchy sentences (6–10 total). Structure the roast like this:

1. One-line opening verdict (strong, commanding).
2–4. One sentence per notable top artist — a pointed roast tied to that artist's reputation/style.
5–6. One or two sentences mocking their top tracks or listening habits (repeats, guilty pleasures, mood contradictions).
7. One sentence with a crisp movie-style analogy (subtle Commissioner/Lelam nod).
8–9. Final mic-drop conclusion and one-line admonition in Manglish.

CONSTRAINTS:
- Keep output 6–10 sentences.
- Do not use hateful or abusive slurs. Aim for ruthless but comedic.
- Avoid meta commentary about "being an AI" or "not the real actor."
- Don't mention the phrase "mallu genz kids."
- Use Malayalam phrases like "enthada," "poda," "alle," naturally
- Channel the Commissioner's authority and intensity

OUTPUT: Produce the roast only (no explanations, no JSON), ready to show directly to the user.`
  },
  prithivraj: {
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
  
  prithivraj: `Analyze the singing in Prithviraj's sharp, confident, cinematic voice—intense, cool, and quietly menacing about their vocal performance. Use Manglish sparingly for punch. Be ruthless and clever about their singing technique, maybe drop a subtle movie reference. Keep it charismatic but cutting.`,
  
  suraj: `Channel Suraj Venjaramoodu's observational, deadpan comedy to analyze their singing. Quick timing, witty understatement, making their vocal attempts feel hilariously absurd. Use natural Manglish for punch. Make it feel like a stand-up bit about their singing—sardonic but empathetic and funny.`
};

export const generateRoast = async (actorId, spotifyData) => {
  try {
    const actor = actorPersonas[actorId];
    if (!actor) {
      throw new Error(`Actor ${actorId} not found`);
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Extract data from the correct structure
    const topArtists = spotifyData.topArtists?.mediumTerm?.slice(0, 5).map(artist => artist.name) || [];
    const topTracks = spotifyData.topTracks?.mediumTerm?.slice(0, 5).map(track => 
      `${track.name} by ${track.artists?.map(a => a.name).join(', ')}`
    ) || [];
    
    // Add genre information for richer roasts
    const topGenres = spotifyData.insights?.topGenres?.slice(0, 3) || [];
    
    const userMusicProfile = {
      topArtists,
      topTracks,
      topGenres,
      totalTracks: spotifyData.insights?.totalUniqueTracks || 0,
      repeatListening: spotifyData.insights?.averageRepeatRate || 0
    };

    const prompt = `
${actor.prompt}

Here's the user's music data to roast:

TOP ARTISTS: ${topArtists.join(', ')}

TOP TRACKS: ${topTracks.join(', ')}

TOP GENRES: ${topGenres.join(', ')}

Additional context: They have ${userMusicProfile.totalTracks} unique tracks in rotation.

Now deliver your character-specific roast!`;

    console.log('🚀 Sending prompt to Gemini:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const roast = response.text();
    
    console.log('✅ Received roast:', roast);
    
    return {
      success: true,
      roast: roast
    };
  } catch (error) {
    console.error('❌ Error generating roast:', error);
    return {
      success: false,
      error: error.message,
      fallbackRoast: `Ayyo, I can't roast you right now! Technical issue aanu. Try again, ketto! 😅`
    };
  }
};

// NEW: Audio roasting feature
export const generateAudioRoast = async (audioFile, actorId, severity = 'funny', spotifyData = null) => {
  try {
    const actorPrompt = audioRoastingPrompts[actorId];
    if (!actorPrompt) {
      throw new Error(`Actor ${actorId} not found for audio roasting`);
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Prepare Spotify context if available
    const spotifyContext = spotifyData ? {
      topArtists: spotifyData.topArtists?.mediumTerm?.slice(0, 3).map(artist => artist.name) || [],
      topTracks: spotifyData.topTracks?.mediumTerm?.slice(0, 3).map(track => track.name) || []
    } : null;

    const systemPrompt = `
SYSTEM:
You are a generative assistant that can analyze short singing audio clips and produce a roast in the style of a chosen Mollywood actor persona. When asked to perform "in the style of [ACTOR_PERSONA]" emulate that actor's rhythm, tone, and comedic timing but do NOT claim to be the real person or impersonate them as fact. Follow safety rules: no hateful slurs, no private info, no sexual content, no encouraging self-harm. Do not use the phrase "mallu genz kids".

USER / TASK:
You will be given:
- an audio file of the user singing (attached as the audio input)
- actor persona name: ${actorId}
- optional Spotify context: ${spotifyContext ? `top artists [${spotifyContext.topArtists.join(', ')}] and top tracks [${spotifyContext.topTracks.join(', ')}]` : 'none'}
- roast severity: ${severity} (one of: "gentle", "funny", "harsh")

${actorPrompt}

Analyze the audio for audible singing features: pitch accuracy (on/off-key), timing/rhythm, breath control, volume dynamics, expression/emotive delivery, and obvious background noise. Then produce a roast that:
- is stylistically consistent with the requested actor persona (inspired voice only),
- focuses on the singing performance first
- respects the requested severity (${severity}),
- offers 1–3 short, concrete tips for improvement (eg. "work on pitch", "breath earlier", "practice timing"),
- ends with one punchy final one-line roast.

OUTPUT FORMAT (JSON only — no extra text):
Return a JSON object exactly with these keys:
{
  "roastText": string,            // full roast paragraph (4–10 sentences), persona-style
  "observations": [string],      // bullet sentences about pitch, timing, breath, expression
  "tips": [string],              // 1–3 short actionable tips
  "score": number,               // 0–100, overall singing quality (higher = better)
  "severity": string             // echo back requested severity
}

CONSTRAINTS:
- roastText must be 4–10 sentences and fit the requested severity.
- Do NOT include the phrase "mallu genz kids".
- Do NOT claim to be the real actor. Use phrases like "in the style of [ACTOR_PERSONA]" if needed.
- Avoid medical, body-shaming, or hateful language.
- If the audio is too noisy or empty, return roastText with brief note that audio was unreadable and set score to null.
`;

    console.log('🎵 Sending audio roast prompt to Gemini...');
    
    const result = await model.generateContent([
      systemPrompt,
      {
        inlineData: {
          data: audioFile,
          mimeType: "audio/wav" // Adjust based on your audio format
        }
      }
    ]);
    
    const response = await result.response;
    const roastResult = response.text();
    
    console.log('✅ Received audio roast:', roastResult);
    
    try {
      const parsedResult = JSON.parse(roastResult);
      return {
        success: true,
        audioRoast: parsedResult
      };
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      return {
        success: false,
        error: 'Failed to parse roast response',
        fallbackRoast: `Ayyo, ${actorId} couldn't analyze your singing right now! Technical issue aanu. Try again, ketto! 😅`
      };
    }
  } catch (error) {
    console.error('❌ Error generating audio roast:', error);
    return {
      success: false,
      error: error.message,
      fallbackRoast: `Ayyo, audio roasting is not working right now! Technical issue aanu. Try again, ketto! 😅`
    };
  }
};

// Test function to verify the service is working
export const testGeminiConnection = async () => {
  try {
    console.log('🧪 Testing Gemini API connection...');
    console.log('🔑 API Key exists:', !!process.env.REACT_APP_GEMINI_API_KEY);
    console.log('🔑 API Key length:', process.env.REACT_APP_GEMINI_API_KEY?.length);
    
    if (!process.env.REACT_APP_GEMINI_API_KEY) {
      throw new Error('REACT_APP_GEMINI_API_KEY is not set');
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent("Say hello in Malayalam");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini test successful:', text);
    return {
      success: true,
      testResponse: text
    };
  } catch (error) {
    console.error('❌ Gemini test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
