document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    const countrySelect = document.getElementById('member_country');
    const stateSelect = document.getElementById('member_state');
    const districtSelect = document.getElementById('member_city');

    // Load countries on page load
    // Only run country/state/city logic if those elements exist
    if (countrySelect && stateSelect && districtSelect) {
        // Load countries on page load
        fetch('/member/ajax/countries/')
                .then(res => res.json())
                .then(data => {
                    countrySelect.innerHTML = '<option value="">Select Country</option>';
                    data.countries.forEach(c => {
                        let opt = document.createElement('option');
                        opt.value = c.id;
                        opt.text = c.name;
                        countrySelect.add(opt);
                    });
                    // Select "India" if present and trigger change event
                    for (let i = 0; i < countrySelect.options.length; i++) {
                        if (countrySelect.options[i].text.trim().toLowerCase() === 'india') {
                            countrySelect.selectedIndex = i;
                            countrySelect.dispatchEvent(new Event('change'));
                            break;
                        }
                    }
                    stateSelect.innerHTML = '<option value="">Select State</option>';
                    districtSelect.innerHTML = '<option value="">Select City</option>';
                });

        countrySelect.addEventListener('change', function() {
            const countryId = this.value;
            stateSelect.innerHTML = '<option value="">Select State</option>';
            districtSelect.innerHTML = '<option value="">Select City</option>';
            if (!countryId) return;
            fetch(`/member/ajax/states/?country_id=${countryId}`)
                .then(res => res.json())
                .then(data => {
                    data.states.forEach(s => {
                        let opt = document.createElement('option');
                        opt.value = s.id;
                        opt.text = s.name;
                        stateSelect.add(opt);
                    });
                    // Select "Maharashtra" if present
                    for (let i = 0; i < stateSelect.options.length; i++) {
                        if (stateSelect.options[i].text.trim().toLowerCase() === 'maharashtra') {
                            stateSelect.selectedIndex = i;
                            stateSelect.dispatchEvent(new Event('change'));
                            break;
                        }
                    }
                });
        });

        // Inside stateSelect.addEventListener('change', ...)
        stateSelect.addEventListener('change', function() {
            const stateId = this.value;
            districtSelect.innerHTML = '<option value="">Select City</option>';
            if (!stateId) return;
            fetch(`/member/ajax/cities/?state_id=${stateId}`)
                .then(res => res.json())
                .then(data => {
                    data.cities.forEach(c => {
                        let opt = document.createElement('option');
                        opt.value = c.id;
                        opt.text = c.name;
                        districtSelect.add(opt);
                    });
                    // Select "Pune" if present
                    for (let i = 0; i < districtSelect.options.length; i++) {
                        if (districtSelect.options[i].text.trim().toLowerCase() === 'pune') {
                            districtSelect.selectedIndex = i;
                            break;
                        }
                    }
                });
        });
    }
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
    if (!sidebarToggle || !sidebar) {
        console.warn('Sidebar toggle or sidebar not found on this page.');
    }
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