<script lang="ts">
    import { base } from "$app/paths";
    import ListPageSelector from "./ListPageSelector.svelte";

    import ScoreboardEntry from "./ScoreboardEntry.svelte";

    export let gamemode: string;

    $: scoresPromise = (async (
        gamemode: string,
        baseEntry: number,
        numEntriesPerPage: number,
    ) => {
        const res = await fetch(
            `${base}/api/scores?n=${numEntriesPerPage}&o=${baseEntry}&gamemode=${gamemode.toLowerCase()}`,
        );
        const value = await res.json();

        return value;
    })(gamemode, baseEntry, numEntriesPerPage);

    export let baseEntry: number;
    export let numEntriesPerPage: number;
</script>

{#await scoresPromise}
    <p>Loading scores...</p>
{:then scores}
    <table>
        <tr>
            <th class="place">Place</th>
            <th class="player">Player</th>
            <th class="score">Score</th>
            <th class="gamemode">Gamemode</th>
        </tr>
        {#each scores.scores as entry}
            <ScoreboardEntry {entry} />
        {/each}
    </table>

    {#if scores.scores.length == 0}
        <p>
            Well, it looks like there are no submissions yet. Better start
            playing and getting that highscore!
        </p>
    {/if}
    <ListPageSelector
        bind:baseEntry
        numEntries={scores.num_scores}
        {numEntriesPerPage}
    />
{:catch error}
    <p style="color: red">Couldn't load scores ({error.message})</p>
{/await}

<style>
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }

    th {
        padding: 12px;
        text-align: left;
        background-color: var(--jam);
        color: #fff;
    }
    @media (prefers-color-scheme: dark) {
        table {
            color: #fff;
        }
    }
</style>
