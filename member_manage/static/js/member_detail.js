// static/js/member_detail.js

document.addEventListener('DOMContentLoaded', function() {
    setupDetailButtons();
});

function setupDetailButtons() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            openMemberDetail(memberId, 'view');
        });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            openMemberDetail(memberId, 'edit');
        });
    });
}

function openMemberDetail(memberId, mode) {
    let overlay = document.querySelector('.member-detail-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'member-detail-overlay';
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = '<div class="loader"></div>';
    overlay.style.display = 'flex';

    fetch(`/member/api/member/${memberId}/`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch member details');
            return response.json();
        })
        .then(member => {
            renderMemberDetail(overlay, member, mode);
            if (mode === 'edit') {
                setupCascadingDropdowns(member);
            }
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
                            <input type="text" id="memberAge" name="age" value="${member.age || ''}" ${isViewMode ? 'readonly' : ''}>
                        </div>
                        <div class="form-group">
                            <label for="memberGender">Gender</label>
                            <input type="text" id="memberGender" name="gender" value="${member.gender || ''}" ${isViewMode ? 'readonly' : ''}>
                        </div>
                        <div class="form-group">
                            <label for="memberEvent">Event</label>
                            <input type="text" id="memberEvent" name="event_name" value="${member.event_name || ''}" ${isViewMode ? 'readonly' : ''}>
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
                            ${generateCountrySelect(member, isViewMode)}
                        </div>
                        <div class="form-group">
                            <label for="memberState">State</label>
                            ${generateStateSelect(member, isViewMode)}
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="memberDistrict">District</label>
                            ${generateDistrictSelect(member, isViewMode)}
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

    if (!isViewMode) {
        // Populate selects after rendering
        populateCountrySelect(member.country_id);
        setTimeout(() => populateStateSelect(member.country_id, member.state_id), 0);
        setTimeout(() => populateDistrictSelect(member.state_id, member.district_id), 0);
    }
}

function generateCountrySelect(member, isViewMode) {
    if (isViewMode) {
        return `<input type="text" value="${member.country || 'N/A'}" readonly>
                <input type="hidden" name="country" value="${member.country_id || ''}">`;
    }
    return `<select id="memberCountry" name="country"><option>Loading...</option></select>`;
}

function generateStateSelect(member, isViewMode) {
    if (isViewMode) {
        return `<input type="text" value="${member.state || 'N/A'}" readonly>
                <input type="hidden" name="state" value="${member.state_id || ''}">`;
    }
    return `<select id="memberState" name="state"><option>Loading...</option></select>`;
}

function generateDistrictSelect(member, isViewMode) {
    if (isViewMode) {
        return `<input type="text" value="${member.district || 'N/A'}" readonly>
                <input type="hidden" name="district" value="${member.district_id || ''}">`;
    }
    return `<select id="memberDistrict" name="district"><option>Loading...</option></select>`;
}

function populateCountrySelect(selectedId) {
    fetch('/member/ajax/countries/')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('memberCountry');
            select.innerHTML = '<option value="">Select Country</option>';
                data.countries.forEach(c => {
                    select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
                });
                if (selectedId) select.value = selectedId;
                if (callback) callback();
            });
}

function populateStateSelect(countryId, selectedId) {

    if (!countryId) {
            document.getElementById('memberState').innerHTML = '<option value="">Select State</option>';
            if (callback) callback();
            return;
        }
        fetch(`/member/ajax/states/?country_id=${countryId}`)
            .then(res => res.json())
            .then(data => {
                const select = document.getElementById('memberState');
                select.innerHTML = '<option value="">Select State</option>';
                data.states.forEach(s => {
                    select.innerHTML += `<option value="${s.id}">${s.name}</option>`;
                });
                if (selectedId) select.value = selectedId;
                if (callback) callback();
            });
    }

function populateDistrictSelect(stateId, selectedId) {
    if (!stateId) {
            document.getElementById('memberDistrict').innerHTML = '<option value="">Select City</option>';
            return;
        }
        fetch(`/member/ajax/cities/?state_id=${stateId}`)
            .then(res => res.json())
            .then(data => {
                const select = document.getElementById('memberDistrict');
                select.innerHTML = '<option value="">Select City</option>';
                data.cities.forEach(c => {
                    select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
                });
                if (selectedId) select.value = selectedId;
            });
    }

function setupCascadingDropdowns(member) {
    const countrySelect = document.getElementById('memberCountry');
    const stateSelect = document.getElementById('memberState');
    const districtSelect = document.getElementById('memberDistrict');

    if (countrySelect) {
        countrySelect.addEventListener('change', function() {
            populateStateSelect(this.value, null);
            if (districtSelect) districtSelect.innerHTML = '<option value="">-- Select City --</option>';
        });
    }
    if (stateSelect) {
        stateSelect.addEventListener('change', function() {
            populateDistrictSelect(this.value, null);
        });
    }
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

    const csrfToken = getCsrfToken();
    const loader = document.createElement('div');
    loader.className = 'loader';
    form.appendChild(loader);

    fetch(`/member/api/member/${memberId}/update/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(memberData)
    })
    .then(response => {
        if (loader) loader.remove();
        if (!response.ok) throw new Error('Failed to update member details');
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showFormSuccess('Member updated successfully');
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } else {
            showFormError(data.error || 'Failed to update member');
        }
    })
    .catch(error => {
        if (loader) loader.remove();
        console.error('Error updating member details:', error);
        showFormError('Error updating member details. Please try again.');
    });
}

function showFormError(message) {
    const form = document.getElementById('memberDetailForm');
    if (!form) return;
    const existingAlert = form.querySelector('.form-alert');
    if (existingAlert) existingAlert.remove();
    const errorAlert = document.createElement('div');
    errorAlert.className = 'form-alert error';
    errorAlert.textContent = message;
    form.prepend(errorAlert);
    setTimeout(() => { errorAlert.remove(); }, 5000);
}

function showFormSuccess(message) {
    const form = document.getElementById('memberDetailForm');
    if (!form) return;
    const existingAlert = form.querySelector('.form-alert');
    if (existingAlert) existingAlert.remove();
    const successAlert = document.createElement('div');
    successAlert.className = 'form-alert success';
    successAlert.textContent = message;
    form.prepend(successAlert);
    setTimeout(() => { successAlert.remove(); }, 5000);
}

function getCsrfToken() {
    return document.querySelector('input[name="csrfmiddlewaretoken"]')?.value ||
           document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1] || '';
}