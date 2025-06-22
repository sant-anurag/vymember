document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    // Simple client-side validation
    if (!username || !password) {
        errorMsg.textContent = 'Please enter both username and password.';
        errorMsg.style.display = 'block';
        return;
    }

    // Simulate login (replace with real authentication)
    if (username === 'admin' && password === 'password') {
        errorMsg.style.display = 'none';
        alert('Login successful!');
        // Redirect or further logic here
    } else {
        errorMsg.textContent = 'Invalid username or password.';
        errorMsg.style.display = 'block';
    }
});