<script>
  import { formatIntToUSD } from "./Utils";

  // TODO: Dirty hack to not upload an image. If time permits then upload
  const catelogItemImageMap = new Map([
    [
      "2VWDQBWU5MTGHHXEJJKVSRMB",
      "https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v4513665367241151130/products/79128.01.xmas.png&height=940&width=940&quality=0.8&outputFormat=JPEG",
    ],
    [
      "LA7JLPQCYIOEX6H4JYIP7I2J",
      "https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v6094482156140772220/products/83851.main.png&height=940&width=940&quality=0.8&outputFormat=JPEG",
    ],
    [
      "EY7GSDQR3YTT3WGYF4ONSLGW",
      "https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v3919668293474871955/products/64021.01.png&height=940&width=940&quality=0.8&outputFormat=JPEG",
    ],
    [
      "HYTZOZZKS627DNV4RZ2IKO6S",
      "https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v3586934744430991263/products/76650.01.png&height=940&width=940&quality=0.8&outputFormat=JPEG",
    ],
    [
      "SAIY2JRANQ36GFOFOVZSHEPE",
      "https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v4513665367241151130/products/79128.01.xmas.png&height=940&width=940&quality=0.8&outputFormat=JPEG",
    ],
    [
      "XTUOCKFGBR42S5W7VLYX4SLE",
      "https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v6094482156140772220/products/83851.main.png&height=940&width=940&quality=0.8&outputFormat=JPEG",
    ],
    [
      "HIFNMJZMC6OSJBR5MOOJXHGN",
      "https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v8025209435824385631/products/78862..02.png&height=940&width=940&quality=0.8&outputFormat=JPEG",
    ],
    [
      "R6PGZUNDVSRYJVBCA76ZAGP5",
      "https://www.vermontcountrystore.com/ccstore/v1/images/?source=/file/v6545877172631681355/products/72406.01.png&height=940&width=940&quality=0.8&outputFormat=JPEG",
    ],
  ]);

  const toImageSrc = (key) => catelogItemImageMap.get(key);

  export let onItemClicked = () => {};
  export let variations = [];
</script>

{#if variations.length}
  {#each variations as variation}
    <div class="item-variant">
      <img alt="item" src={toImageSrc(variation.item_variation_data.item_id)} />
      <div class="name">{variation.item_variation_data.name}</div>
      <div class="price">
        {formatIntToUSD(variation.item_variation_data.price_money.amount)}
      </div>
      <button
        on:click={() => onItemClicked(variation)}
        type="button"
        class="add"
      >
        Add To Cart
      </button>
    </div>
  {/each}
{:else}
  No items found
{/if}
