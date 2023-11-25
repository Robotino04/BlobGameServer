import type { ScoreboardEntry } from '$lib/ScoreboardEntry';
import { derived, writable } from 'svelte/store';

export const scores = writable([] as ScoreboardEntry[]);
export const sortedScores = derived(scores, (ss) => {
    if (!(Symbol.iterator in Object(ss))) {
        return [];
    }
    return [...ss].sort((e1, e2) => e2.score - e1.score);
})