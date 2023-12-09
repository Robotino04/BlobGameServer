export class DiscordUserInfo {
    id: string;
    username: string;
    avatar: string;
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
    email: string
    verified: boolean;
}

export function isDiscordUserInfo(obj: any): obj is DiscordUserInfo {
    return typeof obj.id == "string" &&
        typeof obj.username == "string" &&
        typeof obj.avatar == "string" &&
        typeof obj.discriminator == "string" &&
        typeof obj.public_flags == "number" &&
        typeof obj.premium_type == "number" &&
        typeof obj.flags == "number" &&
        // typeof obj.banner == "unknown" &&
        typeof obj.accent_color == "number" &&
        typeof obj.global_name == "string" &&
        // typeof obj.avatar_decoration_data == "unknown" &&
        typeof obj.banner_color == "string" &&
        typeof obj.mfa_enabled == "boolean" &&
        typeof obj.locale == "string" &&
        typeof obj.email == "string" &&
        typeof obj.verified == "boolean";
}

const DISCORD_CLIENT_ID: string = import.meta.env.VITE_DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET: string = import.meta.env.VITE_DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI: string = import.meta.env.VITE_DISCORD_REDIRECT_URI;

export type DiscordTokenData = { access_token: string; refresh_token: string; error: number; expires_in: number };

export async function turnCodeToTokens(returnCode: string, apiEndpoint: string = DISCORD_REDIRECT_URI): Promise<DiscordTokenData> {
    const dataObject = {
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: apiEndpoint,
        code: returnCode!,
        scope: 'identify'
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
