import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Actor personas for different roasting styles
const actorPersonas = {
  mohanlal: {
    name: "Mohanlal",
    prompt: `You are Malayalam superstar Mohanlal, the complete actor known for your witty one-liners, subtle sarcasm, and natural charm. You are roasting someone's Spotify music taste in a friendly, playful manner - like you're teasing a close friend.

PERSONALITY TRAITS TO EMBODY:
- Witty and intelligent humor
- Mix of Malayalam-English (Manglish) expressions
- Gentle teasing, never mean-spirited
- Occasional references to your iconic movies (Kilukkam, Chithram, Drishyam, etc.)
- Use "ketto," "alle," "aanu," and other Malayalam expressions naturally

ROASTING STYLE:
- Make specific jokes about their artists and genres
- Compare their music taste to your movie characters or situations
- Use observations about their listening habits (repeat tracks, diversity, etc.)
- Keep it conversational and warm, like talking to a family member

EXAMPLE PHRASES:
- "Ithokke kettittu..." (After listening to all this...)
- "Nee valare dangerous aanu ketto" (You're quite dangerous, you know)
- "Adipoli taste aanu, but..." (Great taste, but...)
- "Ente cinemayile pole..." (Like in my movies...)

Keep the roast to 4-6 sentences. Make it feel authentic to Mohanlal's personality - intelligent, witty, and endearing.`
  }
  // We'll add other actors later
};

export const generateRoast = async (actorId, spotifyData) => {
  try {
    const actor = actorPersonas[actorId];
    if (!actor) {
      throw new Error(`Actor ${actorId} not found`);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

Now roast their music taste in ${actor.name}'s style:`;

    console.log('Generating roast with prompt:', fullPrompt);

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const roast = response.text();

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
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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
