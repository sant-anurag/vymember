document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('upload-form');
    form.addEventListener('submit', function() {
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    });
});