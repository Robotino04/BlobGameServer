<script lang="ts">
    import type { ScoreboardEntry } from "$lib/ScoreboardEntry";
    import { titleCase } from "$lib/stringUtils";

    export let entry: ScoreboardEntry;
</script>

<tr>
    {#if entry.place <= 3}
        <td class={`place place_${entry.place}`}>{entry.place}.</td>
    {:else}
        <td class="place place_other">{entry.place}.</td>
    {/if}

    <td class="player_name">{entry.username}</td>
    <td class="score">{entry.score}</td>
    <td class="gamemode">{titleCase(entry.gamemode)}</td>
</tr>

<style>
    tr {
        /* display: flex; */
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: #fff;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .place {
        min-width: 40px;
        text-align: right;
        padding-right: 10px;
        font-weight: bold;
    }

    .place_1 {
        color: #ff3366; /* Jam color */
    }

    .place_2 {
        color: #ffd700; /* Gold for 2nd place */
    }

    .place_3 {
        color: #8b4513; /* Brown for 3rd place */
    }

    .player_name {
        min-width: 120px;
    }

    .score {
        min-width: 80px;
    }

    .gamemode {
        text-transform: capitalize;
    }
</style>
