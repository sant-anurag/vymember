// member_manage/static/js/add_event.js
document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('event_country');
    const stateSelect = document.getElementById('event_state');
    const districtSelect = document.getElementById('event_district');

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
            districtSelect.innerHTML = '<option value="">Select District</option>';
        });

    countrySelect.addEventListener('change', function() {
        const countryId = this.value;
        stateSelect.innerHTML = '<option value="">Select State</option>';
        districtSelect.innerHTML = '<option value="">Select District</option>';
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
        districtSelect.innerHTML = '<option value="">Select District</option>';
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

    // Form validation (unchanged)
    const form = document.getElementById('eventForm');
    form.addEventListener('submit', function(e) {
        const name = document.getElementById('event_name').value.trim();
        const date = document.getElementById('event_date').value;
        const instructor = document.getElementById('instructor_id').value;
        const location = document.getElementById('event_location').value.trim();
        const state = stateSelect.value.trim();
        const country = countrySelect.value.trim();
        const district = districtSelect.value.trim();

        if (!name || !date || !instructor || !location || !state || !country || !district) {
            alert('Please fill all required fields.');
            e.preventDefault();
        }
    });
});