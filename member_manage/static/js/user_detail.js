document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const viewButtons = document.querySelectorAll('.view-btn');
    const editButtons = document.querySelectorAll('.edit-btn');
    const userViewOverlay = document.getElementById('userViewOverlay');
    const userEditOverlay = document.getElementById('userEditOverlay');
    const closeViewModal = document.getElementById('closeViewModal');
    const closeViewBtn = document.getElementById('closeViewBtn');
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveUserBtn = document.getElementById('saveUserBtn');
    const editStatusMessage = document.getElementById('editStatusMessage');

    // Add event listeners to view buttons
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            fetchUserDetails(userId, 'view');
        });
    });

    // Add event listeners to edit buttons
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            fetchUserDetails(userId, 'edit');
        });
    });

    // Close view modal
    if (closeViewModal) {
        closeViewModal.addEventListener('click', function() {
            userViewOverlay.classList.remove('active');
        });
    }

    if (closeViewBtn) {
        closeViewBtn.addEventListener('click', function() {
            userViewOverlay.classList.remove('active');
        });
    }

    // Close edit modal
    if (closeEditModal) {
        closeEditModal.addEventListener('click', function() {
            userEditOverlay.classList.remove('active');
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            userEditOverlay.classList.remove('active');
        });
    }

    // Close modal when clicking outside
    userViewOverlay.addEventListener('click', function(e) {
        if (e.target === userViewOverlay) {
            userViewOverlay.classList.remove('active');
        }
    });

    userEditOverlay.addEventListener('click', function(e) {
        if (e.target === userEditOverlay) {
            userEditOverlay.classList.remove('active');
        }
    });

    // Fetch user details
    function fetchUserDetails(userId, mode) {
        // Get CSRF token
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        fetch(`/member/get-user-details/${userId}/`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                if (mode === 'view') {
                    displayUserDetails(data.user);
                } else if (mode === 'edit') {
                    populateEditForm(data.user);
                }
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching user details:', error);
            alert('Failed to fetch user details. Please try again.');
        });
    }

    // Display user details in view modal
    function displayUserDetails(user) {
        // Populate view fields
        document.getElementById('view_username').value = user.username;
        document.getElementById('view_email').value = user.email || 'N/A';
        document.getElementById('view_admin_status').value = user.is_admin ? 'Admin' : 'Standard';
        document.getElementById('view_created_on').value = formatDate(user.created_on);

        // Show the overlay
        userViewOverlay.classList.add('active');
    }

    // Populate edit form
    function populateEditForm(user) {
        // Populate edit fields
        document.getElementById('edit_user_id').value = user.id;
        document.getElementById('edit_username').value = user.username;
        document.getElementById('edit_email').value = user.email || '';
        document.getElementById('edit_admin_status').value = user.is_admin ? '1' : '0';
        document.getElementById('edit_created_on').value = formatDate(user.created_on);

        // Clear password fields
        document.getElementById('edit_password').value = '';
        document.getElementById('edit_confirm_password').value = '';

        // Clear any previous status messages
        editStatusMessage.textContent = '';
        editStatusMessage.className = 'status-message-modal';

        // Show the overlay
        userEditOverlay.classList.add('active');
    }

    // Format date
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Save user changes
    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', function() {
            // Get form values
            const userId = document.getElementById('edit_user_id').value;
            const username = document.getElementById('edit_username').value;
            const email = document.getElementById('edit_email').value;
            const isAdmin = document.getElementById('edit_admin_status').value;
            const password = document.getElementById('edit_password').value;
            const confirmPassword = document.getElementById('edit_confirm_password').value;

            // Validate form
            if (!username) {
                showStatusMessage('error', 'Username is required');
                return;
            }

            // Check if passwords match when provided
            if (password && password !== confirmPassword) {
                showStatusMessage('error', 'Passwords do not match');
                return;
            }

            // Get CSRF token
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            // Prepare data
            const userData = {
                username: username,
                email: email,
                is_admin: isAdmin,
                password: password
            };

            // Send AJAX request
            fetch(`/member/update-user/${userId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showStatusMessage('success', data.message);

                    // Update the user in the table
                    updateUserInTable(userId, userData, data.created_on);

                    // Close modal after 2 seconds
                    setTimeout(() => {
                        userEditOverlay.classList.remove('active');
                    }, 2000);
                } else {
                    showStatusMessage('error', data.message);
                }
            })
            .catch(error => {
                console.error('Error updating user:', error);
                showStatusMessage('error', 'Failed to update user. Please try again.');
            });
        });
    }

    // Update user in the table
    function updateUserInTable(userId, userData, createdOn) {
        const userRows = document.querySelectorAll('#userTable tbody tr');

        userRows.forEach(row => {
            const actionBtns = row.querySelector('.edit-btn');
            if (actionBtns && actionBtns.getAttribute('data-id') === userId) {
                // Update table cells
                const cells = row.querySelectorAll('td');
                cells[0].textContent = userData.username;
                cells[1].textContent = userData.email || 'N/A';

                // Update admin badge
                cells[2].innerHTML = '';
                if (userData.is_admin === '1') {
                    cells[2].innerHTML = '<span class="badge admin">Admin</span>';
                } else {
                    cells[2].innerHTML = '<span class="badge standard">Standard</span>';
                }

                // No need to update created_on as it shouldn't change
            }
        });
    }

    // Show status message
    function showStatusMessage(type, message) {
        editStatusMessage.textContent = message;
        editStatusMessage.className = 'status-message-modal ' + type;
        editStatusMessage.classList.add('show');

        // Hide the message after 5 seconds
        setTimeout(() => {
            editStatusMessage.classList.remove('show');
        }, 5000);
    }
});