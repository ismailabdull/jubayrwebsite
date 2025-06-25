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
    
    console.log('\n📋 To test with Stripe API directly, use:');
    console.log(`curl https://api.stripe.com/v1/subscriptions \\`);
    console.log(`  -u "sk_test_YOUR_SECRET_KEY:" \\`);
    console.log(`  -d customer=${result.customerId} \\`);
    console.log(`  -d "items[0][price]=PRICE_ID" \\`);
    console.log(`  -d "items[0][quantity]=1" \\`);
    console.log(`  -d off_session=true \\`);
    console.log(`  -d payment_behavior=error_if_incomplete \\`);
    console.log(`  -d proration_behavior=none`);
    
    console.log('\n🌐 Or test via web interface:');
    console.log('   Go to: http://localhost:4242/donate.html');
    console.log('   Select "Monthly Donation" tab');
    console.log('   Use test card: 4242424242424242');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSubscription(); 