document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('event_country');
    const stateSelect = document.getElementById('event_state');
    const districtSelect = document.getElementById('event_district');
    let countries = [];
    let states = [];
    let cities = [];

    // Fetch all data in parallel
    Promise.all([
        fetch('/static/data/countries.json').then(res => res.json()),
        fetch('/static/data/states.json').then(res => res.json()),
        fetch('/static/data/cities.json').then(res => res.json())
    ]).then(([countriesData, statesData, citiesData]) => {
        countries = countriesData;
        states = statesData;
        cities = citiesData;
        populateCountries();
    });

    function populateCountries() {
        countrySelect.innerHTML = '<option value="">Select Country</option>';
        countries.forEach(c => {
            let opt = document.createElement('option');
            opt.value = c.name || c.country_name || c.iso2 || c.id;
            opt.text = c.name || c.country_name;
            countrySelect.add(opt);
        });
        stateSelect.innerHTML = '<option value="">Select State</option>';
        districtSelect.innerHTML = '<option value="">Select District</option>';
    }

    countrySelect.addEventListener('change', function() {
        const selectedCountry = this.value;
        stateSelect.innerHTML = '<option value="">Select State</option>';
        districtSelect.innerHTML = '<option value="">Select District</option>';
        if (!selectedCountry) return;

        // Find country id (for datasets using id/iso2)
        let countryObj = countries.find(
            c => c.name === selectedCountry || c.country_name === selectedCountry || c.iso2 === selectedCountry || c.id === selectedCountry
        );
        let countryId = countryObj ? (countryObj.id || countryObj.country_id || countryObj.iso2) : selectedCountry;

        // Filter states for selected country
        let filteredStates = states.filter(
            s => s.country_id == countryId || s.country_name === selectedCountry || s.country_code === countryId
        );
        // Fallback: try by country name if id fails
        if (filteredStates.length === 0) {
            filteredStates = states.filter(s => s.country_name === selectedCountry);
        }
        filteredStates.forEach(s => {
            let opt = document.createElement('option');
            opt.value = s.name || s.state_name || s.id;
            opt.text = s.name || s.state_name;
            stateSelect.add(opt);
        });
    });

    stateSelect.addEventListener('change', function() {
        const selectedState = this.value;
        districtSelect.innerHTML = '<option value="">Select District</option>';
        if (!selectedState) return;

        // Find state id (for datasets using id)
        let stateObj = states.find(
            s => s.name === selectedState || s.state_name === selectedState || s.id === selectedState
        );
        let stateId = stateObj ? (stateObj.id || stateObj.state_id) : selectedState;

        // Filter cities for selected state
        let filteredCities = cities.filter(
            c => c.state_id == stateId || c.state_name === selectedState
        );
        // Fallback: try by state name if id fails
        if (filteredCities.length === 0) {
            filteredCities = cities.filter(c => c.state_name === selectedState);
        }
        filteredCities.forEach(c => {
            let opt = document.createElement('option');
            opt.value = c.name || c.city_name || c.id;
            opt.text = c.name || c.city_name;
            districtSelect.add(opt);
        });
    });

    // Form validation (existing functionality)
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