import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

const DISCORD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${env.VITE_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.VITE_DISCORD_REDIRECT_URI_GAME)}&response_type=code&scope=guilds+identify+guilds.members.read`;

export async function GET({url}) {
	throw redirect(302, DISCORD_ENDPOINT + "&" + url.searchParams.toString());
}
