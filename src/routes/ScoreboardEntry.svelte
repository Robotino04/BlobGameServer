<script lang="ts">
    import type { ScoreboardEntry } from "$lib/ScoreboardEntry";

    export let score: ScoreboardEntry;
    export let place: number;
</script>

<tr>
    {#if place == 1}
    <td class="place place_1">{place}.</td>
    {:else if place == 2}
    <td class="place place_2">{place}.</td>
    {:else if place == 3}
    <td class="place place_3">{place}.</td>
    {:else}
    <td class="place place_other">{place}.</td>
    {/if}

    <td class="player_name">{score.username}</td>
    <td class="score">{score.score}</td>
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
