import { ScoreboardEntry, isValidJSONForScoreboardEntry } from '$lib/ScoreboardEntry.js';
import { error } from '@sveltejs/kit';
import { getSession } from '../hooks.js';

export async function load({ url, cookies, fetch, depends }) {
    if (!url.searchParams.has("n")) {
        url.searchParams.set("n", "30");
    }
    let scoreApiEndpoint = "/api/scores?" + url.searchParams.toString();

    depends("data:scores");

    let data = await (await fetch(scoreApiEndpoint, {
        method: "GET",
    })).json();

    if (!("scores" in data) || !("num_scores" in data) || (data.scores.length != 0 && isValidJSONForScoreboardEntry(data.scores[0]))) {
        throw error(400, "Invalid data layout.");
    }
    let typed_data: ScoreboardEntry[] = data.scores;

    return {
        scores: typed_data,
        num_scores: data.num_scores,
        user: await getSession(cookies),
    };
}