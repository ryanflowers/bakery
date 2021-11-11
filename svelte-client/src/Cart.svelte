<script>
  import Card from "./Card.svelte";
  import { createOrder } from "./Order";
  import { formatIntToUSD } from "./Utils";

  export let items = [];
  export let onClearCart = () => {};

  let onCheckout = async () => {
    const result = await createOrder(items);
    order = result.order;
    onClearCart();
  };

  let order = null;
</script>

<div class="cart">
  <div class="cart-container">
    <label>Cart</label>
    <div class="cart-list">
      {#if items.length > 0}
        <div class="cart-item">
          {#each items as item}
            <div>
              <span>{item.item_variation_data.name}</span>
              <span class="price">
                {formatIntToUSD(item.item_variation_data.price_money.amount)}
              </span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="summary">
          {#if order}
            <div class="summary-cotainer">
              <div class="total">
                Total:
                <span class="price">
                  {formatIntToUSD(order.total_money.amount)}
                </span>
              </div>
              <div class="order-info">
                OID:
                <span>{order.id}</span>
              </div>
            </div>
          {:else}
            <span>Cart is empty</span>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  {#if items.length > 0}
    <button on:click={onCheckout} type="button">Checkout</button>
  {/if}

  {#if order}
    <div>
      <Card amount={order.total_money.amount} />
    </div>
  {/if}
</div>
