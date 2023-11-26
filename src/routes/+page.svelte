<script lang="ts">
    import { onMount } from "svelte";
    import ReloadButton from "./ReloadButton.svelte";
    import ScoreboardEntry from "./ScoreboardEntry.svelte";
    import { invalidate } from "$app/navigation";
    import type { PageData } from "./$types";
    import ListPageSelector from "./ListPageSelector.svelte";
    import { page } from "$app/stores";

    onMount(() => {
		const interval = setInterval(() => {
			invalidate("data:scores");
		}, 5000);

		return () => {
			clearInterval(interval);
		};
	});
	
	export let data: PageData;

    let baseEntry: number = parseInt($page.url.searchParams.get("o")??"0");
</script>

<main>
    <table>
        <tr>
            <th class="place">Place</th>
            <th class="player">Player</th>
            <th class="score">Score</th>
        </tr>
        {#each data.scores as score, index}
            <ScoreboardEntry {score} place={index + 1 + baseEntry} />
        {/each}
    </table>
    {#if data.scores.length == 0}
        <p>Well, it looks like there are no submissions yet. Better start playing and get that highscore!</p>
    {/if}
    <ListPageSelector bind:baseEntry={baseEntry} numEntries={data.num_scores} numEntriesPerPage={parseInt($page.url.searchParams.get("n")??"10")}/>
    <ReloadButton />
</main>

<style>
    main {
        display: flex;
        flex-wrap:wrap; 
        flex-direction: column;
        align-items: center;
        font-size: 2rem;
    }
    table {
        text-align: left;
        border-style: solid;
        border-radius: 10px;
        border-width: 1px;
        border-color: black;
    }
    .place{
        min-width: 80px;
    }
    .player{
        min-width: 200px;
    }
    .score{
        min-width: 80px;
    }

    th{
        padding-right: 10px;
    }
</style>
