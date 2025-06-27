document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const uploadStatus = document.getElementById('uploadStatus');

    // Drag & drop events
    dropArea.addEventListener('click', () => fileInput.click());
    dropArea.addEventListener('dragover', e => {
        e.preventDefault();
        dropArea.classList.add('dragover');
    });
    dropArea.addEventListener('dragleave', e => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
    });
    dropArea.addEventListener('drop', e => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
        }
    });

    // Browse button
    dropArea.querySelector('.browse-btn').addEventListener('click', e => {
        e.stopPropagation();
        fileInput.click();
    });

    // Form submit
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!fileInput.files.length) {
            uploadStatus.textContent = "Please select an Excel file to upload.";
            uploadStatus.style.color = "#ff6384";
            return;
        }
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        uploadStatus.textContent = "Uploading...";
        uploadStatus.style.color = "#4f8cff";
        fetch('/member/upload_members/', {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                uploadStatus.textContent = data.message;
                uploadStatus.style.color = "#2ecc40";
            } else {
                uploadStatus.textContent = data.message || "Upload failed.";
                uploadStatus.style.color = "#ff6384";
            }
        })
        .catch(() => {
            uploadStatus.textContent = "An error occurred during upload.";
            uploadStatus.style.color = "#ff6384";
        });
    });
});