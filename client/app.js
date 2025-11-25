console.log("OOTD client connected.");

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert("Login failed: " + (result.error || "Unknown error"));
      return;
    }

    // Success
    alert("Login successful!");
    console.log(result);

    // ❗ Placeholder: Later redirect to dashboard.html
    // window.location.href = "dashboard.html";
  } catch (err) {
    console.error("Login error:", err);
    alert("Could not connect to server.");
  }
});
