<script lang="ts">
    import { onMount } from "svelte";
    import ReloadButton from "./ReloadButton.svelte";
    import ScoreboardEntry from "./ScoreboardEntry.svelte";
    import { invalidate } from "$app/navigation";
    import type { PageData } from "./$types";

    onMount(() => {
		const interval = setInterval(() => {
			invalidate('/api/scores');
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
	
	export let data: PageData;
</script>

<main>
    <table>
        <tr>
            <th>Place</th>
            <th>Player</th>
            <th>Score</th>
        </tr>
        {#each data.sorted_scores as score, index}
            <ScoreboardEntry {score} place={index + 1} />
        {/each}
    </table>
    {#if data.scores.length == 0}
        <p>Well, it looks like there are no submissions yet. Better start playing and get that highscore!</p>
    {/if}
    <ReloadButton />
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 2rem;
    }
    table {
        text-align: left;
    }

    th{
        padding-right: 10px;
    }
</style>
