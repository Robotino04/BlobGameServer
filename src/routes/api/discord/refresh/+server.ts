import { json } from '@sveltejs/kit';

const DISCORD_CLIENT_ID: string = import.meta.env.VITE_DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET: string = import.meta.env.VITE_DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI: string = import.meta.env.VITE_DISCORD_REDIRECT_URI;

export async function GET({ url, cookies }) {
  const discord_refresh_token = url.searchParams.get('code');
  if (!discord_refresh_token) {
    return json({ error: 'No refresh token found' }, { status: 500 });
  }

  // initializing data object to be pushed to Discord's token endpoint.
  // quite similar to what we set up in callback.js, expect with different grant_type.
  const dataObject = {
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: 'refresh_token',
    redirect_uri: DISCORD_REDIRECT_URI,
    refresh_token: discord_refresh_token,
    scope: 'identify email guilds'
  };

  // performing a Fetch request to Discord's token endpoint
  const request = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams(dataObject),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const response = await request.json();

  if (response.error) {
    return json({ error: response.error }, { status: 500 });
  }

  // redirect user to front page with cookies set
  const access_token_expires_in = new Date(Date.now() + response.expires_in); // 10 minutes
  const refresh_token_expires_in = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  cookies.set("discord_access_token", response.access_token, { expires: access_token_expires_in, path: "/" });
  cookies.set("discord_refresh_token", response.refresh_token, { expires: refresh_token_expires_in, path: "/" });
  return json({ discord_access_token: response.access_token })
}