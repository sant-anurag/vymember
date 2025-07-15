// member_manage/static/js/edit_instructor_modal.js

document.addEventListener('DOMContentLoaded', function () {
    console.log('Edit Instructor Modal JS Loaded');
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const instructorId = this.getAttribute('data-id');
            openEditInstructorModal(instructorId);
        });
    });

    document.getElementById('editModalCloseBtn').onclick =
        document.getElementById('editModalCancelBtn').onclick = closeEditInstructorModal;

    // Populate country dropdown
    function populateCountries(selectedId, callback) {
        fetch('/member/ajax/countries/')
            .then(res => res.json())
            .then(data => {
                const select = document.getElementById('editModalCountry');
                select.innerHTML = '<option value="">Select Country</option>';
                data.countries.forEach(c => {
                    select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
                });
                if (selectedId) select.value = selectedId;
                if (callback) callback();
            });
    }

    // Populate states based on country
    function populateStates(countryId, selectedId, callback) {
        if (!countryId) {
            document.getElementById('editModalState').innerHTML = '<option value="">Select State</option>';
            if (callback) callback();
            return;
        }
        fetch(`/member/ajax/states/?country_id=${countryId}`)
            .then(res => res.json())
            .then(data => {
                const select = document.getElementById('editModalState');
                select.innerHTML = '<option value="">Select State</option>';
                data.states.forEach(s => {
                    select.innerHTML += `<option value="${s.id}">${s.name}</option>`;
                });
                if (selectedId) select.value = selectedId;
                if (callback) callback();
            });
    }

    // Populate cities based on state
    function populateCities(stateId, selectedId) {
        if (!stateId) {
            document.getElementById('editModalCity').innerHTML = '<option value="">Select City</option>';
            return;
        }
        fetch(`/member/ajax/cities/?state_id=${stateId}`)
            .then(res => res.json())
            .then(data => {
                const select = document.getElementById('editModalCity');
                select.innerHTML = '<option value="">Select City</option>';
                data.cities.forEach(c => {
                    select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
                });
                if (selectedId) select.value = selectedId;
            });
    }

    // Handle cascading dropdowns
    document.getElementById('editModalCountry').addEventListener('change', function () {
        populateStates(this.value, null, function() {
            document.getElementById('editModalCity').innerHTML = '<option value="">Select City</option>';
        });
    });
    document.getElementById('editModalState').addEventListener('change', function () {
        populateCities(this.value, null);
    });

    // Open and populate modal
    function openEditInstructorModal(instructorId) {
        fetch(`/member/api/instructors/${instructorId}/`)
            .then(res => res.json())
            .then(data => {
                currentInstructorId = data.id; // Store current instructor ID for later use
                document.getElementById('editModalName').value = data.name || '';
                document.getElementById('editModalNumber').value = data.number || '';
                document.getElementById('editModalAge').value = data.age || '';
                document.getElementById('editModalAssociated').value = data.associated_since || '';
                document.getElementById('editModalUpdeshta').value = data.updeshta_since || '';
                document.getElementById('editModalGender').value = data.gender || '';
                document.getElementById('editModalAddress').value = data.address || '';
                document.getElementById('editModalActive').value = data.is_active ? '1' : '0';

                // Populate country, then state, then city
                populateCountries(data.country, function() {
                    populateStates(data.country, data.state, function() {
                        populateCities(data.state, data.district);
                    });
                });

                document.getElementById('editInstructorForm').setAttribute('data-id', instructorId);
                document.getElementById('editInstructorModal').style.display = 'block';
            });
    }

    function closeEditInstructorModal() {
        document.getElementById('editInstructorModal').style.display = 'none';
    }
    window.closeEditInstructorModal = closeEditInstructorModal;

    // Save changes

    document.getElementById('editInstructorModal').addEventListener('submit', function(e) {
    e.preventDefault();

    const payload = {
        name: document.getElementById('editModalName').value,
        number: document.getElementById('editModalNumber').value,
        age: document.getElementById('editModalAge').value,
        associated_since: document.getElementById('editModalAssociated').value,
        gender: document.getElementById('editModalGender').value,
        updeshta_since: document.getElementById('editModalUpdeshta').value,
        address: document.getElementById('editModalAddress').value,
        country: document.getElementById('editModalCountry').value,
        state: document.getElementById('editModalState').value,
        city: document.getElementById('editModalCity').value,
        is_active: document.getElementById('editModalActive').value

    };
    console.log("Payload:", payload);
    const csrftoken = getCookie("csrftoken");
    console.log("Submitting instructor data:", payload);
    fetch(`/member/api/instructors_update/${currentInstructorId}/`, {
        method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken
    },
    body: JSON.stringify(payload)
})
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert('Instructor updated successfully.');
            location.reload();
        } else {
            alert('Update failed: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(() => alert('Error updating instructor.'));
});
});