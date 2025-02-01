import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

const DISCORD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${env.VITE_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.VITE_DISCORD_REDIRECT_URI)}&response_type=code&scope=identify`;

export async function GET({ url }) {
    throw redirect(302, DISCORD_ENDPOINT);
}
