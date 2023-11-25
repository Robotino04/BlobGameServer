<script>
    import { invalidate } from "$app/navigation";
</script>

<button
    on:click={async () => {
        invalidate('/api/scores');
    }}>Reload</button
>
