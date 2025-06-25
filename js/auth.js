// Simple authentication check for parent portal
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('parentLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    // Redirect to public page if not logged in
    window.location.href = 'index.html';
  }
});

// Logout function
function logout() {
  localStorage.removeItem('parentLoggedIn');
  window.location.href = 'index.html';
} 