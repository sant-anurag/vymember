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

    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');

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

        // Handle mobile menu interactions
        const menuItems = sidebar.querySelectorAll('.menu > li > a');

        // For all menu items
        menuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                if (window.innerWidth <= 900) {
                    // Check if this menu item has a submenu
                    const parent = this.parentElement;
                    const submenu = parent.querySelector('.submenu');

                    if (submenu) {
                        // This is a parent menu item with submenu
                        e.preventDefault();
                        e.stopPropagation();

                        // Toggle submenu visibility manually
                        if (submenu.style.maxHeight === '300px') {
                            submenu.style.maxHeight = '0';
                        } else {
                            // Close all other submenus first
                            const allSubmenus = sidebar.querySelectorAll('.submenu');
                            allSubmenus.forEach(menu => {
                                menu.style.maxHeight = '0';
                            });

                            // Open this submenu
                            submenu.style.maxHeight = '300px';
                        }
                    } else {
                        // Regular menu item, close sidebar
                        sidebar.classList.remove('open');
                        overlay.classList.remove('active');
                    }
                }
            });
        });

        // For submenu items
        const submenuItems = sidebar.querySelectorAll('.submenu li a');
        submenuItems.forEach(link => {
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 900) {
                    // Don't prevent default navigation
                    // Just close the sidebar
                    sidebar.classList.remove('open');
                    overlay.classList.remove('active');
                }
            });
        });
    }

    // Apply animation to submenu items
    const submenus = document.querySelectorAll('.submenu');
    submenus.forEach(submenu => {
        const items = submenu.querySelectorAll('li');
        items.forEach((item, index) => {
            item.style.setProperty('--item-index', index);
        });
    });

    // Highlight active menu item based on current URL
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.menu > li > a, .submenu li a');
    menuLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            // For main menu items
            if (link.parentElement.parentElement.classList.contains('menu')) {
                link.parentElement.classList.add('active');
            }
            // For submenu items
            else if (link.parentElement.parentElement.classList.contains('submenu')) {
                link.classList.add('active');
                // Also highlight parent menu
                const parentItem = link.parentElement.parentElement.parentElement;
                parentItem.classList.add('active');
            }
        }
    });
});