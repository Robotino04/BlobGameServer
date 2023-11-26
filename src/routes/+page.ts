import { ScoreboardEntry, isValidJSONForScoreboardEntry } from '$lib/ScoreboardEntry.js';
import { error } from '@sveltejs/kit';

export async function load(event) {
    if (!event.url.searchParams.has("n")){
        event.url.searchParams.set("n", "30");
    }
    let scoreApiEndpoint = "/api/scores?" + event.url.searchParams.toString();

    event.depends("data:scores");

	let data = await (await event.fetch(scoreApiEndpoint, {
        method: "GET",
    })).json();

    if (!("scores" in data) || !("num_scores" in data) || (data.scores.length != 0 && isValidJSONForScoreboardEntry(data.scores[0]))){
        throw error(400, "Invalid data layout.");
    }
    let typed_data: ScoreboardEntry[] = data.scores;

    return {
        scores: typed_data,
        num_scores: data.num_scores
    };
}