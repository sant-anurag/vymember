function validateForm() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter both username and password.");
    return false;
  }

  // Simulate login success
  alert("Login successful!");
  return true;
}
