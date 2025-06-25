document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            // Simple client-side validation
            const name = form.name.value.trim();
            const number = form.number.value.trim();
            if (!name || !number) {
                alert('Name and Contact Number are required.');
                e.preventDefault();
            }
        });
    }
});