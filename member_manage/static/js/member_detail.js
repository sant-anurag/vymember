// static/js/member_detail.js
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners for action buttons
    // Set up the CSRF token for all AJAX requests

    setupDetailButtons();
});

function setupDetailButtons() {
    // View button action
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            openMemberDetail(memberId, 'view');
        });
    });

    // Edit button action
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            openMemberDetail(memberId, 'edit');
        });
    });
}

function openMemberDetail(memberId, mode) {
    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.member-detail-overlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'member-detail-overlay';
        document.body.appendChild(overlay);
    }

    // Show loading state
    overlay.innerHTML = '<div class="loader"></div>';
    overlay.style.display = 'flex';

    // Fetch member data
    fetch(`/member/api/member/${memberId}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch member details');
            }
            return response.json();
        })
        .then(member => {
            renderMemberDetail(overlay, member, mode);
        })
        .catch(error => {
            console.error('Error fetching member details:', error);
            overlay.innerHTML = `
                <div class="member-detail-modal error-modal">
                    <div class="modal-header">
                        <h3>Error</h3>
                        <button class="close-btn" onclick="closeMemberDetail()">×</button>
                    </div>
                    <div class="modal-body">
                        <p>Failed to load member details. Please try again.</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn primary-btn" onclick="closeMemberDetail()">Close</button>
                    </div>
                </div>
            `;
        });
}

function renderMemberDetail(overlay, member, mode) {
    const isViewMode = mode === 'view';
    const modalTitle = isViewMode ? 'Member Details' : 'Edit Member';

    const formattedDate = member.date_of_initiation ? new Date(member.date_of_initiation).toISOString().split('T')[0] : '';

    overlay.innerHTML = `
        <div class="member-detail-modal">
            <div class="modal-header">
                <h3>${modalTitle}</h3>
                <button class="close-btn" onclick="closeMemberDetail()">×</button>
            </div>
            <div class="modal-body">
                <form id="memberDetailForm" class="member-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="memberName">Name</label>
                            <input type="text" id="memberName" name="name" value="${member.name || ''}" ${isViewMode ? 'readonly' : ''}>
                        </div>
                        <div class="form-group">
                            <label for="memberNumber">Number</label>
                            <input type="text" id="memberNumber" name="number" value="${member.number || ''}" ${isViewMode ? 'readonly' : ''}>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="memberEmail">Email</label>
                            <input type="email" id="memberEmail" name="email" value="${member.email || ''}" ${isViewMode ? 'readonly' : ''}>
                        </div>
                        <div class="form-group">
                            <label for="memberCompany">Company</label>
                            <input type="text" id="memberCompany" name="company" value="${member.company || ''}" ${isViewMode ? 'readonly' : ''}>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="memberAge">Age</label>
                            <input type="text" id="memberAge" name="memberAge" value="${member.age || ''}" ${isViewMode ? 'readonly' : ''}>
                        </div>
                        <div class="form-group">
                            <label for="memberGender">Gender</label>
                            <input type="text" id="memberGender" name="memberGender" value="${member.gender || ''}" ${isViewMode ? 'readonly' : ''}>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="memberInstructor">Instructor</label>
                            ${generateInstructorSelect(member, isViewMode)}
                        </div>
                        <div class="form-group">
                            <label for="memberInitiationDate">Date of Initiation</label>
                            <input type="date" id="memberInitiationDate" name="date_of_initiation" value="${formattedDate}" ${isViewMode ? 'readonly' : ''}>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="memberCountry">Country</label>
                            <input type="text" id="memberCountry" name="country" value="${member.country || ''}" ${isViewMode ? 'readonly' : ''}>
                        </div>
                        <div class="form-group">
                            <label for="memberState">State</label>
                            <input type="text" id="memberState" name="state" value="${member.state || ''}" ${isViewMode ? 'readonly' : ''}>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="memberDistrict">District</label>
                            <input type="text" id="memberDistrict" name="district" value="${member.district || ''}" ${isViewMode ? 'readonly' : ''}>
                        </div>
                        <div class="form-group">
                            <label for="memberAddress">Address</label>
                            <input type="text" id="memberAddress" name="address" value="${member.address || ''}" ${isViewMode ? 'readonly' : ''}>
                        </div>
                    </div>

                    <div class="form-row full-width">
                        <div class="form-group">
                            <label for="memberNotes">Notes</label>
                            <textarea id="memberNotes" name="notes" rows="3" ${isViewMode ? 'readonly' : ''}>${member.notes || ''}</textarea>
                        </div>
                    </div>

                    <input type="hidden" name="id" value="${member.id}">
                </form>
            </div>
            <div class="modal-footer">
                ${isViewMode ?
                    `<button class="btn primary-btn" onclick="closeMemberDetail()">Close</button>`
                    :
                    `<button class="btn primary-btn" onclick="saveMemberChanges(${member.id})">Save Changes</button>
                     <button class="btn cancel-btn" onclick="closeMemberDetail()">Cancel</button>`
                }
            </div>
        </div>
    `;
}

function generateInstructorSelect(member, isViewMode) {
    if (isViewMode) {
        return `<input type="text" value="${member.instructor_name || 'N/A'}" readonly>
                <input type="hidden" name="instructor_id" value="${member.instructor_id || ''}">`;
    }

    let options = '';
    if (member.instructors && member.instructors.length > 0) {
        options = member.instructors.map(instructor => {
            const selected = instructor.id === member.instructor_id ? 'selected' : '';
            return `<option value="${instructor.id}" ${selected}>${instructor.name}</option>`;
        }).join('');
    }

    return `
        <select id="memberInstructor" name="instructor_id">
            <option value="">-- Select Instructor --</option>
            ${options}
        </select>
    `;
}

function closeMemberDetail() {
    const overlay = document.querySelector('.member-detail-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function saveMemberChanges(memberId) {
    const form = document.getElementById('memberDetailForm');
    if (!form) return;

    // Create an object to hold the form data
    const memberData = {
        name: document.getElementById('memberName').value,
        number: document.getElementById('memberNumber').value,
        email: document.getElementById('memberEmail').value,
        age: document.getElementById('memberAge').value,
        gender: document.getElementById('memberGender').value,
        company: document.getElementById('memberCompany').value,
        instructor_id: document.getElementById('memberInstructor').value,
        date_of_initiation: document.getElementById('memberInitiationDate').value,
        address: document.getElementById('memberAddress').value,
        country: document.getElementById('memberCountry').value,
        state: document.getElementById('memberState').value,
        district: document.getElementById('memberDistrict').value,
        notes: document.getElementById('memberNotes').value
    };

    // Get CSRF token
    const csrfToken = getCsrfToken();

    // Show loading indicator
    const loader = document.createElement('div');
    loader.className = 'loader';
    form.appendChild(loader);

    // Send update request
    fetch(`/member/api/member/${memberId}/update/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(memberData)
    })
    .then(response => {
        // Remove loader
        if (loader) loader.remove();

        if (!response.ok) {
            throw new Error('Failed to update member details');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showFormSuccess('Member updated successfully');
            setTimeout(() => {
                window.location.reload();
            }, 3000); // Reload after 3 seconds
        } else {
            showFormError(data.error || 'Failed to update member');
        }
    })
    .catch(error => {
        // Remove loader if still present
        if (loader) loader.remove();

        console.error('Error updating member details:', error);
        showFormError('Error updating member details. Please try again.');
    });
}

function showFormError(message) {
    const form = document.getElementById('memberDetailForm');
    if (!form) return;

    // Remove any existing alerts
    const existingAlert = form.querySelector('.form-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create and add error alert
    const errorAlert = document.createElement('div');
    errorAlert.className = 'form-alert error';
    errorAlert.textContent = message;
    form.prepend(errorAlert);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorAlert.remove();
    }, 5000);
}

function showFormSuccess(message) {
    const form = document.getElementById('memberDetailForm');
    if (!form) return;

    // Remove any existing alerts
    const existingAlert = form.querySelector('.form-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create and add success alert
    const successAlert = document.createElement('div');
    successAlert.className = 'form-alert success';
    successAlert.textContent = message;
    form.prepend(successAlert);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        successAlert.remove();
    }, 5000);
}
 function getCsrfToken() {
        return document.querySelector('input[name="csrfmiddlewaretoken"]')?.value ||
               document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1] || '';
    }