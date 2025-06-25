document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const resetBtn = document.getElementById('resetBtn');
    const statusMessage = document.getElementById('statusMessage');

    // Setup year options programmatically
    setupYearOptions();

    // Reset form button
    resetBtn.addEventListener('click', function() {
        form.reset();
        statusMessage.style.display = 'none';
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Form validation
        if (!validateForm()) {
            return;
        }

        // Collect form data
        const formData = new FormData(form);

        // Send form data to server
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showStatusMessage('success', 'Your registration request has been submitted successfully. An administrator will review your application.');
                form.reset();
            } else {
                showStatusMessage('error', data.message || 'There was an error processing your request. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showStatusMessage('error', 'There was a network error. Please try again later.');
        });
    });

    function validateForm() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('username').value.trim();
        const reason = document.getElementById('reason').value.trim();

        if (!name) {
            showStatusMessage('error', 'Please enter your full name');
            return false;
        }

        if (!email || !isValidEmail(email)) {
            showStatusMessage('error', 'Please enter a valid email address');
            return false;
        }

        if (!username || username.length < 4) {
            showStatusMessage('error', 'Username must be at least 4 characters long');
            return false;
        }

        if (!reason) {
            showStatusMessage('error', 'Please provide a reason for registration');
            return false;
        }

        return true;
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showStatusMessage(type, message) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message ' + type;
        statusMessage.style.display = 'block';

        // Scroll to message
        statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function setupYearOptions() {
        // Generate years from 1900 to current year
        const currentYear = new Date().getFullYear();
        const yearSelects = [
            document.getElementById('associated_since'),
            document.getElementById('updeshta_since')
        ];

        yearSelects.forEach(select => {
            if (!select) return;

            // Clear existing options except the first one
            while (select.options.length > 1) {
                select.remove(1);
            }

            // Add year options from current year down to 1900
            for (let year = currentYear; year >= 1900; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                select.appendChild(option);
            }
        });
    }
});