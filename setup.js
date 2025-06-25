#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎉 Jubayr Learning Center - Donation System Setup');
console.log('================================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Skipping environment setup.');
} else {
  console.log('📝 Setting up environment variables...\n');
  
  const envContent = `# Stripe Configuration
# Replace with your actual Stripe test keys from the Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_51OqXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_PUBLISHABLE_KEY=pk_test_51OqXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Server Configuration
PORT=4242
NODE_ENV=development

# Instructions:
# 1. Get your Stripe test keys from: https://dashboard.stripe.com/apikeys
# 2. Replace the placeholder keys above with your actual keys
# 3. Update the publishable key in js/donation.js as well
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with placeholder Stripe keys');
  console.log('📋 Please update the keys in .env with your actual Stripe test keys\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully\n');
  } catch (error) {
    console.log('❌ Failed to install dependencies. Please run "npm install" manually.\n');
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

console.log('🚀 Setup complete! Next steps:');
console.log('1. Update your Stripe keys in .env file');
console.log('2. Update the publishable key in js/donation.js');
console.log('3. Run "npm run dev" to start the server');
console.log('4. Visit http://localhost:4242/donate.html to test\n');

console.log('📚 For detailed instructions, see README.md');
console.log('🔗 Get Stripe keys from: https://dashboard.stripe.com/apikeys');

rl.close(); 