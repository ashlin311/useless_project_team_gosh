# Spotify OAuth Setup for Mollywoodify

## Steps to set up Spotify OAuth:

### 1. Create a Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the details:
   - **App Name**: Mollywoodify
   - **App Description**: Malayalam cinema music experience
5. Accept terms and create the app

### 2. Configure App Settings
1. In your app dashboard, click "Settings"
2. Add Redirect URIs:
   - `http://localhost:3000/callback` (for development)
   - Add your production URL when you deploy
3. Copy your **Client ID**

### 3. Update the Environment Variables
1. Open the `.env` file in the root of your React app
2. Replace `your_spotify_client_id_here` with your actual Client ID from step 2
3. Update the redirect URI if needed (default is `http://localhost:3000/callback`)
4. Make sure the REDIRECT_URI matches what you added in Spotify settings

### 4. Environment Variables
The app uses these environment variables:
- `REACT_APP_SPOTIFY_CLIENT_ID`: Your Spotify app's Client ID
- `REACT_APP_SPOTIFY_REDIRECT_URI`: The callback URL for OAuth

### 4. Environment Variables
The app uses these environment variables:
- `REACT_APP_SPOTIFY_CLIENT_ID`: Your Spotify app's Client ID
- `REACT_APP_SPOTIFY_REDIRECT_URI`: The callback URL for OAuth

### 5. Important Notes
- **Client Secret**: Keep this secret! Never expose it in frontend code
- **Redirect URI**: Must exactly match what's in your Spotify app settings
- **Scopes**: Current scopes allow reading user profile, top tracks, and playlists

### 6. Testing
1. Start your React app: `npm start`
2. Click "Login with Spotify"
3. You'll be redirected to Spotify for authorization
4. After approval, you'll be redirected back to your app

### Current Features
- ✅ OAuth login flow
- ✅ User profile display
- ✅ Token storage in localStorage
- ✅ Automatic token validation
- ✅ Logout functionality

### Next Steps
- Add music search functionality
- Implement playlist creation
- Add Malayalam movie soundtrack features
