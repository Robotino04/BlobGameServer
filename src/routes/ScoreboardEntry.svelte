<script lang="ts">
    import type { ScoreboardEntry } from "$lib/ScoreboardEntry";

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
</tr>

<style>
    .place{
        text-align: right;
        padding-right: 10px;
    }

    .place_1{
        color: #ffd700
    }

    .place_2{
        color: #d2dee6
    }

    .place_3{
        color: #88540b
    }
</style>
