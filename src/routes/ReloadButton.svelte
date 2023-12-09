<script lang="ts">
    import { invalidate } from "$app/navigation";

    export let updateValue: any;
</script>

<button
    on:click={() => {
        updateValue = updateValue;
    }}>Reload</button
>
