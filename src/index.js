const cors = require("cors");
const express = require("express");
const stripe = require("stripe")(
  "sk_test_51K6xJJSFUjObRNHM5fXA2bwkQzV7aLwsTcG2D2RN3Se4N3LWRZRV0NAPzhUbxV09l0ji9xi1ff7CZeAg09aneioU005f3jMFmZ"
);

const uuid = require("uuid/v4");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome Pradheep!");
});

app.post("/checkout", async (req, res) => {
  console.log("Request:", req.body);

  let error;
  let status;
  try {
    const { token, product } = req.body;

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id
    });

    const idempotency_key = uuid();
    const charge = await stripe.charges.create(
      {
        amount: product.price,
        currency: "inr",
        customer: customer.id,
        receipt_email: token.email,
        description: `Purchased successfully`,
        shipping: {
          name: token.card.name,
          address: {
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            city: token.card.address_city,
            country: token.card.address_country,
            postal_code: token.card.address_zip
          }
        }
      },
      {
        idempotency_key
      }
    );
    console.log("Charge:", { charge });
    status = "success";
  } catch (error) {
    console.error("Error:", error);
    status = "error";
  }
  res.json({ error, status });
});

app.listen(8080);
