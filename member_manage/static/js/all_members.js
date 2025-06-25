// all_members.js
document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let allMembers = [];
    let filteredMembers = [];
    const itemsPerPage = 10;
    let currentPage = 1;

    // DOM elements
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const instructorFilter = document.getElementById('instructorFilter');
    const companyFilter = document.getElementById('companyFilter');
    const dateFilter = document.getElementById('dateFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const membersTableBody = document.getElementById('membersTableBody');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');
    const pageStart = document.getElementById('pageStart');
    const pageEnd = document.getElementById('pageEnd');
    const totalItems = document.getElementById('totalItems');

    // Initialize the page
    fetchMembers();

    // Event listeners
    searchButton.addEventListener('click', applyFilters);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    applyFiltersBtn.addEventListener('click', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
    prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));

    // Fetch members data from the server
    function fetchMembers() {
        fetch('/api/members/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                allMembers = data;
                filteredMembers = [...allMembers];
                renderTable();
                updatePagination();
            })
            .catch(error => {
                console.error('Error fetching members:', error);
                membersTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-state">
                            <p>Could not load members. Please try again later.</p>
                        </td>
                    </tr>
                `;
            });
    }

    // Apply filters to the members data
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedInstructor = instructorFilter.value;
        const selectedCompany = companyFilter.value;
        const selectedDate = dateFilter.value;

        filteredMembers = allMembers.filter(member => {
            // Search by name
            const nameMatch = member.name.toLowerCase().includes(searchTerm);

            // Filter by instructor
            const instructorMatch = !selectedInstructor || member.instructor_id.toString() === selectedInstructor;

            // Filter by company
            const companyMatch = !selectedCompany || member.company === selectedCompany;

            // Filter by date
            const dateMatch = !selectedDate || member.date_of_initiation === selectedDate;

            return nameMatch && instructorMatch && companyMatch && dateMatch;
        });

        currentPage = 1;
        renderTable();
        updatePagination();
    }

    // Reset all filters
    function resetFilters() {
        searchInput.value = '';
        instructorFilter.value = '';
        companyFilter.value = '';
        dateFilter.value = '';

        filteredMembers = [...allMembers];
        currentPage = 1;
        renderTable();
        updatePagination();
    }

    // Render the members table with current page data
    function renderTable() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPageData = filteredMembers.slice(startIndex, endIndex);

        if (currentPageData.length === 0) {
            membersTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <p>No members found matching your criteria.</p>
                    </td>
                </tr>
            `;
            return;
        }

        membersTableBody.innerHTML = '';

        currentPageData.forEach(member => {
            const row = document.createElement('tr');

            // Format date for display
            const initiationDate = member.date_of_initiation ? new Date(member.date_of_initiation) : null;
            const formattedDate = initiationDate ? initiationDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : 'N/A';

            row.innerHTML = `
                <td>${member.name}</td>
                <td>${member.number}</td>
                <td>${member.email || '-'}</td>
                <td>${member.company || '-'}</td>
                <td>${member.instructor_name}</td>
                <td>${formattedDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-button view" title="View Details" onclick="viewMember(${member.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-button edit" title="Edit Member" onclick="editMember(${member.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-button delete" title="Delete Member" onclick="deleteMember(${member.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            membersTableBody.appendChild(row);
        });
    }

    // Update pagination controls
    function updatePagination() {
        const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

        // Update info text
        totalItems.textContent = filteredMembers.length;

        const start = filteredMembers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, filteredMembers.length);

        pageStart.textContent = start;
        pageEnd.textContent = end;

        // Enable/disable prev/next buttons
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

        // Generate page number buttons
        pageNumbers.innerHTML = '';

        // Only show a limited number of page numbers to avoid overcrowding
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        // Adjust start page if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        // Add first page button if needed
        if (startPage > 1) {
            addPageNumberButton(1);
            if (startPage > 2) {
                addEllipsis();
            }
        }

        // Add page number buttons
        for (let i = startPage; i <= endPage; i++) {
            addPageNumberButton(i);
        }

        // Add last page button if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                addEllipsis();
            }
            addPageNumberButton(totalPages);
        }
    }

    // Add a page number button to the pagination
    function addPageNumberButton(pageNum) {
        const pageButton = document.createElement('div');
        pageButton.className = `page-number ${pageNum === currentPage ? 'active' : ''}`;
        pageButton.textContent = pageNum;
        pageButton.addEventListener('click', () => goToPage(pageNum));
        pageNumbers.appendChild(pageButton);
    }

    // Add ellipsis to pagination
    function addEllipsis() {
        const ellipsis = document.createElement('div');
        ellipsis.className = 'page-number';
        ellipsis.textContent = '...';
        ellipsis.style.cursor = 'default';
        pageNumbers.appendChild(ellipsis);
    }

    // Go to specified page
    function goToPage(pageNum) {
        currentPage = pageNum;
        renderTable();
        updatePagination();
        // Scroll to top of table
        document.querySelector('.table-container').scrollIntoView({ behavior: 'smooth' });
    }

    // These functions will be defined globally to handle row actions
    window.viewMember = function(id) {
        window.location.href = `/member/${id}/`;
    };

    window.editMember = function(id) {
        window.location.href = `/edit_member/${id}/`;
    };

    window.deleteMember = function(id) {
        if (confirm('Are you sure you want to delete this member?')) {
            fetch(`/api/members/${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // Remove member from lists and re-render
                allMembers = allMembers.filter(member => member.id !== id);
                filteredMembers = filteredMembers.filter(member => member.id !== id);
                renderTable();
                updatePagination();

                // Show success message
                const message = document.createElement('div');
                message.className = 'status-message';
                message.textContent = 'Member deleted successfully.';
                document.querySelector('.section-header').after(message);

                // Remove message after 3 seconds
                setTimeout(() => {
                    message.remove();
                }, 3000);
            })
            .catch(error => {
                console.error('Error deleting member:', error);
                alert('Failed to delete member. Please try again.');
            });
        }
    };

    // Helper function to get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});