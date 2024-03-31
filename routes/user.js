const express = require("express");
const stripe = require("stripe")(
  "sk_test_51P0K3SHe4ovlRKMQsfG6yY2nFAY0YUtu7a1SnFSlV9ax78ShFBCtqgi3V5W05JATcGngqQsvnAa1qJDiRnACDHEQ00vT3baCrh"
);

const User = require("../models/user");

const router = express.Router();

async function createStripeCustomer(name, email) {
  try {
    const customer = await stripe.customers.create({
      email: email,
      name: name,
    });
    return customer.id;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw error;
  }
}

router.get("/", async (req, res, next) => {
  const customers = await User.find();
  return res.send(customers);
});

router.post("/signup", async (req, res, next) => {
  const { name, email } = req.body;
  console.log(name, email);
  if (name === undefined || email === undefined) {
    return res.status(400).send("bad request");
  }

  const stripeCustomerId = await createStripeCustomer(name, email);

  const user = await User.create({
    name,
    email,
    stripeCustomerId: stripeCustomerId,
    balance: 0,
  });

  return res.send(user);
});

router.post("/deposit", async (req, res, next) => {
  const { amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Deposit to Wallet",
            },
            unit_amount: amount * 100, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://" + process.env.RENDER_EXTERNAL_HOSTNAME, // Update with your success URL
      cancel_url: "https://" + process.env.RENDER_EXTERNAL_HOSTNAME, // Update with your cancel URL
      customer: "cus_Pq5P8zKA6ScRkK", // Associate with the Stripe customer
    });

    return res.send(session.url);
  } catch (error) {
    console.log(process.env.RENDER_EXTERNAL_HOSTNAME);
    console.error("Error creating Checkout session:", error);
    return res.status(500).json({ error: "Failed to create Checkout session" });
  }
});

// Route for handling successful payment webhook
router.post("/webhook", async (req, res) => {
  const event = req.body;

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Here, you can extract relevant information from the session object
      const customerId = session.customer;
      const amountPaid = session.amount_total;

      console.log("customerId", customerId);
      console.log("amountPaid", amountPaid);

      // Update your database to reflect the successful payment
      // For example, update the user's wallet balance
      // You might have a User model and update the balance for the customerId
      // This is just a general example, modify it based on your database structure
      const user = await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        { $inc: { balance: amountPaid / 100 } }, // Increment the balance by the amount paid
        { new: true }
      );

      console.log(user);

      console.log("Wallet balance updated:", user);

      // Respond with a 200 OK to acknowledge receipt of the webhook
      res.status(200).send("Webhook Received: Payment Successful");
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).send("Webhook Error");
  }
});

router.post("/withdraw", async (req, res, next) => {
  const amount = req.body.amount;

  try {
    const transfer = await stripe.transfers.create({
      amount: amount * 100, // Amount in cents
      currency: "usd",
      destination: "cus_Pq5P8zKA6ScRkK", // The Stripe Customer ID (connected account)
      transfer_group: "dynamic_withdrawal", // Optional transfer group to tie transfers together
    });

    return res.send(transfer);
  } catch (error) {
    console.error("Error creating transfer:", error);
    return res.send(error);
  }
});

module.exports = router;
