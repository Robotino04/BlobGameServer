<script lang="ts">
    import { page } from "$app/stores";
    import Scoreboard from "../../Scoreboard.svelte";
    import { titleCase } from "$lib/stringUtils";

    export let data;

    if ($page.url.searchParams.get("n") === null) {
        $page.url.searchParams.set("n", "30");
    }
</script>

<h1>{titleCase(data.gamemode)}</h1>
<div class="sb">
    <Scoreboard
        baseEntry={parseInt($page.url.searchParams.get("o") ?? "0")}
        numEntriesPerPage={parseInt($page.url.searchParams.get("n") ?? "30")}
        gamemode={data.gamemode}
    />
</div>

<style>
    .sb {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        align-items: center;
        margin-top: 20px;
        width: 100%;
    }

    h1 {
        color: var(--jam);
        margin-bottom: 0;
        margin: auto;
    }

</style>
