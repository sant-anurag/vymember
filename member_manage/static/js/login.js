document.getElementById('loginForm').addEventListener('submit', function() {
    // Optionally, show a loading spinner or disable button
    document.getElementById('loginButton').disabled = true;
    document.getElementById('loginButton').textContent = 'Logging in...';

});