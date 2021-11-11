<script>
  import { getCatelog } from "./Catelog";
  import CatelogList from "./CatelogList.svelte";
  import Cart from "./Cart.svelte";

  const request = getCatelog();
  let selectedItems = [];
  const onItemClicked = (selectedItem) => {
    if (
      selectedItem &&
      !selectedItems.find((item) => item.id === selectedItem.id)
    ) {
      selectedItems = [...selectedItems, selectedItem];
    }
  };

  const onClearCart = () => {
    selectedItems = [];
  };
</script>

<div class="App">
  <header class="App-header">
    <img
      src="https://svelte.dev/svelte-logo-horizontal.svg"
      class="App-logo"
      alt="logo"
    />
  </header>
  <div class="main">
    {#await request}
      <p>Loading...</p>
    {:then catelog}
      <div class="content">
        <div class="list-container">
          <CatelogList {onItemClicked} items={catelog.objects} />
        </div>
        <Cart items={selectedItems} {onClearCart} />
      </div>
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  </div>
</div>
