import { turnCodeToTokens, type DiscordTokenData } from '$lib/discordAuth.js';
import { json, redirect } from '@sveltejs/kit';
import { onMount } from 'svelte';

const DISCORD_REDIRECT_URI: string = import.meta.env.VITE_DISCORD_REDIRECT_URI_GAME;
const EXCHANGE_TOKEN_EXPIRE_TIME_MS = 5 * 60 * 1000; // 5 minutes

let exchanging_tokens: Map<string, {tokens: DiscordTokenData | null, request_time: Date}> = new Map;

function clearExpiredExchangeTokens(){
    const current_time = new Date().getTime();
    const startingTokenCount = exchanging_tokens.size;
    
    for (let token of exchanging_tokens.keys()){
        if (!exchanging_tokens.has(token)) continue;

        const time_since_request = current_time - exchanging_tokens.get(token)!.request_time.getTime();
        if (time_since_request > EXCHANGE_TOKEN_EXPIRE_TIME_MS){
            exchanging_tokens.delete(token);
            console.log(`Deleting exchange token ${token}`);
        }
    }
    const endingTokenCount = exchanging_tokens.size;

    console.log(`Exchange tokens: ${startingTokenCount} ->  ${endingTokenCount}`);
}

setInterval(clearExpiredExchangeTokens, EXCHANGE_TOKEN_EXPIRE_TIME_MS/2);


export async function GET({ url, request, cookies }) {
    const returnCode = url.searchParams.get('code');

    if (returnCode === null) {
        const exchange_token = crypto.randomUUID();
        exchanging_tokens.set(exchange_token, {tokens: null, request_time: new Date()});

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
            exchanging_tokens.set(exchange_token, {tokens, request_time: new Date()});
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
    const exchange_token = url.searchParams.get("exchange_token");
    if (exchange_token === null){
        return new Response(null, { status: 400 });
    }

    const exchange_data = exchanging_tokens.get(exchange_token);
    if (exchange_data === undefined) {
        return new Response(null, { status: 404 });
    }
    const {tokens, request_time} = exchange_data;
    if (tokens === null) {
        return new Response(null, { status: 202 });
    }

    exchanging_tokens.delete(exchange_token);

    return json(tokens);
}