// Donation System JavaScript
// This file handles the donation form, Stripe Elements integration, and payment processing

console.log('🎯 Donation.js loaded successfully');

// Stripe configuration
const stripe = Stripe('pk_test_51RbjWrQmFrd2NqBdcQu6BasrklUCRLiavvmdgnYZr8Vz3GZxSUwNO0ZKcS0QwvJ7ulv9eRDyZTaLelP2lK8eWzmL00G2EY4qv1');
console.log('✅ Stripe initialized with key:', stripe ? 'SUCCESS' : 'FAILED');

// Server configuration
const SERVER_URL = window.location.hostname === 'localhost' ? 'http://localhost:4242' : '/api';

// Global variables
let elements;
let paymentElement;
let amount = 25;
let donationType = 'one-time';
let email = '';
let isSubscription = false;

// DOM elements
const form = document.getElementById('donation-form');
const emailInput = document.getElementById('email');
const oneTimeAmountInput = document.getElementById('one-time-amount');
const monthlyAmountInput = document.getElementById('monthly-amount');
const submitButton = document.getElementById('submit-button');
const buttonText = document.getElementById('button-text');
const spinner = document.getElementById('spinner');
const paymentMessage = document.getElementById('payment-message');
const donationTabs = document.querySelectorAll('.donation-tab');
const tabContents = document.querySelectorAll('.donation-tab-content');
const amountOptions = document.querySelectorAll('.amount-option');

console.log('🔍 DOM elements found:', {
  form: !!form,
  emailInput: !!emailInput,
  oneTimeAmountInput: !!oneTimeAmountInput,
  monthlyAmountInput: !!monthlyAmountInput,
  submitButton: !!submitButton,
  paymentMessage: !!paymentMessage,
  donationTabs: donationTabs.length,
  tabContents: tabContents.length,
  amountOptions: amountOptions.length
});

// Initialize the donation system
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing donation form...');
    initializeDonationForm();
    setupEventListeners();
});

// Initialize donation form
function initializeDonationForm() {
    console.log('🚀 Initializing donation form...');
    
    // Set default values
    oneTimeAmountInput.value = '25.00';
    monthlyAmountInput.value = '20.00';
    
    // Update amount to ensure it's properly set
    const initialAmount = updateAmount();
    console.log('🚀 Initial amount set to:', initialAmount);
    
    // Initialize Stripe Elements
    initializeStripeElements();
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    donationTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Amount option buttons for monthly donations
    amountOptions.forEach(option => {
        option.addEventListener('click', () => selectAmountOption(option));
    });
    
    // Form submission
    form.addEventListener('submit', handleSubmit);
    
    // Input validation and amount updates
    emailInput.addEventListener('input', () => {
        clearMessages();
        validateEmail();
    });
    
    oneTimeAmountInput.addEventListener('input', () => {
        clearMessages();
        console.log('🔍 One-time amount input event - raw value:', oneTimeAmountInput.value);
        
        // Don't process if input is completely empty
        if (!oneTimeAmountInput.value.trim()) {
            console.log('Input is empty, skipping processing');
            return;
        }
        
        // Get amount directly from input
        const newAmount = parseFloat(oneTimeAmountInput.value) || 25;
        console.log('🔍 Parsed new amount:', newAmount, 'current amount:', amount);
        
        // Only reinitialize if amount is valid and changed significantly
        if (newAmount > 0 && Math.abs(newAmount - amount) > 1) {
            console.log('Amount changed significantly during typing, reinitializing payment elements');
            setTimeout(() => {
                console.log('Amount before reinitializing:', newAmount);
                reinitializePaymentElements();
            }, 500); // Debounce by 500ms
        }
    });
    
    monthlyAmountInput.addEventListener('input', () => {
        clearMessages();
        console.log('🔍 Monthly amount input event - raw value:', monthlyAmountInput.value);
        
        // Don't process if input is completely empty
        if (!monthlyAmountInput.value.trim()) {
            console.log('Input is empty, skipping processing');
            return;
        }
        
        // Get amount directly from input
        const newAmount = parseFloat(monthlyAmountInput.value) || 20;
        console.log('🔍 Parsed new amount:', newAmount, 'current amount:', amount);
        
        // Only reinitialize if amount is valid and changed significantly
        if (newAmount > 0 && Math.abs(newAmount - amount) > 1) {
            console.log('Amount changed significantly during typing, reinitializing payment elements');
            setTimeout(() => {
                console.log('Amount before reinitializing:', newAmount);
                reinitializePaymentElements();
            }, 500); // Debounce by 500ms
        }
    });
    
    // Format amount on blur and reinitialize payment elements if amount changed
    oneTimeAmountInput.addEventListener('blur', () => {
        formatAmountInput(oneTimeAmountInput);
        // Get amount directly from input
        const newAmount = parseFloat(oneTimeAmountInput.value) || 25;
        // Reinitialize if amount changed significantly and is valid
        if (newAmount > 0 && Math.abs(newAmount - amount) > 0.01) {
            console.log('Amount changed significantly, reinitializing payment elements');
            console.log('Amount before reinitializing:', newAmount);
            reinitializePaymentElements();
        }
    });
    
    monthlyAmountInput.addEventListener('blur', () => {
        formatAmountInput(monthlyAmountInput);
        // Get amount directly from input
        const newAmount = parseFloat(monthlyAmountInput.value) || 20;
        // Reinitialize if amount changed significantly and is valid
        if (newAmount > 0 && Math.abs(newAmount - amount) > 0.01) {
            console.log('Amount changed significantly, reinitializing payment elements');
            console.log('Amount before reinitializing:', newAmount);
            reinitializePaymentElements();
        }
    });
}

// Format amount input to show proper currency format
function formatAmountInput(input) {
    const value = input.value.trim();
    console.log('Formatting input value:', value);
    
    if (value) {
        // Remove any non-numeric characters except decimal point
        const cleanValue = value.replace(/[^\d.]/g, '');
        console.log('Clean value for formatting:', cleanValue);
        
        const numValue = parseFloat(cleanValue);
        console.log('Parsed number for formatting:', numValue);
        
        if (!isNaN(numValue)) {
            const formattedValue = numValue.toFixed(2);
            console.log('Formatted value:', formattedValue);
            input.value = formattedValue;
        }
    }
}

// Switch between donation tabs
function switchTab(tabName) {
    console.log('🔄 Switching to tab:', tabName);
    
    // Update active tab
    donationTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update active content
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    // Update donation type
    donationType = tabName;
    console.log('🔄 Donation type updated to:', donationType);
    
    // Reset subscription flag when switching tabs
    isSubscription = (donationType === 'monthly');
    console.log('🔄 Subscription flag set to:', isSubscription);
    
    // Get amount directly from the current input field
    let newAmount;
    if (donationType === 'one-time') {
        newAmount = parseFloat(oneTimeAmountInput.value) || 25;
    } else {
        newAmount = parseFloat(monthlyAmountInput.value) || 20;
    }
    
    console.log('🔄 Amount for new tab:', newAmount);
    
    // Reinitialize payment elements with new tab's amount (only if valid)
    if (newAmount > 0) {
        console.log('✅ Tab switched, reinitializing payment elements');
        reinitializePaymentElements();
    } else {
        console.log('❌ Invalid amount after tab switch, skipping reinitialization');
    }
}

// Select amount option for monthly donations
function selectAmountOption(selectedOption) {
    console.log('🔍 Amount option selected:', selectedOption.dataset.amount);
    
    // Remove active class from all options
    amountOptions.forEach(option => option.classList.remove('active'));
    
    // Add active class to selected option
    selectedOption.classList.add('active');
    
    // Update amount input
    monthlyAmountInput.value = selectedOption.dataset.amount;
    console.log('🔍 Updated monthly amount input to:', monthlyAmountInput.value);
    
    // Get amount directly from the input field
    const newAmount = parseFloat(monthlyAmountInput.value) || 20;
    console.log('🔍 Amount from input:', newAmount);
    
    // Reinitialize payment elements with new amount (only if valid)
    if (newAmount > 0) {
        console.log('✅ Monthly amount option selected, reinitializing payment elements');
        reinitializePaymentElements();
    } else {
        console.log('❌ Invalid amount, skipping reinitialization');
    }
}

// Initialize Stripe Elements
async function initializeStripeElements() {
    try {
        // Ensure amount is up to date before creating payment intent
        let currentAmount;
        if (donationType === 'one-time') {
            currentAmount = parseFloat(oneTimeAmountInput.value) || 25;
        } else {
            currentAmount = parseFloat(monthlyAmountInput.value) || 20;
        }
        
        console.log('💳 Initializing Stripe Elements with amount:', currentAmount, 'donationType:', donationType, 'email:', email);
        
        // Validate amount before creating payment intent
        if (currentAmount <= 0 || isNaN(currentAmount)) {
            throw new Error('Invalid amount: ' + currentAmount);
        }
        
        // Update global amount variable
        amount = currentAmount;
        
        let clientSecret;
        
        if (donationType === 'monthly') {
            // Create subscription for monthly payments
            console.log('🔄 Creating subscription for monthly payment...');
            isSubscription = true;
            const response = await fetch(`${SERVER_URL}/create-subscription`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    amount: currentAmount,
                    email: email
                }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Subscription creation failed:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const subscriptionData = await response.json();
            console.log('✅ Subscription data received:', subscriptionData);
            
            clientSecret = subscriptionData.clientSecret;
            console.log('✅ Subscription created successfully for amount:', currentAmount);
            console.log('🔑 Client secret for subscription:', clientSecret ? 'RECEIVED' : 'MISSING');
        } else {
            // Create payment intent for one-time payments
            console.log('💳 Creating payment intent for one-time payment...');
            isSubscription = false;
            const response = await fetch(`${SERVER_URL}/create-payment-intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    amount: currentAmount,
                    donationType: donationType,
                    email: email
                }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Payment intent creation failed:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const paymentData = await response.json();
            console.log('✅ Payment intent data received:', paymentData);
            
            clientSecret = paymentData.clientSecret;
            console.log('✅ Payment intent created successfully for amount:', currentAmount);
            console.log('🔑 Client secret for payment intent:', clientSecret ? 'RECEIVED' : 'MISSING');
        }
        
        // Initialize Stripe Elements and store globally
        elements = stripe.elements({
            clientSecret,
            appearance: {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#5ebaf3',
                }
            }
        });
        
        console.log('✅ Elements created and stored globally:', !!elements);
        
        // Create payment element
        paymentElement = elements.create('payment');
        
        // Mount payment element
        const container = document.getElementById('payment-element');
        if (container) {
            paymentElement.mount(container);
            console.log('✅ Payment element mounted successfully');
            showMessage('Payment form is ready', 'success');
        } else {
            throw new Error('Payment element container not found');
        }
        
    } catch (error) {
        console.error('❌ Error initializing Stripe Elements:', error);
        showMessage('Error initializing payment form. Please refresh the page and try again.', 'error');
        throw error;
    }
}

// Update amount based on current tab and input values
function updateAmount() {
    let inputValue;
    
    if (donationType === 'one-time') {
        inputValue = oneTimeAmountInput.value.trim();
    } else {
        inputValue = monthlyAmountInput.value.trim();
    }
    
    console.log('🔍 updateAmount() called - Raw input value:', inputValue, 'type:', typeof inputValue, 'donationType:', donationType);
    
    // Remove any non-numeric characters except decimal point
    const cleanValue = inputValue.replace(/[^\d.]/g, '');
    console.log('🔍 Cleaned value:', cleanValue);
    
    // Parse the amount, default to 25 if invalid
    const parsedAmount = parseFloat(cleanValue);
    console.log('🔍 Parsed amount:', parsedAmount, 'isNaN:', isNaN(parsedAmount));
    
    // Use 25 as default if amount is invalid or 0
    const oldAmount = amount;
    amount = (isNaN(parsedAmount) || parsedAmount <= 0) ? 25 : parsedAmount;
    
    console.log('🔍 Amount updated:', oldAmount, '→', amount, 'for donation type:', donationType, 'from input:', inputValue);
    
    // Validate the final amount
    if (amount <= 0 || isNaN(amount)) {
        console.error('❌ Invalid amount after update:', amount);
        amount = 25; // Fallback to default
    }
    
    return amount;
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    console.log('🚀 Form submitted - starting payment process');
    
    // Get amount directly from the current input field
    let finalAmount;
    if (donationType === 'one-time') {
        finalAmount = parseFloat(oneTimeAmountInput.value) || 25;
    } else {
        finalAmount = parseFloat(monthlyAmountInput.value) || 20;
    }
    
    console.log('💰 Final amount before submission:', finalAmount);
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    console.log('💰 Payment details:', {
        amount: finalAmount,
        donationType: donationType,
        email: email
    });
    
    // Disable submit button
    setLoading(true);
    
    try {
        console.log('💳 Confirming payment with Stripe...');
        
        // Ensure elements are available
        if (!elements) {
            console.error('❌ Elements not available:', elements);
            throw new Error('Payment elements not initialized. Please refresh the page and try again.');
        }
        
        console.log('✅ Elements available, confirming payment...');
        
        let result;
        
        if (isSubscription) {
            // For monthly subscriptions, use confirmSubscription
            console.log('🔄 Confirming subscription...');
            result = await stripe.confirmSubscription({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/thank-you.html?amount=${finalAmount}&type=${donationType}`,
                    receipt_email: email,
                },
                redirect: 'if_required'
            });
        } else {
            // For one-time payments, use confirmPayment
            console.log('💳 Confirming payment...');
            result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/thank-you.html?amount=${finalAmount}&type=${donationType}`,
                receipt_email: email,
            },
            redirect: 'if_required'
        });
        }
        
        const { error } = result;
        
        if (error) {
            console.error('❌ Payment confirmation error:', error);
            
            // Handle specific error types
            if (error.type === "card_error") {
                showMessage(`Card error: ${error.message}`, 'error');
            } else if (error.type === "validation_error") {
                showMessage(`Validation error: ${error.message}`, 'error');
            } else if (error.type === "invalid_request_error") {
                showMessage(`Invalid request: ${error.message}`, 'error');
            } else {
                showMessage(`Payment error: ${error.message}`, 'error');
            }
        } else {
            console.log('✅ Payment confirmation successful - redirecting...');
            // Payment succeeded, redirect to thank you page
            window.location.href = `${window.location.origin}/thank-you.html?amount=${finalAmount}&type=${donationType}`;
        }
        
    } catch (error) {
        console.error('❌ Payment error:', error);
        showMessage(`Payment failed: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

// Validate form
function validateForm() {
    console.log('Validating form...');
    
    // Validate email
    if (!validateEmail()) {
        console.log('Email validation failed');
        return false;
    }
    
    // Validate amount
    if (!validateAmount()) {
        console.log('Amount validation failed');
        return false;
    }
    
    console.log('Form validation passed');
    return true;
}

// Validate email
function validateEmail() {
    const emailValue = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    console.log('Validating email:', emailValue);
    
    if (!emailValue) {
        showMessage('Please enter your email address.', 'error');
        return false;
    }
    
    if (!emailRegex.test(emailValue)) {
        showMessage('Please enter a valid email address.', 'error');
        return false;
    }
    
    email = emailValue;
    console.log('Email validation passed:', email);
    return true;
}

// Validate amount
function validateAmount() {
    // Get the current amount directly from input fields
    let currentAmount;
    if (donationType === 'one-time') {
        currentAmount = parseFloat(oneTimeAmountInput.value) || 25;
    } else {
        currentAmount = parseFloat(monthlyAmountInput.value) || 20;
    }
    
    console.log('🔍 Validating amount. Current amount:', currentAmount, 'Type:', typeof currentAmount);
    
    // Check if amount is a valid number
    if (typeof currentAmount !== 'number' || isNaN(currentAmount)) {
        console.log('❌ Amount is not a valid number');
        showMessage('Please enter a valid amount.', 'error');
        return false;
    }
    
    if (currentAmount < 1) {
        console.log('❌ Amount is less than $1.00');
        showMessage('Please enter a valid amount (minimum $1.00).', 'error');
        return false;
    }
    
    if (currentAmount > 10000) {
        console.log('❌ Amount exceeds $10,000');
        showMessage('Amount cannot exceed $10,000.', 'error');
        return false;
    }
    
    console.log('✅ Amount validation passed:', currentAmount);
    return true;
}

// Set loading state
function setLoading(isLoading) {
    if (isLoading) {
        submitButton.disabled = true;
        spinner.classList.remove("hidden");
        buttonText.classList.add("hidden");
    } else {
        submitButton.disabled = false;
        spinner.classList.add("hidden");
        buttonText.classList.remove("hidden");
    }
}

// Show message
function showMessage(messageText, messageType = 'error') {
    paymentMessage.textContent = messageText;
    paymentMessage.className = `payment-message ${messageType}`;
    paymentMessage.classList.remove("hidden");
    
    console.log(`Message shown: ${messageText} (${messageType})`);
    
    // Auto-hide success messages after 5 seconds
    if (messageType === 'success') {
        setTimeout(() => {
            paymentMessage.classList.add("hidden");
        }, 5000);
    }
}

// Clear error messages
function clearMessages() {
    paymentMessage.classList.add("hidden");
}

// Reinitialize payment elements when amount changes
async function reinitializePaymentElements() {
    console.log('🔄 Reinitializing payment elements for new amount:', amount, 'donationType:', donationType);
    
    // Get amount directly from the current input field
    let currentAmount;
    if (donationType === 'one-time') {
        currentAmount = parseFloat(oneTimeAmountInput.value) || 25;
    } else {
        currentAmount = parseFloat(monthlyAmountInput.value) || 20;
    }
    
    console.log('🔄 Amount from input:', currentAmount, 'global amount:', amount);
    
    // Don't reinitialize if amount is invalid (0 or NaN)
    if (currentAmount <= 0 || isNaN(currentAmount)) {
        console.log('❌ Skipping reinitialization - invalid amount:', currentAmount);
        return;
    }
    
    // Update global amount variable
    amount = currentAmount;
    
    console.log('✅ Proceeding with reinitialization for amount:', amount);
    
    // Destroy existing payment element
    if (paymentElement) {
        try {
            paymentElement.destroy();
            console.log('✅ Payment element destroyed');
        } catch (error) {
            console.log('⚠️ Error destroying payment element:', error);
        }
        paymentElement = null;
    }
    
    // Clear the elements variable
    elements = null;
    
    // Clear the payment element container
    const container = document.getElementById('payment-element');
    if (container) {
        container.innerHTML = '';
    }
    
    // Reinitialize with new amount
    await initializeStripeElements();
}

// Test function for debugging amount parsing
window.testAmountParsing = function(testValue) {
    console.log('🧪 Testing amount parsing with:', testValue);
    console.log('🧪 Type of testValue:', typeof testValue);
    
    // Simulate what happens in updateAmount function
    const cleanValue = testValue.toString().replace(/[^\d.]/g, '');
    console.log('🧪 Cleaned value:', cleanValue);
    
    const parsedAmount = parseFloat(cleanValue);
    console.log('🧪 Parsed amount:', parsedAmount, 'isNaN:', isNaN(parsedAmount));
    
    return parsedAmount;
};

// Initialize the donation form when the page loads
document.addEventListener('DOMContentLoaded', initializeDonationForm);