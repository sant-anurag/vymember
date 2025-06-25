document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("addInstructorForm");
    form.addEventListener("submit", function(e) {
        const name = document.getElementById("name").value.trim();
        if (!name) {
            alert("Name is required.");
            e.preventDefault();
            return false;
        }
        // Add more validation as needed
        return true;
    });
});