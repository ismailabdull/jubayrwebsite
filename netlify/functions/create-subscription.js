const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { amount, currency = 'usd', email } = JSON.parse(event.body);

    console.log('🔄 Creating subscription:', {
      amount: amount,
      currency: currency,
      email: email
    });

    // Validate amount
    if (!amount || amount < 1) {
      console.log('❌ Invalid amount:', amount);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid amount. Amount must be at least $1.00' 
        })
      };
    }

    // Convert amount to cents (Stripe expects amounts in cents)
    const amountInCents = Math.round(parseFloat(amount) * 100);

    // Create a product and price for the subscription
    const product = await stripe.products.create({
      name: 'Monthly Donation to Jubayr Learning Center',
      description: 'Monthly recurring donation to support educational programs',
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amountInCents,
      currency: currency,
      recurring: {
        interval: 'month',
      },
    });

    // Create a customer
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        donation_type: 'monthly',
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        donation_type: 'monthly',
        donor_email: email,
      },
    });

    console.log('✅ Subscription created successfully:', {
      id: subscription.id,
      customerId: customer.id,
      amount: amountInCents,
      status: subscription.status
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        customerId: customer.id,
      })
    };
  } catch (error) {
    console.error('❌ Error creating subscription:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create subscription',
        details: error.message 
      })
    };
  }
}; 