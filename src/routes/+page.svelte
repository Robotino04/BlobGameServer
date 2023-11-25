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
    <ol>
        {#each $sortedScores as score, index}
            <li><ScoreboardEntry {score} place={index+1} /></li>
        {/each}
    </ol>
    <ReloadButton />
</main>

<style>
    main{
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    ol{
        list-style-type: none;
    }
</style>