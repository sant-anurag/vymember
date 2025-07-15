document.addEventListener('DOMContentLoaded', function() {
    console.log("All instructors page loaded");
    console.log('DOM loaded');
    const countrySelect = document.getElementById('modalCountry');
    const stateSelect = document.getElementById('modalState');
    const districtSelect = document.getElementById('modalCity');

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
            });
    });

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
            });
    });
    // Set up event listeners for filters
    setupFilters();

    // Set up event listeners for action buttons
    //setupActionButtons();

    // Set up download button
    setupDownloadButton();
});
// Add at the top or after DOMContentLoaded
let currentInstructorId = null;
let isEditMode = false;

function openInstructorModal(data, editMode = false) {
    isEditMode = editMode;
    currentInstructorId = data.id;
    console.log("Opening instructor modal with data:", data, "Edit mode:", editMode);
    document.getElementById('modalTitle').textContent = editMode ? 'Edit Instructor' : 'Instructor Details';
    document.getElementById('modalName').value = data.name || '';
    document.getElementById('modalNumber').value = data.number || '';
    document.getElementById('modalAge').value = data.age || '';
    document.getElementById('modelGender').value = data.gender || '';
    document.getElementById('modalAssociated').value = data.associated_since || '';
    document.getElementById('modalUpdeshta').value = data.updeshta_since || '';
    document.getElementById('modalAddress').value = data.address || '';
    document.getElementById('modalCountry').value = data.country || '';
    document.getElementById('modalState').value = data.state_name || '';
    document.getElementById('modalCity').value = data.district_name || '';
    document.getElementById('modalActive').value = data.is_active != null ? data.is_active : '1';

    // Enable/disable fields
    [
        'modalName','modalNumber', 'modalAge', 'modalAssociated','modelGender',
        'modalUpdeshta', 'modalAddress', 'modalCountry','modalState','modalCity','modalActive'
    ].forEach(id => {
        document.getElementById(id).disabled = !editMode;
    });

    document.getElementById('modalSaveBtn').style.display = editMode ? '' : 'none';
    document.getElementById('instructorModal').style.display = 'flex';
}

function closeInstructorModal() {
    document.getElementById('instructorModal').style.display = 'none';
    currentInstructorId = null;
    isEditMode = false;
}

// View button
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const instructorId = this.getAttribute('data-id');
        fetch(`/member/api/instructors/${instructorId}/`)
            .then(r => r.json())
            .then(data => openInstructorModal(data, false))
            .catch(() => alert('Failed to load instructor details.'));
    });
});



// Close button
document.getElementById('modalCloseBtn').addEventListener('click', closeInstructorModal);
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
// Save button

function setupFilters() {
    const yearFilter = document.getElementById('yearFilter');
    const updeshtaFilter = document.getElementById('updeshtaFilter');
    const ageFilter = document.getElementById('ageFilter');
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
            if (yearFilter) yearFilter.value = '';
            if (updeshtaFilter) updeshtaFilter.value = '';
            if (ageFilter) ageFilter.value = '';
            if (searchInput) searchInput.value = '';

            // Show all rows
            const rows = document.querySelectorAll('#instructorsTable tbody tr');
            rows.forEach(row => {
                row.style.display = '';
            });
        });
    }
}

function filterTable() {
    const yearValue = document.getElementById('yearFilter').value;
    const updeshtaValue = document.getElementById('updeshtaFilter').value;
    const ageFilter = document.getElementById('ageFilter').value;
    const searchValue = document.getElementById('searchInput').value.toLowerCase();

    const rows = document.querySelectorAll('#instructorsTable tbody tr');

    rows.forEach(row => {
        if (row.cells.length <= 1) return; // Skip "No instructors found" row

        const nameCell = row.cells[0].textContent.toLowerCase();
        const ageCell = row.cells[1].textContent;
        const associatedCell = row.cells[3].textContent;
        const updeshtaCell = row.cells[4].textContent;
        const addressCell = row.cells[5].textContent.toLowerCase();

        // Check each filter condition
        const yearMatch = !yearValue || associatedCell.includes(yearValue);
        const updeshtaMatch = !updeshtaValue || updeshtaCell.includes(updeshtaValue);

        // Age range filter
        let ageMatch = true;
        if (ageFilter) {
            const age = parseInt(ageCell);
            if (!isNaN(age)) {
                if (ageFilter === '20-30') {
                    ageMatch = age >= 20 && age <= 30;
                } else if (ageFilter === '31-40') {
                    ageMatch = age >= 31 && age <= 40;
                } else if (ageFilter === '41-50') {
                    ageMatch = age >= 41 && age <= 50;
                } else if (ageFilter === '51+') {
                    ageMatch = age >= 51;
                }
            }
        }

        // Search in name or address
        const searchMatch = !searchValue ||
                           nameCell.includes(searchValue) ||
                           addressCell.includes(searchValue);

        // Show/hide the row based on all filters combined
        row.style.display = (yearMatch && updeshtaMatch && ageMatch && searchMatch) ? '' : 'none';
    });

    // Check if any visible rows remain
    const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');

    if (visibleRows.length === 0) {
        // If no rows match the filter, show a "No results" message
        const tbody = document.querySelector('#instructorsTable tbody');

        // Check if we already have a no-results row
        const noResultsRow = Array.from(rows).find(row => row.classList.contains('no-results-row'));

        if (!noResultsRow) {
            // Create a new row for "No results" message
            const newRow = document.createElement('tr');
            newRow.classList.add('no-results-row');
            newRow.innerHTML = '<td colspan="8" class="text-center">No instructors match the selected filters</td>';
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


function viewInstructorDetails(id) {
    // Fetch instructor details from API
    fetch(`/member/api/instructors/${id}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch instructor details');
            }
            return response.json();
        })
        .then(instructor => {
            console.log('Instructor details:', instructor);
            // Create a modal to display instructor details
            // This is a placeholder - you would implement a modal here
            alert(`Instructor Details:\nName: ${instructor.name}\nAge: ${instructor.age}\nAddress: ${instructor.address}`);
        })
        .catch(error => {
            console.error('Error fetching instructor details:', error);
            alert('Error loading instructor details. Please try again.');
        });
}

function setupDownloadButton() {
    const downloadBtn = document.getElementById('downloadExcel');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadTableAsExcel);
    }
}

function downloadTableAsExcel() {
    // Get the table
    const table = document.getElementById('instructorsTable');
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
    XLSX.utils.book_append_sheet(wb, ws, 'Instructors');

    // Generate Excel file and trigger download
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const fileName = `instructors_export_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);
}