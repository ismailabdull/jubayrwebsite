// Subscription Management JavaScript
console.log('🎯 Subscription management.js loaded successfully');

// Server configuration
const SERVER_URL = window.location.hostname === 'localhost' ? 'http://localhost:4242' : '/api';

// Global variables
let customerId = null;
let subscriptionId = null;

// DOM elements
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const subscriptionDetails = document.getElementById('subscription-details');
const subscriptionInfo = document.getElementById('subscription-info');
const managePortalBtn = document.getElementById('manage-portal-btn');
const cancelSubscriptionBtn = document.getElementById('cancel-subscription-btn');
const cancellationConfirmation = document.getElementById('cancellation-confirmation');
const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
const keepSubscriptionBtn = document.getElementById('keep-subscription-btn');
const successMessage = document.getElementById('success-message');

console.log('🔍 DOM elements found:', {
  loadingState: !!loadingState,
  errorState: !!errorState,
  subscriptionDetails: !!subscriptionDetails,
  managePortalBtn: !!managePortalBtn,
  cancelSubscriptionBtn: !!cancelSubscriptionBtn
});

// Initialize the subscription management
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing subscription management...');
    
    // Get customer ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    customerId = urlParams.get('customer');
    
    if (!customerId) {
        console.error('❌ No customer ID found in URL');
        showError('Invalid link. Please check your email for the correct link.');
        return;
    }
    
    console.log('👤 Customer ID from URL:', customerId);
    
    // Load subscription details
    loadSubscriptionDetails();
    setupEventListeners();
});

// Load subscription details from server
async function loadSubscriptionDetails() {
    try {
        console.log('📋 Loading subscription details for customer:', customerId);
        
        const response = await fetch(`${SERVER_URL}/get-subscription-details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Subscription details received:', data);
        
        if (data.subscription) {
            subscriptionId = data.subscription.id;
            displaySubscriptionDetails(data.subscription, data.customer);
        } else {
            showError('No active subscription found for this customer.');
        }
        
    } catch (error) {
        console.error('❌ Error loading subscription details:', error);
        showError('Unable to load subscription details. Please try again later.');
    }
}

// Display subscription details
function displaySubscriptionDetails(subscription, customer) {
    console.log('📊 Displaying subscription details:', subscription);
    
    const amount = (subscription.items.data[0].price.unit_amount / 100).toFixed(2);
    const status = subscription.status;
    const nextBilling = new Date(subscription.current_period_end * 1000).toLocaleDateString();
    
    subscriptionInfo.innerHTML = `
        <p><strong>Amount:</strong> $${amount}/month</p>
        <p><strong>Status:</strong> <span class="status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></p>
        <p><strong>Next billing:</strong> ${nextBilling}</p>
        <p><strong>Email:</strong> ${customer.email}</p>
    `;
    
    // Show subscription details
    loadingState.classList.add('hidden');
    subscriptionDetails.classList.remove('hidden');
    
    // Enable/disable buttons based on status
    if (status === 'active') {
        managePortalBtn.disabled = false;
        cancelSubscriptionBtn.disabled = false;
    } else {
        managePortalBtn.disabled = true;
        cancelSubscriptionBtn.disabled = true;
    }
}

// Show error message
function showError(message) {
    console.error('❌ Error:', message);
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    errorState.querySelector('p').textContent = message;
}

// Setup event listeners
function setupEventListeners() {
    // Manage subscription button
    managePortalBtn.addEventListener('click', async () => {
        console.log('🔗 Opening customer portal...');
        await openCustomerPortal();
    });
    
    // Cancel subscription button
    cancelSubscriptionBtn.addEventListener('click', () => {
        console.log('❌ Showing cancellation confirmation...');
        subscriptionDetails.classList.add('hidden');
        cancellationConfirmation.classList.remove('hidden');
    });
    
    // Confirm cancellation
    confirmCancelBtn.addEventListener('click', async () => {
        console.log('❌ Confirming subscription cancellation...');
        await cancelSubscription();
    });
    
    // Keep subscription
    keepSubscriptionBtn.addEventListener('click', () => {
        console.log('✅ Keeping subscription...');
        cancellationConfirmation.classList.add('hidden');
        subscriptionDetails.classList.remove('hidden');
    });
}

// Open Stripe customer portal
async function openCustomerPortal() {
    try {
        console.log('🔗 Creating customer portal session...');
        
        const response = await fetch(`${SERVER_URL}/create-portal-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Customer portal session created:', data.url);
        
        // Redirect to customer portal
        window.location.href = data.url;
        
    } catch (error) {
        console.error('❌ Error opening customer portal:', error);
        showError('Unable to open subscription management portal. Please try again.');
    }
}

// Cancel subscription
async function cancelSubscription() {
    try {
        console.log('❌ Cancelling subscription:', subscriptionId);
        
        const response = await fetch(`${SERVER_URL}/cancel-subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                customerId,
                subscriptionId 
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Subscription cancelled successfully:', data);
        
        // Show success message
        cancellationConfirmation.classList.add('hidden');
        successMessage.classList.remove('hidden');
        successMessage.querySelector('p').textContent = 'Your monthly donation has been cancelled successfully. Thank you for your support!';
        
        // Reload subscription details after a delay
        setTimeout(() => {
            window.location.reload();
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error cancelling subscription:', error);
        showError('Unable to cancel subscription. Please try again or contact support.');
    }
}

// Utility function to show/hide elements
function showElement(element) {
    element.classList.remove('hidden');
}

function hideElement(element) {
    element.classList.add('hidden');
} 