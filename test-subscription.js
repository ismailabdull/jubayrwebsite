// Test script for monthly recurring payments
async function testSubscription() {
  console.log('🧪 Testing Monthly Subscription...\n');
  
  try {
    // Create a subscription
    const response = await fetch('http://localhost:4242/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 25,
        email: 'test@example.com'
      })
    });
    
    const result = await response.json();
    console.log('✅ Subscription created:');
    console.log('   Subscription ID:', result.subscriptionId);
    console.log('   Customer ID:', result.customerId);
    console.log('   Client Secret:', result.clientSecret.substring(0, 20) + '...');
    
    console.log('\n📋 To verify in Stripe Dashboard:');
    console.log('   1. Go to: https://dashboard.stripe.com/subscriptions');
    console.log('   2. Look for subscription ID:', result.subscriptionId);
    console.log('   3. Status should be "Incomplete" (before payment) or "Active" (after payment)');
    console.log('   4. Customer email: test@example.com');
    console.log('   5. Amount: $25.00/month');
    
    console.log('\n🌐 To test complete payment flow:');
    console.log('   Go to: http://localhost:4242/donate.html');
    console.log('   Select "Monthly Donation" tab');
    console.log('   Use test card: 4242424242424242');
    console.log('   After payment, check server logs for "MONTHLY PAYMENT SUCCEEDED"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testSubscription(); 