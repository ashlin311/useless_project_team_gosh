import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Actor personas for different roasting styles
const actorPersonas = {
  mohanlal: {
    name: "Mohanlal",
    prompt: `You are Malayalam superstar Mohanlal, the complete actor known for your razor-sharp wit, brutal sarcasm, and no-nonsense charm. You are roasting someone's Spotify music taste with zero mercy. Go all-in — be brutally honest, cutting, and direct, while still keeping it entertaining. This should feel like a savage monologue to a close friend where you don’t sugarcoat anything.

PERSONALITY TRAITS TO EMBODY:

Savage, intelligent humor with detailed observations

Blend Malayalam-English (Manglish) expressions naturally

No holding back — if their taste is bad, say it outright

Multiple sharp references to your iconic movies (Kilukkam, Chithram, Drishyam, Spadikam, Narasimham, etc.)

Use sarcasm, exaggeration, and mockery freely

ROASTING STYLE – BE DETAILED AND RELENTLESS:

Start with a strong, scathing observation about their overall taste

Rip apart their top artists one by one with creative insults and brutal honesty

Make sharp jabs at their genres, guilty pleasures, and repeated listens

Compare them to ridiculous or embarrassing situations from your films

Point out patterns in their listening that make them look desperate, cringe, or stuck in the past

End with a cutting conclusion that makes them rethink their life choices

STRUCTURE YOUR ROAST IN 8–12 SENTENCES:

Open with an intense burn about their overall taste
2–3. Tear down their top artists (name names, be specific)
4–5. Mock their genres or music habits with savage analogies
6–7. Bring in movie character references to amplify the insult
8–9. Point out embarrassing listening patterns or recent plays
10–11. Wrap it up with a mic-drop insult

Close with a short Manglish burn

IMPORTANT: This is not friendly teasing — this is full-on roast mode. Keep it funny but absolutely brutal.`
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
    
    // Add recent tracks for more context
    const recentTracks = spotifyData.recentlyPlayed?.slice(0, 3).map(item => 
      `${item.track?.name} by ${item.track?.artists?.map(a => a.name).join(', ')}`
    ) || [];

    const musicSummary = `
Top Artists: ${topArtists.join(', ')}
Top Tracks: ${topTracks.join(', ')}
Top Genres: ${topGenres.join(', ')}
Recently Played: ${recentTracks.join(', ')}
Artist Diversity: ${spotifyData.insights?.artistDiversity || 0} unique artists
Repeat Listening: ${spotifyData.insights?.repeatListeningHabits?.length || 0} tracks on repeat
`;

    const fullPrompt = `${actor.prompt}

Here's the user's Spotify music data:
${musicSummary}

Now roast their music taste in ${actor.name}'s style. IMPORTANT INSTRUCTIONS:
- Write exactly 8-12 sentences (COUNT THEM!)
- Be detailed and elaborate in your roasting
- Mention specific artist names from their list
- Make multiple movie references
- Use Malayalam-English expressions throughout
- Structure it like a proper Mohanlal monologue
- Don't be brief - give a full, entertaining roast!
- Each sentence should be substantial and detailed
- Add personal anecdotes or comparisons to your film career
- Make observations about their musical journey

Remember: This should be a LONG, detailed roast - not a short quip! Think of it as Mohanlal giving a 2-3 minute roasting speech.

Start your roast now:`;

    console.log('🎭 Generating detailed roast with enhanced prompt...');
    console.log('🔍 API Key available:', !!process.env.REACT_APP_GEMINI_API_KEY);
    console.log('📊 Music data summary:', musicSummary);

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const roast = response.text();
    
    console.log('✅ Raw Gemini response:', roast);
    console.log('📝 Response length:', roast.length);

    return {
      success: true,
      roast: roast.trim(),
      actor: actor.name
    };

  } catch (error) {
    console.error('❌ Error generating roast:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Check if it's an API key issue
    if (error.message.includes('API_KEY') || error.message.includes('401')) {
      return {
        success: false,
        error: 'API Key issue: ' + error.message,
        fallbackRoast: "Ayyo, ente API key'il problem undu! Check cheyyam ketto! 🔑"
      };
    }
    
    // Check if it's a quota issue
    if (error.message.includes('quota') || error.message.includes('429')) {
      return {
        success: false,
        error: 'Quota exceeded: ' + error.message,
        fallbackRoast: "Ayyo, Gemini quota kazhinjuu! Pinne try cheyyam ketto! ⏰"
      };
    }
    
    return {
      success: false,
      error: error.message,
      fallbackRoast: "Ayyo, ente AI adipoli alle! Pinne ninte music taste... athu vere story aanu! 😄"
    };
  }
};

// Test function to check if Gemini is working
export const testGeminiConnection = async () => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
      },
    });
    const result = await model.generateContent("Say hello in Malayalam style");
    const response = await result.response;
    
    return {
      success: true,
      message: "Gemini 2.0 Flash API is working!",
      testResponse: response.text()
    };
  } catch (error) {
    console.error('Gemini test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
