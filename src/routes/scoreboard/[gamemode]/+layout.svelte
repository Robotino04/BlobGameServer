<script lang="ts">
    import { allGamemodes } from "$lib/Gamemode";
    import { titleCase } from "$lib/stringUtils";
</script>

<nav class="header">
    <ol>
        <li><a href="/scoreboard/global">Global</a></li>
        {#each allGamemodes as gamemode}
            <li><a href="/scoreboard/{gamemode}/">{titleCase(gamemode)}</a></li>
        {/each}
    </ol>
</nav>
<slot />

<style>
    ol {
        list-style-type: none;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }
    li {
        margin-right: 20px;
    }
    .header {
        margin: auto;
        width: 50%;
        border: 3px solid green;
        padding: 10px;
    }
</style>
