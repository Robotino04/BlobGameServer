<script>
    import { scores } from "./stores";
</script>

<button
    on:click={async () => {
        const response = await fetch("/api/scores", { method: "GET" });
        const data = await response.json();
        scores.set(data.scores);
    }}>Reload</button
>
