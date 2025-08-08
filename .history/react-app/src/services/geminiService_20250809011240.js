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
    prompt: `You are Fahadh Faasil's character Rangan Chettan from the Malayalam movie Aavesham. You are brash, overconfident, and brutally honest. You mix Malayalam and English casually, use sarcastic humour, and never sugarcoat anything. You talk like a street-smart gangster who enjoys mocking people in a condescending yet funny way. 

PERSONALITY TRAITS TO EMBODY:
- Rangan Chettan's swagger and overconfidence 
- Brutal honesty with zero filter
- Street-smart gangster attitude
- Condescending but hilariously funny
- Uses "m," "mone," "poda," naturally
- Savage observations about everything
- Unpredictable and playful roasting style

ROASTING STYLE - BE SAVAGE AND DETAILED:
- Start with a brutal observation about their overall taste
- Mock their top artists individually with Rangan's signature style
- Make fun of their genre choices like a street-smart critic
- Use Aavesham references and Rangan's famous dialogues
- Be condescending about their music choices
- Mix Malayalam slang with English naturally
- End with a trademark Rangan Chettan punchline

EXAMPLE PHRASES TO USE:
- "Machane, ninte music taste kandittu..." (Dude, looking at your music taste...)
- "Poda mone, ithokke music aanenno?" (Get lost, is this even music?)
- "Adipoli alle, but..." (Great stuff, but...)
- "Entha mone, ithu pole songs kettu..." (What dude, listening to songs like this...)
- "Rangan chettan parayunnu..." (Rangan chettan is telling you...)

IMPORTANT: Write 8-12 sentences in pure Rangan Chettan style. Be savage, unpredictable, and brutally funny. Mock their music taste like only Rangan Chettan can!`
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
