document.addEventListener('DOMContentLoaded', function() {
    // Add/Remove member row logic
    const addBtn = document.getElementById('addMemberBtn');
    const removeBtn = document.getElementById('removeMemberBtn');
    const rowsContainer = document.getElementById('attendanceRows');
    const resetBtn = document.getElementById('resetRegisterBtn');
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    let rowCount = 0;

    function createMemberRow() {
        rowCount++;
        const row = document.createElement('div');
        row.className = 'attendance-row';
        row.innerHTML = `
            <input type="text" name="name_${rowCount}" placeholder="Name" required />
            <input type="number" name="age_${rowCount}" placeholder="Age" min="0" required />
            <input type="text" name="contact_${rowCount}" placeholder="Contact Number" required />
            <select name="gender_${rowCount}" required>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
            <input type="text" name="address_${rowCount}" placeholder="Address" required />
            <label style="display: flex; align-items: center; gap: 0.3rem;">
                <input type="checkbox" class="new-member-checkbox" name="new_member_${rowCount}" value="1" />
                New
            </label>
        `;
        rowsContainer.appendChild(row);
    }

    if (addBtn) addBtn.onclick = createMemberRow;
    if (removeBtn) removeBtn.onclick = function() {
        if (rowsContainer.lastChild) {
            rowsContainer.removeChild(rowsContainer.lastChild);
            rowCount = Math.max(0, rowCount - 1);
        }
    };
    if (resetBtn) resetBtn.onclick = function() {
        rowsContainer.innerHTML = '';
        rowCount = 0;
    };
    if (resetFilterBtn) resetFilterBtn.onclick = function() {
        document.getElementById('event_id').selectedIndex = 0;
        document.getElementById('eventFilterForm').submit();
    };
    if (downloadBtn) downloadBtn.onclick = function() {
        // do csv export
        // For simplicity, we will just print the page.
        // In a real application, you would implement CSV export logic here.
        const rows = Array.from(rowsContainer.querySelectorAll('.attendance-row'));
        if (rows.length === 0) {
            alert('No attendance records to download.');
            return;
        }
        const csvContent = rows.map(row => {
            const inputs = row.querySelectorAll('input, select');
            return Array.from(inputs).map(input => input.value).join(',');
        }).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'attendance_records.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        // For printing, you can use:
        // This will open the print dialog, allowing the user to save as PDF.
        // This is a simple way to print the current page.

        //window.print(); // Simple print as PDF, can be replaced with CSV export
    };

    // Add one row by default if form is present
    if (addBtn && rowsContainer.childElementCount === 0) {
        createMemberRow();
    }
});