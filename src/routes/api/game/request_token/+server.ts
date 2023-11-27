import { turnCodeToTokens, type DiscordTokenData } from '$lib/discordAuth.js';
import { json, redirect } from '@sveltejs/kit';

const DISCORD_REDIRECT_URI: string = import.meta.env.VITE_DISCORD_REDIRECT_URI_GAME;

let exchanging_tokens: Map<string, DiscordTokenData | null> = new Map;

export async function GET({ url, request, cookies }) {
    const returnCode = url.searchParams.get('code');

    if (returnCode === null) {
        const exchange_token = crypto.randomUUID();
        exchanging_tokens.set(exchange_token, null);

        return json({
            exchange_token
        });
    }

    else {
        const exchange_token = url.searchParams.get('state')!;

        // discord return
        const tokens = await turnCodeToTokens(returnCode, DISCORD_REDIRECT_URI);

        // redirect to front page in case of error
        if (tokens.error) {
            return new Response(
                `<h1>Error.</h1><p>Something went wrong.</p><div>${tokens.error}</div>`,
                { headers: { 'Content-Type': 'text/html' } }
            );
        }

        if (exchanging_tokens.has(exchange_token)) {
            exchanging_tokens.set(exchange_token, tokens);
        }
        else {
            return new Response(
                `<h1>Error.</h1><p>Something went wrong.</p><div>No such exchange token exists.</div>`,
                { headers: { 'Content-Type': 'text/html' } }
            );
        }

        return new Response(
            "<h1>Login done.</h1><p>You may close this page now</p>",
            { headers: { 'Content-Type': 'text/html' } }
        );
    }
}

export async function POST({ url, request }) {
    const data = await request.json();
    if (data.exchange_token === undefined) {
        throw redirect(302, "/");
    }

    const tokens = exchanging_tokens.get(data.exchange_token);
    if (tokens === null) {
        return new Response(null, { status: 202 });
    }

    exchanging_tokens.delete(data.exchange_token);


    return json(tokens);
}