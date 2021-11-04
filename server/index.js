// server/index.js

import { Client, Environment } from "square";
import express from "express";
import { SQUARE_ACCESS_TOKEN, LOCATION_ID } from "./config.js";

// micro provides http helpers
import { json, send } from "micro";
// async-retry will retry failed API requests
import retry from "async-retry";

// logger gives us insight into what's happening
// const logger = require('./server/logger');
// schema validates incoming requests
// const { validatePaymentPayload } = require("./server/schema");
// square provides the API client and error types
import { nanoid } from "nanoid";

const PORT = process.env.PORT || 3001;

const client = new Client({
  timeout: 3000,
  environment: Environment.Sandbox,
  accessToken: SQUARE_ACCESS_TOKEN,
});

const app = express();

/**
 * Api's
 **/
app.get("/api/catelog", async (req, res) => {
  const { catalogApi } = client;
  const list = await catalogApi.listCatalog();

  res.json({ message: list.body });
});

app.get("/api/transactions", async (req, res) => {
  const { transactionsApi } = client;
  const list = await transactionsApi.listTransactions(LOCATION_ID);

  res.json({ message: list.body });
});

app.get("/api", (req, res) => {
  res.json({ message: "Sorry sub path required!" });
});

/**
 * Payments
 **/
app.post("/payment", async (req, res) => {
  const payload = await json(req);
  //   logger.debug(JSON.stringify(payload));
  // We validate the payload for specific fields. You may disable this feature
  // if you would prefer to handle payload validation on your own.
  //   if (!validatePaymentPayload(payload)) {
  //     throw createError(400, "Bad Request");
  //   }

  await retry(async (bail) => {
    try {
      //   logger.debug("Creating payment", { attempt });

      const idempotencyKey = payload.idempotencyKey || nanoid();
      const payment = {
        idempotencyKey,
        locationId: payload.locationId,
        sourceId: payload.sourceId,
        // While it's tempting to pass this data from the client
        // Doing so allows bad actor to modify these values
        // Instead, leverage Orders to create an order on the server
        // and pass the Order ID to createPayment rather than raw amounts
        // See Orders documentation: https://developer.squareup.com/docs/orders-api/what-it-does
        amountMoney: {
          // the expected amount is in cents, meaning this is $1.00.
          amount: "100",
          // If you are a non-US account, you must change the currency to match the country in which
          // you are accepting the payment.
          currency: "USD",
        },
      };

      // VerificationDetails is part of Secure Card Authentication.
      // This part of the payload is highly recommended (and required for some countries)
      // for 'unauthenticated' payment methods like Cards.
      if (payload.verificationToken) {
        payment.verificationToken = payload.verificationToken;
      }

      const { result, statusCode } = await client.paymentsApi.createPayment(
        payment
      );

      //   logger.info("Payment succeeded!", { result, statusCode });

      // TODO: return payment ID here..

      send(res, statusCode, {
        success: true,
        payment: {
          id: result.payment.id,
          status: result.payment.status,
          receiptUrl: result.payment.receiptUrl,
          orderId: result.payment.orderId,
        },
      });
    } catch (ex) {
      //   if (ex instanceof ApiError) {
      // likely an error in the request. don't retry
      // logger.error(ex.errors);
      bail(ex);
      //   } else {
      //     // IDEA: send to error reporting service
      //     // logger.error(`Error creating payment on attempt ${attempt}: ${ex}`);
      //     throw ex; // to attempt retry
      //   }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
