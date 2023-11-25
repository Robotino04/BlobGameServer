import { ScoreboardEntry, isValidJSONForScoreboardEntry } from '$lib/ScoreboardEntry.js';
import { error } from '@sveltejs/kit';

export async function load(event) {
	let data = await (await event.fetch("/api/scores", {
        method: "GET",
    })).json();

    if (!("scores" in data) || (data.scores.length != 0 && isValidJSONForScoreboardEntry(data.scores[0]))){
        throw error(400, "Invalid data layout.");
    }
    let typed_data: ScoreboardEntry[] = data.scores;


    return {
        scores: typed_data,
        sorted_scores: [...typed_data].sort((e1, e2) => e2.score - e1.score)
    }
}