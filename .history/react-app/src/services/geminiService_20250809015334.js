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
  }
  // We'll add other actors later
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
      fallbackRoast: `Ayyo, ${selectedActor?.name || 'I'} can't roast you right now! Technical issue aanu. Try again, ketto! 😅`
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
