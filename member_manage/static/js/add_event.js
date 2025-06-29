document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('eventForm');
    form.addEventListener('submit', function(e) {
        const name = document.getElementById('event_name').value.trim();
        const date = document.getElementById('event_date').value;
        const instructor = document.getElementById('instructor_id').value;
        const location = document.getElementById('event_location').value.trim();
        const state = document.getElementById('event_state').value.trim();
        const country = document.getElementById('event_country').value.trim();
        const district = document.getElementById('event_district').value.trim();

        if (!name || !date || !instructor || !location || !state || !country || !district) {
            alert('Please fill all required fields.');
            e.preventDefault();
        }
    });
});