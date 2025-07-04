require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Debug: Check if environment variables are loaded
console.log('🔧 Environment check:');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'LOADED' : 'MISSING');
console.log('STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY ? 'LOADED' : 'MISSING');
console.log('PORT:', process.env.PORT || 'DEFAULT (4242)');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files from the root directory
app.use(express.static('.'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Stripe publishable key endpoint
app.get('/stripe-key', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Thank you page endpoint
app.get('/thank-you', (req, res) => {
  console.log('🎉 Thank you page accessed with params:', req.query);
  res.sendFile(__dirname + '/thank-you.html');
});

// Test payment page endpoint
app.get('/test-payment', (req, res) => {
  console.log('🧪 Test payment page accessed');
  res.sendFile(__dirname + '/test-payment.html');
});

// Test donation page endpoint
app.get('/test-donation', (req, res) => {
  console.log('🧪 Test donation page accessed');
  res.sendFile(__dirname + '/test-donation.html');
});

// Create Payment Intent endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', paymentMethodType = 'card' } = req.body;

    console.log('💳 Creating payment intent:', {
      amount: amount,
      currency: currency,
      donationType: req.body.donationType,
      email: req.body.email
    });

    // Validate amount
    if (!amount || amount < 1) {
      console.log('❌ Invalid amount:', amount);
      return res.status(400).json({ 
        error: 'Invalid amount. Amount must be at least $1.00' 
      });
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
        donation_type: req.body.donationType || 'one-time',
        donor_email: req.body.email || '',
      },
    });

    console.log('✅ Payment intent created successfully:', {
      id: paymentIntent.id,
      amount: amountInCents,
      status: paymentIntent.status
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error.message 
    });
  }
});

// Create Subscription endpoint for monthly recurring payments
app.post('/create-subscription', async (req, res) => {
  try {
    const { amount, currency = 'usd', email } = req.body;

    console.log('🔄 Creating subscription:', {
      amount: amount,
      currency: currency,
      email: email
    });

    // Validate amount
    if (!amount || amount < 1) {
      console.log('❌ Invalid amount:', amount);
      return res.status(400).json({ 
        error: 'Invalid amount. Amount must be at least $1.00' 
      });
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

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      customerId: customer.id,
    });
  } catch (error) {
    console.error('❌ Error creating subscription:', error);
    res.status(500).json({ 
      error: 'Failed to create subscription',
      details: error.message 
    });
  }
});

// Handle successful payments
app.post('/payment-success', async (req, res) => {
  try {
    const { paymentIntentId, donationType, amount, email } = req.body;
    
    console.log('🎉 SUCCESSFUL DONATION RECEIVED!');
    console.log('💰 Amount:', amount);
    console.log('📧 Email:', email);
    console.log('🔄 Type:', donationType);
    console.log('🆔 Payment ID:', paymentIntentId);
    console.log('⏰ Time:', new Date().toISOString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Log successful donation
    console.log(`Successful ${donationType} donation: $${amount} from ${email}`);
    
    // Here you could save to database, send confirmation emails, etc.
    
    res.json({ 
      success: true, 
      message: 'Thank you for your donation!' 
    });
  } catch (error) {
    console.error('❌ Error processing payment success:', error);
    res.status(500).json({ 
      error: 'Failed to process payment success' 
    });
  }
});

// Customer Portal endpoint for subscription management
app.post('/create-portal-session', async (req, res) => {
  try {
    const { customerId } = req.body;

    console.log('🔗 Creating customer portal session for customer:', customerId);

    if (!customerId) {
      return res.status(400).json({ 
        error: 'Customer ID is required' 
      });
    }

    // Create a customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.protocol}://${req.get('host')}/donate.html`,
    });

    console.log('✅ Customer portal session created:', session.id);

    res.json({
      url: session.url
    });
  } catch (error) {
    console.error('❌ Error creating customer portal session:', error);
    res.status(500).json({ 
      error: 'Failed to create customer portal session',
      details: error.message 
    });
  }
});

// Get subscription details endpoint
app.post('/get-subscription-details', async (req, res) => {
  try {
    const { customerId } = req.body;

    console.log('📋 Getting subscription details for customer:', customerId);

    if (!customerId) {
      return res.status(400).json({ 
        error: 'Customer ID is required' 
      });
    }

    // Get customer details
    const customer = await stripe.customers.retrieve(customerId);
    
    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
      expand: ['data.items.data.price']
    });

    console.log('✅ Subscription details retrieved:', {
      customerId: customerId,
      subscriptionCount: subscriptions.data.length,
      hasActiveSubscription: subscriptions.data.length > 0
    });

    res.json({
      customer: customer,
      subscription: subscriptions.data[0] || null
    });
  } catch (error) {
    console.error('❌ Error getting subscription details:', error);
    res.status(500).json({ 
      error: 'Failed to get subscription details',
      details: error.message 
    });
  }
});

// Cancel subscription endpoint
app.post('/cancel-subscription', async (req, res) => {
  try {
    const { customerId, subscriptionId } = req.body;

    console.log('❌ Cancelling subscription:', {
      customerId: customerId,
      subscriptionId: subscriptionId
    });

    if (!subscriptionId) {
      return res.status(400).json({ 
        error: 'Subscription ID is required' 
      });
    }

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    console.log('✅ Subscription cancelled successfully:', {
      id: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });

    res.json({
      success: true,
      subscription: subscription
    });
  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      details: error.message 
    });
  }
});

// Webhook endpoint to handle Stripe events
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test');
  } catch (err) {
    console.log('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('🎉 PAYMENT SUCCEEDED VIA WEBHOOK!');
      console.log('💰 Amount:', paymentIntent.amount / 100);
      console.log('📧 Email:', paymentIntent.receipt_email);
      console.log('🆔 Payment ID:', paymentIntent.id);
      console.log('🔄 Type:', paymentIntent.metadata?.donation_type || 'unknown');
      console.log('⏰ Time:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('❌ PAYMENT FAILED VIA WEBHOOK:', failedPayment.id);
      break;
    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('🔄 SUBSCRIPTION CREATED VIA WEBHOOK!');
      console.log('🆔 Subscription ID:', subscription.id);
      console.log('👤 Customer ID:', subscription.customer);
      console.log('💰 Amount:', subscription.items.data[0].price.unit_amount / 100);
      console.log('⏰ Time:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Send welcome email with subscription management link
      if (subscription.status === 'active') {
        sendSubscriptionWelcomeEmail(subscription);
      }
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      if (invoice.subscription) {
        console.log('🔄 MONTHLY PAYMENT SUCCEEDED VIA WEBHOOK!');
        console.log('🆔 Subscription ID:', invoice.subscription);
        console.log('💰 Amount:', invoice.amount_paid / 100);
        console.log('📧 Email:', invoice.customer_email);
        console.log('⏰ Time:', new Date().toISOString());
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      if (failedInvoice.subscription) {
        console.log('❌ MONTHLY PAYMENT FAILED VIA WEBHOOK!');
        console.log('🆔 Subscription ID:', failedInvoice.subscription);
        console.log('💰 Amount:', failedInvoice.amount_due / 100);
        console.log('📧 Email:', failedInvoice.customer_email);
        console.log('⏰ Time:', new Date().toISOString());
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({received: true});
});

// Function to send subscription welcome email
async function sendSubscriptionWelcomeEmail(subscription) {
  try {
    // Get customer details
    const customer = await stripe.customers.retrieve(subscription.customer);
    const amount = (subscription.items.data[0].price.unit_amount / 100).toFixed(2);
    
    // Create management link
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:4242';
    const managementUrl = `${baseUrl}/manage-subscription.html?customer=${subscription.customer}`;
    
    console.log('📧 Sending subscription welcome email to:', customer.email);
    console.log('🔗 Management URL:', managementUrl);
    
    // In a real implementation, you would send an email here
    // For now, we'll just log the details
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 SUBSCRIPTION WELCOME EMAIL DETAILS:');
    console.log('To:', customer.email);
    console.log('Subject: Welcome to your monthly donation!');
    console.log('Amount: $' + amount + '/month');
    console.log('Management Link:', managementUrl);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // TODO: Integrate with your email service (SendGrid, Mailgun, etc.)
    // Example with a hypothetical email service:
    /*
    await emailService.send({
      to: customer.email,
      subject: 'Welcome to your monthly donation!',
      html: `
        <h2>Thank you for your monthly donation!</h2>
        <p>Your monthly donation of $${amount} has been set up successfully.</p>
        <p>You can manage your subscription anytime by clicking the link below:</p>
        <a href="${managementUrl}">Manage My Subscription</a>
        <p>Thank you for supporting Jubayr Learning Center!</p>
      `
    });
    */
    
  } catch (error) {
    console.error('❌ Error sending subscription welcome email:', error);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!' 
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📝 Health check: http://localhost:${port}/health`);
  console.log(`💳 Donation page: http://localhost:${port}/donate.html`);
  console.log(`🧪 Test payment page: http://localhost:${port}/test-payment.html`);
  console.log(`🧪 Test donation page: http://localhost:${port}/test-donation.html`);
  console.log(`🙏 Thank you page: http://localhost:${port}/thank-you.html`);
}); 