// API URLs for different environments
const API_URLS = {
    development: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api/waitlist'  // Use localhost when on computer
        : `http://192.168.1.19:3000/api/waitlist`,  // Use computer's IP when on mobile
    production: 'https://your-digitalocean-url.com/api/waitlist'
};

// Choose API URL based on environment
const API_URL = window.location.hostname === 'localhost' || 
                window.location.hostname.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.0\.0\.1|\[::])/)
    ? API_URLS.development
    : API_URLS.production;

console.log('Using API URL:', API_URL);

// Function to show custom notification
function showNotification(message, isSuccess = true) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification ${isSuccess ? 'success' : 'error'}`;
    
    // Create content with larger icons and centered text
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'} fa-bounce"></i>
            <p>${message}</p>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Force reflow to trigger animation
    notification.offsetHeight;
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 400); // Match the CSS transition duration
    }, 3000);
}

// Function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('emailForm');
    const emailInput = document.getElementById('email');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Disable form zooming on iOS
    emailInput.setAttribute('autocomplete', 'off');
    emailInput.setAttribute('autocorrect', 'off');
    emailInput.setAttribute('autocapitalize', 'off');
    emailInput.setAttribute('spellcheck', 'false');
    
    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        // Client-side validation
        if (!email) {
            showNotification('Please enter your email address.', false);
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address.', false);
            return;
        }
        
        // Disable form while submitting
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to join waitlist. Please try again.');
            }
            
            showNotification('Thanks for joining the waitlist! We\'ll contact you soon.', true);
            emailInput.value = '';
        } catch (error) {
            console.error('Submission error:', error);
            showNotification(error.message || 'Something went wrong. Please try again.', false);
        } finally {
            // Re-enable form
            submitButton.disabled = false;
            submitButton.innerHTML = 'Join Waitlist <i class="fas fa-arrow-right"></i>';
        }
    });
}); 