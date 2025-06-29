// member_manage/static/js/login.js

document.addEventListener('DOMContentLoaded', function() {
  // Auto-hide error message after 4 seconds
  const msg = document.getElementById('login-message');
  if (msg) {
    setTimeout(() => {
      msg.style.display = 'none';
    }, 4000);
  }

  // Optional: Client-side form validation
  const form = document.querySelector('.login-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!username || !password) {
        e.preventDefault();
        alert("Please enter both username and password.");
      }
    });
  }
});