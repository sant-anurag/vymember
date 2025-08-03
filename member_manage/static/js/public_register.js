// public_register.js
document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('member_country');
    const stateSelect = document.getElementById('member_state');
    const citySelect = document.getElementById('member_city');
    console.log('Fetching countries...'); // Before AJAX call
    // Load countries
    fetch('/member/ajax/countries/')
        .then(res => res.json())
        .then(data => {
            console.log('AJAX call executed, response received');
            countrySelect.innerHTML = '<option value="">Select Country</option>';
            data.countries.forEach(c => {
                let opt = document.createElement('option');
                opt.value = c.id;
                opt.text = c.name;
                countrySelect.add(opt);
            });
            // Select "India" if present and trigger change event
            for (let i = 0; i < countrySelect.options.length; i++) {
                if (countrySelect.options[i].text.trim().toLowerCase() === 'india') {
                    countrySelect.selectedIndex = i;
                    countrySelect.dispatchEvent(new Event('change'));
                    break;
                }
            }
            stateSelect.innerHTML = '<option value="">Select State</option>';
            citySelect.innerHTML = '<option value="">Select City</option>';
        });

    countrySelect.addEventListener('change', function() {
        const countryId = this.value;
        stateSelect.innerHTML = '<option value="">Select State</option>';
        citySelect.innerHTML = '<option value="">Select City</option>';
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
                // Select "Maharashtra" if present
                for (let i = 0; i < stateSelect.options.length; i++) {
                    if (stateSelect.options[i].text.trim().toLowerCase() === 'maharashtra') {
                        stateSelect.selectedIndex = i;
                        stateSelect.dispatchEvent(new Event('change'));
                        break;
                    }
                }
            });
    });

    stateSelect.addEventListener('change', function() {
        const stateId = this.value;
        citySelect.innerHTML = '<option value="">Select City</option>';
        if (!stateId) return;
        fetch(`/member/ajax/cities/?state_id=${stateId}`)
            .then(res => res.json())
            .then(data => {
                data.cities.forEach(c => {
                    let opt = document.createElement('option');
                    opt.value = c.id;
                    opt.text = c.name;
                    citySelect.add(opt);
                });
                // Select "Pune" if present
                for (let i = 0; i < citySelect.options.length; i++) {
                    if (citySelect.options[i].text.trim().toLowerCase() === 'pune') {
                        citySelect.selectedIndex = i;
                        break;
                    }
                }
            });
    });


    const form = document.getElementById('publicRegisterForm');
    const modal = document.getElementById('memberExistsModal');
    const modalYesBtn = document.getElementById('modalYesBtn');
    const modalNoBtn = document.getElementById('modalNoBtn');
    const existingMembersList = document.getElementById('existingMembersList');
    let allowSubmit = false;

    if (form) {
        form.addEventListener('submit', function(e) {
            if (allowSubmit) {
                allowSubmit = false; // reset for next submit
                return; // proceed with normal submit
            }
            e.preventDefault();
            const number = form.number.value.trim();
            if (!number) {
                alert('Contact Number is required.');
                return;
            }
            fetch(`/member/ajax/check_by_phone/?number=${encodeURIComponent(number)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.exists) {
                        // Show modal with member names
                        existingMembersList.innerHTML = '<ul>' +
                            data.members.map(m => `<li>${m.name}</li>`).join('') +
                            '</ul>';
                        modal.style.display = 'flex';
                    } else {
                        allowSubmit = true;
                        form.submit();
                    }
                });
        });

        modalYesBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            allowSubmit = true;
            form.submit();
        });

        modalNoBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            form.reset();
        });
    }
});