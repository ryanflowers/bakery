<script>
  export let amount = 0;
  import { formatIntToUSD } from "./Utils";
  import { createPayment } from "./Payment";
  import { onMount } from "svelte";

  const appId = "sandbox-sq0idb-qye2EIz2rpQMlGLZ4wQ6nQ";
  const locationId = "LCHG32HK18R8J";

  let cardButton = null;
  let cardStatus = null;
  let card = null;

  async function initializeCard(payments) {
    const card = await payments.card();
    // Note a fan of this. Attach should take a reference to an element not pay query for me
    await card.attach("#card-container");

    return card;
  }

  async function handlePaymentMethodSubmission(event) {
    event.preventDefault();

    try {
      // disable the submit button as we await tokenization and make a payment request.
      cardButton.disabled = true;
      const paymentResults = await createPayment(card);
      displayPaymentResults(cardStatus, "SUCCESS");
      cardButton.disabled = false;

      console.debug("Payment Success", paymentResults);
    } catch (e) {
      cardButton.disabled = false;
      displayPaymentResults(cardStatus, "FAILURE");
      console.error(e.message);
      throw e;
    }
  }

  // status is either SUCCESS or FAILURE;
  function displayPaymentResults(cardStatus, status) {
    if (status === "SUCCESS") {
      cardStatus.classList.remove("is-failure");
      cardStatus.classList.add("is-success");
    } else {
      cardState;
      cardStatus.classList.remove("is-success");
      cardStatus.classList.add("is-failure");
    }

    cardStatus.style.visibility = "visible";
  }

  onMount(async () => {
    if (!window.Square) {
      // Set state
      console.error("Square.js failed to load properly");
      return;
    }

    // Show the card
    let payments;

    try {
      payments = window.Square.payments(appId, locationId);
    } catch (e) {
      cardStatus.className = "missing-credentials";
      cardStatus.style.visibility = "visible";
      return;
    }

    try {
      card = await initializeCard(payments);
    } catch (e) {
      console.error("Initializing Card failed", e);
      return;
    }
  });
</script>

<form id="payment-form">
  <div id="card-container" />
  <button
    bind:this={cardButton}
    on:click={handlePaymentMethodSubmission}
    id="card-button"
    type="button"
  >
    Pay
    {formatIntToUSD(amount)}
  </button>
</form>
<div bind:this={cardStatus} id="payment-status-container" />
