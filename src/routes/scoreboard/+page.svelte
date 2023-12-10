<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { base } from '$app/paths';

    onMount(() => {
        goto(base + "/scoreboard/global");
    })
</script>