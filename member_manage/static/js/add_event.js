document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('eventForm');
    form.addEventListener('submit', function(e) {
        const name = document.getElementById('event_name').value.trim();
        const date = document.getElementById('event_date').value;
        const instructor = document.getElementById('instructor_id').value;
        if (!name || !date || !instructor) {
            alert('Please fill all required fields.');
            e.preventDefault();
        }
    });
});