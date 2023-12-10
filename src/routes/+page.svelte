<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import { base } from "$app/paths";

    export let data: PageData;

    onMount(() => {
        goto(base + "/scoreboard/");
    });
</script>

{#if data.user === null}
    <a title="Discord OAuth2" href="{base}/api/discord/auth"
        >Authenticate via Discord</a
    >
{:else}
    <img
        alt="{data.user.global_name} avatar"
        src="https://cdn.discordapp.com/avatars/{data.user.id}/{data.user
            .avatar}.png"
    />
    <h1>{data.user.global_name}</h1>
    <a title="Sign out" href="{base}/api/discord/signout">Sign Out</a>
{/if}
