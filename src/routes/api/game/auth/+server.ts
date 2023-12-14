import { redirect } from "@sveltejs/kit";

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI_GAME;
const DISCORD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=guilds+identify+guilds.members.read`;

export async function GET({url}) {
	throw redirect(302, DISCORD_ENDPOINT + "&" + url.searchParams.toString());
}