<script>
    import { onMount } from "svelte";
    import ReloadButton from "./ReloadButton.svelte";
    import { scores, sortedScores } from "./stores";
    import { page } from "$app/stores";
    import ScoreboardEntry from "./ScoreboardEntry.svelte";

    async function loadData() {
        const response = await fetch($page.url.origin + "/api/scores", {
            method: "GET",
        });
        const data = await response.json();
        scores.set(data.scores);
    }

    onMount(loadData);
    setInterval(loadData, 5000);
</script>

<main>
    <table>
        <tr>
            <th>Place</th>
            <th>Player</th>
            <th>Score</th>
        </tr>
        {#each $sortedScores as score, index}
            <ScoreboardEntry {score} place={index + 1} />
        {/each}
    </table>
    {#if $scores.length == 0}
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
