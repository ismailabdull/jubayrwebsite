const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Debug: Check if environment variable is loaded
  console.log('🔑 Environment check:', {
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    keyLength: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0,
    keyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'NOT_FOUND'
  });

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { amount, currency = 'usd', donationType, email } = JSON.parse(event.body);

    console.log('💳 Creating payment intent:', {
      amount: amount,
      currency: currency,
      donationType: donationType,
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

    // Create PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency,
      // Exclude Klarna and other buy-now-pay-later services
      payment_method_types: ['card', 'link'],
      automatic_payment_methods: {
        enabled: false,
      },
      metadata: {
        donation_type: donationType || 'one-time',
        donor_email: email || '',
      },
    });

    console.log('✅ Payment intent created successfully:', {
      id: paymentIntent.id,
      amount: amountInCents,
      status: paymentIntent.status
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      })
    };
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create payment intent',
        details: error.message 
      })
    };
  }
}; 