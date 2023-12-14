<script lang="ts">
    import { fade, fly, slide } from "svelte/transition";

    export let state: boolean;

    let is_visible: boolean = false;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<span
    on:mouseover={() => {
        is_visible = true;
    }}
    on:mouseleave={() => {
        is_visible = false;
    }}
    on:click={() => {
        state = !state;
    }}
    on:focus={() => {}}
    class="hovered"
>
    <slot name="hover" />
</span>

{#if is_visible}
    <p
        transition:fly={{
            duration: 200,
            x: -10,
            y: 0,
            opacity: 0,
        }}
        class="message"
    >
        {#if state}
            <slot name="on" />
        {:else}
            <slot name="off" />
        {/if}
    </p>
{:else}
    <p class="message message_hidden">█</p>
{/if}

<style>
    .message {
        white-space: nowrap;
        text-align: left;
        display: inline-block;
        z-index: 1;
        align-self: center;
    }
    .message_hidden{
        color: rgba(0, 0, 0, 0);
    }
    .hovered {
        z-index: 2;
        cursor: default;
        padding-left: 7px;
    }
</style>
