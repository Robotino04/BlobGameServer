import { json } from '@sveltejs/kit';

const DISCORD_CLIENT_ID: string = import.meta.env.VITE_DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET: string = import.meta.env.VITE_DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI: string = import.meta.env.VITE_DISCORD_REDIRECT_URI;

export async function POST({ request }) {
  var discord_access_token = request.headers.get("Authorization");
  if (!discord_access_token) {
    return json({ error: 'No access token found' }, { status: 400 });
  }
  discord_access_token = discord_access_token.split(" ")[1];


  // initializing data object to be pushed to Discord's token endpoint.
  const dataObject = {
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    token: discord_access_token,
  };

  // performing a Fetch request to Discord's token endpoint
  const dc_request = await fetch('https://discord.com/api/oauth2/token/revoke', {
    method: 'POST',
    body: new URLSearchParams(dataObject),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const response = await dc_request.json();

  if (response.error) {
    return json({ error: response.error }, { status: 500 });
  }

  return new Response(null, { status: 200 });
}