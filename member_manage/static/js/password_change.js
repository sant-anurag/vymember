// static/js/password_change.js

document.addEventListener('DOMContentLoaded', function() {
    const passwordForm = document.getElementById('passwordChangeForm');
    const newPasswordInput = document.getElementById('new_password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const changePasswordBtn = document.getElementById('changePasswordBtn');

    // Function to validate password strength
    function validatePassword(password) {
        const minLength = 8;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        return password.length >= minLength && hasLetter && hasNumber && hasSpecialChar;
    }

    // Check password on input
    newPasswordInput.addEventListener('input', function() {
        const password = newPasswordInput.value;

        if (password && !validatePassword(password)) {
            newPasswordInput.setCustomValidity("Password must be at least 8 characters and include letters, numbers, and a special character.");
        } else {
            newPasswordInput.setCustomValidity("");
        }
    });

    // Check if passwords match
    confirmPasswordInput.addEventListener('input', function() {
        if (newPasswordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.setCustomValidity("Passwords don't match");
        } else {
            confirmPasswordInput.setCustomValidity("");
        }
    });

    // Form submission validation
    passwordForm.addEventListener('submit', function(e) {
        const password = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Reset custom validity
        newPasswordInput.setCustomValidity("");
        confirmPasswordInput.setCustomValidity("");

        // Validate password strength
        if (!validatePassword(password)) {
            newPasswordInput.setCustomValidity("Password must be at least 8 characters and include letters, numbers, and a special character.");
            e.preventDefault();
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            confirmPasswordInput.setCustomValidity("Passwords don't match");
            e.preventDefault();
            return;
        }
    });
});