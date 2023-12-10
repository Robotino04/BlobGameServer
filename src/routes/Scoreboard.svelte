<script lang="ts">
    import { base } from "$app/paths";
    import ListPageSelector from "./ListPageSelector.svelte";
    import ReloadButton from "./ReloadButton.svelte";

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
<ReloadButton bind:updateValue={gamemode} />

<style>
    table {
        text-align: left;
        border-style: solid;
        border-radius: 10px;
        border-width: 1px;
        border-color: black;
    }
    .place {
        min-width: 80px;
    }
    .player {
        min-width: 200px;
    }
    .score {
        min-width: 80px;
    }

    th {
        padding-right: 10px;
    }
</style>
