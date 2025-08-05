# LinkedIn OAuth Setup Guide

This guide will help you set up LinkedIn OAuth for your application.

## Prerequisites

1. A LinkedIn Developer Account
2. A LinkedIn App created in the LinkedIn Developer Console

## Step 1: Create a LinkedIn App

1. Go to [LinkedIn Developer Console](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill in the required information:
   - App name: Your app name
   - LinkedIn Page: Your company's LinkedIn page
   - App logo: Upload your app logo
4. Click "Create App"

## Step 2: Configure OAuth 2.0 Settings

1. In your LinkedIn app dashboard, go to "Auth" tab
2. Add the following redirect URLs:
   - `https://localhost:3000/auth/callback/linkedin` (for development)
   - `https://yourdomain.com/auth/callback/linkedin` (for production)
3. Request the following OAuth 2.0 scopes:
   - `openid` - Use your name and photo
   - `profile` - Use your name and photo
   - `w_member_social` - Create, modify, and delete posts, comments, and reactions on your behalf
   - `email` - Use the primary email address associated with your LinkedIn account

## Step 3: Get Your Credentials

1. In your LinkedIn app dashboard, go to "Auth" tab
2. Copy your **Client ID** and **Client Secret**
3. Add them to your `.env.local` file:

```env
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
```

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/dashboard/linkedin`
3. Click "Connect LinkedIn Account"
4. Complete the OAuth flow
5. You should be redirected back to your app with a connected LinkedIn account

## API Endpoints

The following API endpoints are available:

- `GET /api/auth/linkedin` - Initiates LinkedIn OAuth flow
- `POST /api/auth/linkedin/token` - Exchanges authorization code for access token
- `POST /api/auth/linkedin/profile` - Fetches user profile information
- `POST /api/auth/linkedin/refresh` - Refreshes access token

## Components

- `useLinkedInOAuth()` - Custom hook for managing LinkedIn OAuth state
- `LinkedInConnectionBanner` - Component for displaying connection status
- `/auth/callback/linkedin` - Callback page for handling OAuth response

## Security Notes

- Never expose your Client Secret in client-side code
- Always use HTTPS in production
- Store tokens securely (currently using localStorage for demo purposes)
- Implement proper token refresh logic
- Validate state parameter to prevent CSRF attacks

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Make sure the redirect URI in your LinkedIn app matches exactly
   - Check for trailing slashes or protocol mismatches

2. **"Invalid client" error**
   - Verify your Client ID and Client Secret are correct
   - Ensure your app is approved and active

3. **"Insufficient permissions" error**
   - Request the required scopes in your LinkedIn app: `openid`, `profile`, `w_member_social`, `email`
   - Make sure your app has been approved for the requested permissions
   - Note: Some scopes may require additional approval from LinkedIn

### Debug Mode

To enable debug logging, add this to your environment:

```env
DEBUG_LINKEDIN_OAUTH=true
```

## Production Deployment

For production deployment:

1. Update redirect URIs in LinkedIn app to use your production domain
2. Use environment variables for all sensitive configuration
3. Implement proper error handling and logging
4. Consider using a more secure token storage solution
5. Set up monitoring for OAuth flow failures 