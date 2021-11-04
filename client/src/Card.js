import { useEffect, createRef } from "react";

const appId = "sandbox-sq0idb-qye2EIz2rpQMlGLZ4wQ6nQ";
const locationId = "LCHG32HK18R8J";

async function initializeCard(payments) {
  const card = await payments.card();
  await card.attach("#card-container");

  return card;
}

async function createPayment(token) {
  const body = JSON.stringify({
    locationId,
    sourceId: token,
  });

  const paymentResponse = await fetch("/payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  if (paymentResponse.ok) {
    return paymentResponse.json();
  }

  const errorBody = await paymentResponse.text();
  throw new Error(errorBody);
}

async function tokenize(paymentMethod) {
  const tokenResult = await paymentMethod.tokenize();
  if (tokenResult.status === "OK") {
    return tokenResult.token;
  } else {
    let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
    if (tokenResult.errors) {
      errorMessage += ` and errors: ${JSON.stringify(tokenResult.errors)}`;
    }

    throw new Error(errorMessage);
  }
}

// Checkpoint 2.
async function handlePaymentMethodSubmission(
  event,
  paymentMethod,
  cardButton,
  statusContainer
) {
  event.preventDefault();

  try {
    // disable the submit button as we await tokenization and make a payment request.
    cardButton.disabled = true;
    const token = await tokenize(paymentMethod);
    const paymentResults = await createPayment(token);
    displayPaymentResults(statusContainer, "SUCCESS");
    cardButton.disabled = false;

    console.debug("Payment Success", paymentResults);
  } catch (e) {
    cardButton.disabled = false;
    displayPaymentResults(statusContainer, "FAILURE");
    console.error(e.message);
    throw e;
  }
}

// status is either SUCCESS or FAILURE;
function displayPaymentResults(statusContainer, status) {
  if (status === "SUCCESS") {
    statusContainer.classList.remove("is-failure");
    statusContainer.classList.add("is-success");
  } else {
    statusContainer.classList.remove("is-success");
    statusContainer.classList.add("is-failure");
  }

  statusContainer.style.visibility = "visible";
}

const Card = ({ onPaymentSuccess }) => {
  // Use refs as dirty hack not gonna spend time migrating this example code to react states etc
  const cardButtonRef = createRef();
  const statusRef = createRef();

  useEffect(() => {
    async function run() {
      const statusContainer = statusRef.current;
      const cardButton = cardButtonRef.current;

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
        statusContainer.className = "missing-credentials";
        statusContainer.style.visibility = "visible";
        return;
      }

      // Init Card
      let card;
      try {
        card = await initializeCard(payments);
        card = await initializeCard(payments);
      } catch (e) {
        console.error("Initializing Card failed", e);
        return;
      }

      cardButton.addEventListener("click", async (event) => {
        await handlePaymentMethodSubmission(
          event,
          card,
          cardButton,
          statusContainer
        );
        onPaymentSuccess();
      });
    }

    cardButtonRef.current && statusRef.current && run();

    return () => {
      // payments.card().destroy();
      // TODO
    };
  }, [cardButtonRef, statusRef, onPaymentSuccess]);

  return (
    <>
      <form id="payment-form">
        <div id="card-container"></div>
        <button ref={cardButtonRef} id="card-button" type="button">
          Pay $1.00
        </button>
      </form>
      <div ref={statusRef} id="payment-status-container"></div>
    </>
  );
};

export { Card };
