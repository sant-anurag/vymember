document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createUserForm');
    const resetBtn = document.getElementById('resetBtn');
    const statusMessage = document.getElementById('statusMessage');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirm_password');

    // Reset form button
    resetBtn.addEventListener('click', function() {
        form.reset();
        statusMessage.style.display = 'none';
    });



    function validateForm() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;
        const userCategory = document.getElementById('user_category').value;

        if (!name) {
            showStatusMessage('error', 'Please enter the full name');
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

        if (!password || password.length < 8) {
            showStatusMessage('error', 'Password must be at least 8 characters long');
            return false;
        }

        if (password !== confirmPassword) {
            showStatusMessage('error', 'Passwords do not match');
            return false;
        }

        if (!userCategory) {
            showStatusMessage('error', 'Please select a user category');
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
});