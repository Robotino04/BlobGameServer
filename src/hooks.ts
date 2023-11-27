import { isDiscordUserInfo, DiscordUserInfo } from "$lib/discordAuth";
import type { Cookies } from "@sveltejs/kit";

const DISCORD_API_URL: string = import.meta.env.VITE_DISCORD_API_URL;
const HOST: string = import.meta.env.VITE_HOST;

export async function getSession(cookies: Cookies): Promise<DiscordUserInfo | null> {
    // if only refresh token is found, then access token has expired. perform a refresh on it.

    if (cookies.get("discord_refresh_token") && !cookies.get("discord_access_token")) {
        const discord_response = await (await fetch(`${HOST}/api/discord/refresh?code=${cookies.get("discord_refresh_token")}`)).json();

        if (discord_response.discord_access_token) {
            console.log('setting discord user via refresh token..')
            const request = await fetch(`${DISCORD_API_URL}/users/@me`, {
                headers: { 'Authorization': `Bearer ${discord_response.discord_access_token}` }
            });

            // returns a discord user if JWT was valid
            const response = await request.json();
            console.log(response);
            if (isDiscordUserInfo(response)) {
                return response;
            }
        }
    }

    if (cookies.get("discord_access_token")) {
        const request = await fetch(`${DISCORD_API_URL}/users/@me`, {
            headers: { 'Authorization': `Bearer ${cookies.get("discord_access_token")}` }
        });

        // returns a discord user if JWT was valid
        const response = await request.json();
        console.log(response);
        if (isDiscordUserInfo(response)) {
            return response;
        }
    }

    return null;
}