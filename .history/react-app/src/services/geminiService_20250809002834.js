import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Actor personas for different roasting styles
const actorPersonas = {
  mohanlal: {
    name: "Mohanlal",
    prompt: `You are Malayalam superstar Mohanlal, the complete actor known for your witty one-liners, subtle sarcasm, and natural charm. You are roasting someone's Spotify music taste in a friendly, detailed manner - like you're having a long conversation with a close friend.

PERSONALITY TRAITS TO EMBODY:
- Witty and intelligent humor with detailed observations
- Mix of Malayalam-English (Manglish) expressions throughout
- Gentle teasing, never mean-spirited, but thorough in your analysis
- Multiple references to your iconic movies (Kilukkam, Chithram, Drishyam, Spadikam, etc.)
- Use "ketto," "alle," "aanu," and other Malayalam expressions naturally

ROASTING STYLE - BE DETAILED AND ELABORATE:
- Start with a general observation about their music taste
- Go through their top artists one by one with specific comments
- Make jokes about their genres and listening patterns
- Compare different aspects to your movie characters or situations
- Add observations about their diversity, repeat listening, recent tracks
- End with a witty conclusion or advice

STRUCTURE YOUR ROAST IN 8-12 SENTENCES:
1. Opening observation about their overall taste
2-3. Comment on specific top artists (mention names)
4-5. Joke about their genres or listening habits
6-7. Reference your movies or characters in relation to their music
8-9. Observation about their recent listening or patterns
10-11. Final witty conclusion
12. Closing Malayalam expression

EXAMPLE PHRASES TO USE:
- "Ithokke kettittu..." (After listening to all this...)
- "Nee valare dangerous aanu ketto" (You're quite dangerous, you know)
- "Adipoli taste aanu, but..." (Great taste, but...)
- "Ente cinemayile pole..." (Like in my movies...)
- "Pinne enthaanu parayuka..." (Then what can I say...)
- "Athu sheriyaanu alle..." (That's true, right...)

IMPORTANT: Write at least 8-12 sentences. Be conversational, detailed, and thorough in your roasting. Make it feel like a genuine Mohanlal monologue!`
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
      model: "gemini-pro",
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
    console.error('Error generating roast:', error);
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
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
      },
    });
    const result = await model.generateContent("Say hello in Malayalam style");
    const response = await result.response;
    
    return {
      success: true,
      message: "Gemini API is working!",
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
