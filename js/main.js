// API URLs for different environments
const API_URLS = {
    local: 'http://localhost:3000/api/waitlist',
    production: 'https://your-digitalocean-url.com/api/waitlist' // Replace with your actual DigitalOcean URL
};

// Choose API URL based on hostname
const API_URL = window.location.hostname === 'localhost' 
    ? API_URLS.local 
    : API_URLS.production;

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
    
    // Remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 400); // Match the CSS transition duration
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('emailForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('email');
        const email = emailInput.value;
        
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
                throw new Error(data.error);
            }
            
            showNotification('Thanks for joining the waitlist! We\'ll contact you soon.', true);
            emailInput.value = '';
        } catch (error) {
            showNotification(error.message || 'Something went wrong. Please try again.', false);
        }
    });
}); 