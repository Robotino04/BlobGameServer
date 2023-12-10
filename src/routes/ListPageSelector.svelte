<script lang="ts">
    import { page } from "$app/stores";

    export let baseEntry: number;
    export let numEntries: number;
    export let numEntriesPerPage: number;

    function clampToPages(newBase: number){
        newBase = Math.floor(newBase/numEntriesPerPage) * numEntriesPerPage;
        newBase = Math.min(Math.max(newBase, 0), Math.floor(numEntries/numEntriesPerPage)*numEntriesPerPage);
        return newBase;
    }

    async function setBaseEntry(newBase: number){
        newBase = clampToPages(newBase);
        $page.url.searchParams.set("o", newBase.toString());
        window.history.replaceState({}, "", $page.url.toString());
        baseEntry = newBase;
    }
</script>


<div class="container">
    <button on:click={() => {
        setBaseEntry(0);
    }}>&LeftAngleBracket;&LeftAngleBracket;</button>
    <button on:click={() => {
        setBaseEntry(baseEntry - numEntriesPerPage);
    }}>&LeftAngleBracket;</button>
    <div>{baseEntry / numEntriesPerPage + 1} / {Math.floor(numEntries / numEntriesPerPage)+1}</div>
    <button on:click={() => {
        setBaseEntry(baseEntry + numEntriesPerPage);
    }}>&RightAngleBracket;</button>
    <button on:click={() => {
        setBaseEntry(numEntries);
    }}>&RightAngleBracket;&RightAngleBracket;</button>
</div>

<style>
    div.container{
        display: flex;
        flex-direction: row;
    }
</style>