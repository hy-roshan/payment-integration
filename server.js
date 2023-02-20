require('dotenv').config(); // can use environment variables
const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');

const stripe = require('stripe')(process.env.STRIPE_KEY);

// to handle cors

app.use(cors({ origin: 'http://localhost:5500' }));

// Some data to checkout
const store = new Map([
  [1, { priceInCents: 10000, name: ' 100 days to learn Tamil' }],
  [2, { priceInCents: 20000, name: 'Master Node today' }],
]);

// Post request
app.post('/checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: req.body.items.map((item) => {
        const storeItem = store.get(item.id);
        return {
          price_data: {
            currency: 'inr',
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.CLIENT_URL}/client/success.html`,
      cancel_url: `${process.env.CLIENT_URL}`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
/// Setting up our server on port 3000
app.listen(3000, () => {
  console.log('listening on port 3000');
});
