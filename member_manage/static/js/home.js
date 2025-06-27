document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');

    // Form validation
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

    // Sidebar toggle functionality - FIXED
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar'); // Using class selector instead of ID

    console.log('Toggle button:', sidebarToggle);
    console.log('Sidebar:', sidebar);

    if (sidebarToggle && sidebar) {
        // Create overlay element
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        // Toggle sidebar
        sidebarToggle.addEventListener('click', function() {
            console.log('Toggle button clicked');
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });

        // Close sidebar when clicking overlay
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });

        // Close sidebar when clicking menu items (optional)
        const menuLinks = sidebar.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 900) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('active');
                }
            });
        });
    }
});