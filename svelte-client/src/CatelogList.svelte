<script>
  import ItemVariationList from "./ItemVariationList.svelte";
  export let items = [];
  export let onItemClicked = () => {};
</script>

{#each items as item}
  <div class="list-item">
    <div class="name">{item.item_data.name}</div>
    <div>{item.item_data.description}</div>
    <br />
    <ItemVariationList {onItemClicked} variations={item.item_data.variations} />
  </div>
{/each}
