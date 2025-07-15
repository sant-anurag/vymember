// member_manage/static/js/add_event.js
document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('ins_country');
    const stateSelect = document.getElementById('ins_state');
    const districtSelect = document.getElementById('ins_district');

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
            // Select "India" if present and trigger change event
            for (let i = 0; i < countrySelect.options.length; i++) {
                if (countrySelect.options[i].text.trim().toLowerCase() === 'india') {
                    countrySelect.selectedIndex = i;
                    countrySelect.dispatchEvent(new Event('change'));
                    break;
                }
            }
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
                // Select "Pune" if present
                for (let i = 0; i < districtSelect.options.length; i++) {
                    if (districtSelect.options[i].text.trim().toLowerCase() === 'pune') {
                        districtSelect.selectedIndex = i;
                        break;
                    }
                }
            });
    });


});