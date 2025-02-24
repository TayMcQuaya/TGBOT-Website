document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('emailForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('email');
        const email = emailInput.value;
        
        try {
            // Here you would typically send the email to your backend
            // For now, we'll just show a success message
            alert('Thanks for joining the waitlist! We\'ll contact you soon.');
            emailInput.value = '';
        } catch (error) {
            alert('Something went wrong. Please try again.');
        }
    });
}); 