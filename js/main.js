// Function to get the server URL for development
function getDevServerUrl() {
    // Frontend runs on port 8000, but backend always runs on 3000
    const currentHost = window.location.hostname;
    const backendPort = '3000'; // Backend server port

    // If accessing via IP or localhost, use the same host but with backend port
    if (currentHost === 'localhost' || currentHost.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.0\.0\.1)/)) {
        return `http://${currentHost}:${backendPort}/api/waitlist`;
    }
    
    // Fallback to localhost if something goes wrong
    return 'http://localhost:3000/api/waitlist';
}

// API URLs for different environments
const API_URLS = {
    // For local development, automatically detect the appropriate URL
    development: getDevServerUrl(),
    // For production, use the DigitalOcean IP
    production: `${window.CONFIG.PRODUCTION.SERVER_URL}/api/waitlist`
};

// Choose API URL based on hostname
const API_URL = window.location.hostname === 'localhost' || 
                window.location.hostname.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.0\.0\.1)/)
    ? API_URLS.development 
    : API_URLS.production;

console.log('Using API URL:', API_URL);

// Function to show custom notification with retry option
function showNotification(message, isSuccess = true, retryCallback = null) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification ${isSuccess ? 'success' : 'error'}`;
    
    // Create content with retry button for errors
    let content = `
        <div class="notification-content">
            <i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'} fa-bounce"></i>
            <p>${message}</p>
        </div>
    `;

    if (!isSuccess && retryCallback) {
        content += `
            <button onclick="retrySubmission()" class="retry-button">
                <i class="fas fa-redo"></i> Try Again
            </button>
        `;
    }
    
    notification.innerHTML = content;
    document.body.appendChild(notification);
    
    // Force reflow to trigger animation
    notification.offsetHeight;
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-hide successful notifications
    if (isSuccess) {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 400);
        }, 3000);
    }
}

// Function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to handle form submission with timeout
async function submitForm(email) {
    try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
            signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to join waitlist. Please try again.');
        }
        
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Submission error:', error);
        if (error.name === 'AbortError') {
            return { 
                success: false, 
                message: 'Request timed out. Please check your connection and try again.' 
            };
        }
        return { 
            success: false, 
            message: error.message || 'Something went wrong. Please try again.' 
        };
    }
}

// Initialize the form
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('emailForm');
    const emailInput = document.getElementById('email');
    const submitButton = form.querySelector('button[type="submit"]');
    let lastEmail = '';
    
    // Disable form zooming on iOS
    emailInput.setAttribute('autocomplete', 'off');
    emailInput.setAttribute('autocorrect', 'off');
    emailInput.setAttribute('autocapitalize', 'off');
    emailInput.setAttribute('spellcheck', 'false');
    
    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        lastEmail = email;
        
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
        
        const result = await submitForm(email);
        
        if (result.success) {
            showNotification('Thanks for joining the waitlist! We\'ll contact you soon.', true);
            emailInput.value = '';
            gtag('event', 'waitlist_signup', { 'email': email }); // Google Analytics event
        } else {
            showNotification(result.message, false, () => {
                emailInput.value = lastEmail;
                submitForm(lastEmail);
            });
        }
        
        // Re-enable form
        submitButton.disabled = false;
        submitButton.innerHTML = 'Join Waitlist <i class="fas fa-arrow-right"></i>';
    });
    
    // Add retry function to window scope
    window.retrySubmission = async function() {
        if (lastEmail) {
            emailInput.value = lastEmail;
            const result = await submitForm(lastEmail);
            
            if (result.success) {
                showNotification('Thanks for joining the waitlist! We\'ll contact you soon.', true);
                emailInput.value = '';
                gtag('event', 'waitlist_signup', { 'email': lastEmail });
            } else {
                showNotification(result.message, false, () => retrySubmission());
            }
        }
    };
}); 