<script lang="ts">
    import { allGamemodes } from "$lib/Gamemode";
    import { titleCase } from "$lib/stringUtils";
    import { base } from "$app/paths";
</script>

<nav class="header">
    <ol>
        <li><a href="{base}/scoreboard/global">Global</a></li>
        {#each allGamemodes as gamemode}
            <li>
                <a href="{base}/scoreboard/{gamemode}/">{titleCase(gamemode)}</a
                >
            </li>
        {/each}
    </ol>
</nav>
<slot />

<style>
    nav.header {
        margin: auto;
        width: 80%;
        border: 3px solid #ffeecc; /* Light orange border */
        padding: 10px;
        background-color: #fff5e1; /* Creamy background */
        border-radius: 8px;
    }

    nav.header ol {
        display: flex;
        align-items: center;
        justify-content: center;
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    nav.header li {
        margin-right: 20px;
        font-size: 1.2rem;
    }

    nav.header a {
        text-decoration: none;
        color: #333;
        transition: color 0.3s;
    }

    nav.header a:hover {
        color: var(--jam);
    }
    @media (prefers-color-scheme: dark) {
        nav.header {
            border-color: #6c757d;
            background-color: #333;
        }

        nav.header a {
            color: #fff;
        }
    }
</style>
