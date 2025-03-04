import { error } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export class DiscordUserInfo {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
    public_flags: number;
    premium_type: number;
    flags: number;
    banner: unknown;
    accent_color: number;
    global_name: string;
    avatar_decoration_data: unknown;
    banner_color: string;
    mfa_enabled: boolean;
    locale: string;
    // email: string
    // verified: boolean;
}

export class  DiscordGuildMember{
    user: unknown;
    nick: string | null;
    // avatar: string | null;
    // roles: string[];
    // joined_at: string;
    // ...
};

export function isDiscordUserInfo(obj: any): obj is DiscordUserInfo {
    return typeof obj.id == "string" &&
        typeof obj.username == "string" &&
        (typeof obj.avatar == "string" || obj.avatar == null) &&
        typeof obj.discriminator == "string" &&
        typeof obj.public_flags == "number" &&
        typeof obj.premium_type == "number" &&
        typeof obj.flags == "number" &&
        // typeof obj.banner == "unknown" &&
        // typeof obj.accent_color == "number" &&
        typeof obj.global_name == "string" &&
        // typeof obj.avatar_decoration_data == "unknown" &&
        // typeof obj.banner_color == "string" &&
        typeof obj.mfa_enabled == "boolean" &&
        typeof obj.locale == "string";
        // typeof obj.email == "string" &&
        // typeof obj.verified == "boolean";
}
export function isDiscordGuildMember(obj: any): obj is DiscordGuildMember {
    return (typeof obj.nick == "string" || obj.nick == null);

}

export type DiscordTokenData = { access_token: string; refresh_token: string; error: number; expires_in: number };

export async function turnCodeToTokens(returnCode: string, apiEndpoint: string = env.VITE_DISCORD_REDIRECT_URI): Promise<DiscordTokenData> {
    const dataObject = {
        client_id: env.VITE_DISCORD_CLIENT_ID,
        client_secret: env.VITE_DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: apiEndpoint,
        code: returnCode!,
        scope: 'identify guilds.members.read'
    };

    // performing a Fetch request to Discord's token endpoint
    const request = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams(dataObject),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const response = await request.json();
    return response;
}

export async function getGuildMemberInfo(token: string, server_id: string): Promise<DiscordGuildMember>{
    // performing a Fetch request to Discord's token endpoint
    const request = await fetch(`https://discord.com/api/v10/users/@me/guilds/${server_id}/member`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const response = await request.json() as unknown;
    if (isDiscordGuildMember(response)){
        return response;
    }
    else{
        throw error(500, "Discord isn't telling me your username.");
    }
}
