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
            });
    });

    // Form validation
    const form = document.getElementById('publicRegisterForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            const name = form.name.value.trim();
            const number = form.number.value.trim();
            if (!name || !number) {
                alert('Name and Contact Number are required.');
                e.preventDefault();
            }
        });
        document.querySelector('.reset-btn').addEventListener('click', function(e) {
            e.preventDefault();
            form.reset();
            form.querySelectorAll('input, textarea').forEach(el => el.value = '');
            form.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
        });
    }
});