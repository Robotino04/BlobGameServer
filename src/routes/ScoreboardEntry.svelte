<script lang="ts">
    export let score: ScoreboardEntry;
    export let place: number;
</script>

<p>{place}. {score.playername} ({score.score} pts.)</p>
