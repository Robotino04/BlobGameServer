import { json } from '@sveltejs/kit';

import { env } from "$env/dynamic/private";

export async function POST({ url, request}) {
  var discord_refresh_token = request.headers.get("Authorization");
  if (!discord_refresh_token) {
    return json({ error: 'No refresh token found' }, { status: 400 });
  }
  discord_refresh_token = discord_refresh_token.split(" ")[1];

  // initializing data object to be pushed to Discord's token endpoint.
  // quite similar to what we set up in callback.js, expect with different grant_type.
  const dataObject = {
    client_id: env.VITE_DISCORD_CLIENT_ID,
    client_secret: env.VITE_DISCORD_CLIENT_SECRET,
    grant_type: 'refresh_token',
    redirect_uri: env.VITE_DISCORD_REDIRECT_URI,
    refresh_token: discord_refresh_token,
    scope: 'identify'
  };

  // performing a Fetch request to Discord's token endpoint
  const dc_request = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams(dataObject),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const response = await dc_request.json();

  if (response.error) {
    return json({ error: response.error }, { status: 500 });
  }

  return json({ discord_access_token: response.access_token })
}
