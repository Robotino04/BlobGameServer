<script>
    import { invalidate } from "$app/navigation";
</script>

<button
    on:click={() => {
        invalidate("data:scores");
    }}>Reload</button
>
