document.addEventListener('DOMContentLoaded', function() {
    console.log("All members page loaded");

    // Set up event listeners for filters
    setupFilters();

    // Set up event listeners for action buttons
    setupActionButtons();

    // Set up download button
    setupDownloadButton();
});


function setupDownloadButton() {
    const downloadBtn = document.getElementById('downloadExcel');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadTableAsExcel);
    }
}


function downloadTableAsExcel() {
    // Get the table
    const table = document.getElementById('membersTable');
    if (!table) return;

    // Create a workbook
    const XLSX = window.XLSX;
    if (!XLSX) {
        // If XLSX is not available, add the library dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        script.onload = function() {
            // Retry after loading the library
            downloadTableAsExcel();
        };
        document.head.appendChild(script);
        return;
    }

    // Get only visible rows (respecting filters)
    const rows = Array.from(table.querySelectorAll('tbody tr')).filter(row =>
        row.style.display !== 'none' && !row.classList.contains('no-results-row')
    );

    if (rows.length === 0) {
        alert('No data to export. Please adjust your filters.');
        return;
    }

    // Get headers
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());

    // Remove the "Actions" column
    const actionColumnIndex = headers.findIndex(header => header === 'Actions');
    if (actionColumnIndex !== -1) {
        headers.splice(actionColumnIndex, 1);
    }

    // Create data array
    const data = [headers];

    // Add rows data
    rows.forEach(row => {
        const rowData = Array.from(row.cells).map(cell => cell.textContent.trim());
        // Remove the actions cell
        if (actionColumnIndex !== -1) {
            rowData.splice(actionColumnIndex, 1);
        }
        data.push(rowData);
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    const colWidths = headers.map(h => ({ wch: Math.max(h.length, 15) }));
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');

    // Generate Excel file and trigger download
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const fileName = `members_export_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);
}

function setupFilters() {
    const companyFilter = document.getElementById('companyFilter');
    const instructorFilter = document.getElementById('instructorFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchInput = document.getElementById('searchInput');
    const applyFilterBtn = document.getElementById('applyFilter');
    const resetFilterBtn = document.getElementById('resetFilter');

    // Apply filters when the button is clicked
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', filterTable);
    }

    // Reset filters when reset button is clicked
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', function() {
            if (companyFilter) companyFilter.value = '';
            if (instructorFilter) instructorFilter.value = '';
            if (dateFilter) dateFilter.value = '';
            if (searchInput) searchInput.value = '';

            // Show all rows
            const rows = document.querySelectorAll('#membersTable tbody tr');
            rows.forEach(row => {
                row.style.display = '';
            });
        });
    }
}

function filterTable() {
    const companyValue = document.getElementById('companyFilter').value.toLowerCase();
    const instructorValue = document.getElementById('instructorFilter').value.toLowerCase();
    const dateValue = document.getElementById('dateFilter').value;
    const searchValue = document.getElementById('searchInput').value.toLowerCase();

    const rows = document.querySelectorAll('#membersTable tbody tr');

    rows.forEach(row => {
        if (row.cells.length <= 1) return; // Skip "No members found" row

        const companyCell = row.cells[3].textContent.toLowerCase();
        const instructorNameCell = row.cells[4].textContent.toLowerCase();
        const dateCell = row.cells[5].textContent;
        const nameCell = row.cells[0].textContent.toLowerCase();
        const numberCell = row.cells[1].textContent.toLowerCase();
        const emailCell = row.cells[2].textContent.toLowerCase();

        // Check each filter condition
        const companyMatch = !companyValue || companyCell.includes(companyValue);

        const instructorMatch = !instructorValue ||
                               instructorNameCell.includes(instructorValue) ||
                               row.querySelector('.view-btn')?.getAttribute('data-id') === instructorValue;

        // Format date for comparison
        const dateMatch = !dateValue || dateCell.includes(dateValue);

        // Search in name, number, or email
        const searchMatch = !searchValue ||
                           nameCell.includes(searchValue) ||
                           numberCell.includes(searchValue) ||
                           emailCell.includes(searchValue);

        // Show/hide the row based on all filters combined
        row.style.display = (companyMatch && instructorMatch && dateMatch && searchMatch) ? '' : 'none';
    });

    // Check if any visible rows remain
    const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');

    if (visibleRows.length === 0) {
        // If no rows match the filter, show a "No results" message
        const tbody = document.querySelector('#membersTable tbody');

        // Check if we already have a no-results row
        const noResultsRow = Array.from(rows).find(row => row.classList.contains('no-results-row'));

        if (!noResultsRow) {
            // Create a new row for "No results" message
            const newRow = document.createElement('tr');
            newRow.classList.add('no-results-row');
            newRow.innerHTML = '<td colspan="7" class="text-center">No members match the selected filters</td>';
            tbody.appendChild(newRow);
        } else {
            // Show the existing no-results row
            noResultsRow.style.display = '';
        }
    } else {
        // If we have results, hide any "No results" message
        const noResultsRow = document.querySelector('.no-results-row');
        if (noResultsRow) {
            noResultsRow.style.display = 'none';
        }
    }
}

function setupActionButtons() {
    // View button action
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            console.log(`View member ${memberId}`);
            // Implement view functionality - could open a modal with member details
            viewMemberDetails(memberId);
        });
    });

    // Edit button action
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            console.log(`Edit member ${memberId}`);
            // Implement edit functionality - could redirect to an edit page
            // window.location.href = `/edit_member/${memberId}/`;
        });
    });

    // Delete button action
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            console.log(`Delete member ${memberId}`);
            if (confirm('Are you sure you want to delete this member?')) {
                deleteMember(memberId);
            }
        });
    });
}

function deleteMember(id) {
    fetch(`/api/members/${id}/`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete member');
        }
        return response.json();
    })
    .then(data => {
        console.log('Member deleted successfully:', data);
        // Remove the row from the table
        const row = document.querySelector(`.delete-btn[data-id="${id}"]`).closest('tr');
        row.remove();

        // Show success message
        const table = document.getElementById('membersTable');
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = 'Member deleted successfully';
        table.parentNode.insertBefore(successMsg, table);

        // Remove the message after 3 seconds
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
    })
    .catch(error => {
        console.error('Error deleting member:', error);
        alert('Error deleting member. Please try again.');
    });
}

function viewMemberDetails(id) {
    // Fetch member details from API
    fetch(`/api/members/${id}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch member details');
            }
            return response.json();
        })
        .then(member => {
            console.log('Member details:', member);
            // Create and show a modal with member details
            // This is a placeholder for the actual implementation
        })
        .catch(error => {
            console.error('Error fetching member details:', error);
            alert('Error loading member details. Please try again.');
        });
}