// On page load, use updateFilteredRowsAndPaginate instead of paginateTable
document.addEventListener('DOMContentLoaded', function() {
    console.log("All members page loaded");
    setupFilters();
    setupDownloadButton();
    updateFilteredRowsAndPaginate();
    setupPaginationEvents && setupPaginationEvents();
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

    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', filterTable);
    }

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
            updateFilteredRowsAndPaginate();
        });
    }
}

// --- Replace your filterTable function with this: ---
function filterTable() {
    const companyValue = document.getElementById('companyFilter').value.toLowerCase();
    const instructorValue = document.getElementById('instructorFilter').selectedOptions[0]?.textContent.toLowerCase();
    const dateValue = document.getElementById('dateFilter').value;
    const searchValue = document.getElementById('searchInput').value.toLowerCase();

    const rows = document.querySelectorAll('#membersTable tbody tr');

    rows.forEach(row => {
        if (row.cells.length <= 1) return; // Skip "No members found" row

        const companyCell = row.cells[5].textContent.toLowerCase();
        const instructorNameCell = row.cells[6].textContent.toLowerCase();
        const dateCell = row.cells[8].textContent;
        const nameCell = row.cells[0].textContent.toLowerCase();
        const numberCell = row.cells[1].textContent.toLowerCase();
        const emailCell = row.cells[2].textContent.toLowerCase();

        // Company filter (exact match or empty)
        const companyMatch = !companyValue || companyCell === companyValue;

        // Instructor filter (by name, not id)
        const instructorMatch = !instructorValue || instructorValue === 'all instructors' || instructorNameCell === instructorValue;

        // Date filter (exact match or empty)
        const dateMatch = !dateValue || dateCell.startsWith(dateValue);

        // Search in name, number, or email
        const searchMatch = !searchValue ||
            nameCell.includes(searchValue) ||
            numberCell.includes(searchValue) ||
            emailCell.includes(searchValue);

        row.style.display = (companyMatch && instructorMatch && dateMatch && searchMatch) ? '' : 'none';
    });

    // Handle "No results" row
    const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
    const tbody = document.querySelector('#membersTable tbody');
    let noResultsRow = Array.from(rows).find(row => row.classList.contains('no-results-row'));

    if (visibleRows.length === 0) {
        if (!noResultsRow) {
            noResultsRow = document.createElement('tr');
            noResultsRow.classList.add('no-results-row');
            noResultsRow.innerHTML = '<td colspan="14" class="text-center">No members match the selected filters</td>';
            tbody.appendChild(noResultsRow);
        }
        noResultsRow.style.display = '';
    } else if (noResultsRow) {
        noResultsRow.style.display = 'none';
    }

    updateFilteredRowsAndPaginate();
}

// --- Update updateFilteredRowsAndPaginate to always reset to page 1 ---
function updateFilteredRowsAndPaginate() {
    allRows = Array.from(document.querySelectorAll('#membersTable tbody tr'))
        .filter(row => row.style.display !== 'none' && !row.classList.contains('no-results-row'));
    totalPages = Math.ceil(allRows.length / ROWS_PER_PAGE) || 1;
    currentPage = 1;
    showPage(currentPage);
    renderPaginationBar();
}

// On page load, after DOMContentLoaded, call paginateTable() as before.

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

// --- Pagination Logic ---
const ROWS_PER_PAGE = 10;
let currentPage = 1;
let totalPages = 1;
let allRows = [];

function paginateTable() {
    const table = document.getElementById('membersTable');
    if (!table) return;
    // Always get all rows except the "no-results-row"
    allRows = Array.from(table.querySelectorAll('tbody tr')).filter(row =>
        !row.classList.contains('no-results-row')
    );
    totalPages = Math.ceil(allRows.length / ROWS_PER_PAGE) || 1;
    showPage(currentPage);
    renderPaginationBar();
}

function showPage(page) {
    currentPage = page;
    // Hide all rows first
    allRows.forEach(row => row.style.display = 'none');
    // Show only the rows for the current page
    const startIdx = (page - 1) * ROWS_PER_PAGE;
    const endIdx = page * ROWS_PER_PAGE;
    allRows.slice(startIdx, endIdx).forEach(row => row.style.display = '');
    // Handle "No members found" row
    const noResultsRow = document.querySelector('.no-results-row');
    if (noResultsRow) {
        noResultsRow.style.display = allRows.length === 0 ? '' : 'none';
    }
}

function renderPaginationBar() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    // Prev button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = 'Prev';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { if (currentPage > 1) { showPage(currentPage - 1); renderPaginationBar(); } };
    pagination.appendChild(prevBtn);

    // Page numbers (show max 5 at a time)
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        btn.textContent = i;
        btn.onclick = () => { showPage(i); renderPaginationBar(); };
        pagination.appendChild(btn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { if (currentPage < totalPages) { showPage(currentPage + 1); renderPaginationBar(); } };
    pagination.appendChild(nextBtn);
}