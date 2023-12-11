<script lang="ts">
    import { page } from "$app/stores";
    import Scoreboard from "../../Scoreboard.svelte";
    import { titleCase } from "$lib/stringUtils";

    export let data;

    if ($page.url.searchParams.get("n") === null) {
        $page.url.searchParams.set("n", "30");
    }
</script>

<main>
    <h1>{titleCase(data.gamemode)}</h1>
    <Scoreboard
        baseEntry={parseInt($page.url.searchParams.get("o") ?? "0")}
        numEntriesPerPage={parseInt($page.url.searchParams.get("n") ?? "30")}
        gamemode={data.gamemode}
    />
</main>

<style>
    main {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        align-items: center;
        font-size: 2rem;
        margin-top: 20px;
    }

    main h1 {
        color: var(--jam);
    }
</style>
