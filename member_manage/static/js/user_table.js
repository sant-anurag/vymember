document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const searchInput = document.getElementById('userSearchInput');
    const userTable = document.getElementById('userTable');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const downloadBtn = document.getElementById('downloadUserListBtn');

    if (!userTable) return; // Exit if table doesn't exist

    const userRows = userTable.querySelectorAll('tbody tr');

    // Search/filter functionality
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        let visibleCount = 0;

        userRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Handle "No users found" message
        const tbody = userTable.querySelector('tbody');
        const noDataRow = tbody.querySelector('.no-data-row');

        if (visibleCount === 0 && !noDataRow) {
            const newRow = document.createElement('tr');
            newRow.classList.add('no-data-row');
            const cell = document.createElement('td');
            cell.setAttribute('colspan', '5');
            cell.classList.add('text-center');
            cell.textContent = 'No users found';
            newRow.appendChild(cell);
            tbody.appendChild(newRow);
        } else if (visibleCount > 0 && noDataRow) {
            noDataRow.remove();
        }

        // Update pagination info
        updatePaginationInfo(visibleCount);
    }

    // Add event listeners for search and filter
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                filterTable();
            }
        });
    }

    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', filterTable);
    }

    // Download functionality
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            // Get visible rows
            const visibleRows = Array.from(userRows).filter(row => row.style.display !== 'none');

            if (visibleRows.length === 0) {
                alert('No data to download');
                return;
            }

            // Create CSV content
            let csvContent = 'Username,Email,Admin Status,Created On\n';

            visibleRows.forEach(row => {
                const columns = row.querySelectorAll('td');
                const username = columns[0].textContent.trim();
                const email = columns[1].textContent.trim();
                const adminStatus = columns[2].textContent.trim();
                const createdOn = columns[3].textContent.trim();

                // Escape quotes in data to avoid CSV format issues
                const escapedRow = [
                    `"${username.replace(/"/g, '""')}"`,
                    `"${email.replace(/"/g, '""')}"`,
                    `"${adminStatus.replace(/"/g, '""')}"`,
                    `"${createdOn.replace(/"/g, '""')}"`
                ];

                csvContent += escapedRow.join(',') + '\n';
            });

            // Create and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `user_list_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);

            // Trigger download
            link.click();

            // Clean up
            document.body.removeChild(link);
        });
    }

    // Update pagination info function
    function updatePaginationInfo(visibleCount) {
        const startRecord = document.getElementById('startRecord');
        const endRecord = document.getElementById('endRecord');
        const totalRecords = document.getElementById('totalRecords');

        if (startRecord && endRecord && totalRecords) {
            if (visibleCount === 0) {
                startRecord.textContent = "0";
                endRecord.textContent = "0";
            } else {
                startRecord.textContent = "1";
                endRecord.textContent = visibleCount.toString();
            }
            totalRecords.textContent = visibleCount.toString();
        }
    }


});