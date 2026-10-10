
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");
    const loginError = document.getElementById("loginError");
    const loginButton = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        loginError.textContent = "";
        loginError.classList.remove("show");
        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        try {
            const response = await fetch("login.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Invalid username or password."
                );
            }

            // Compatibility with existing frontend scripts.
            // PHP session remains the server-side authentication.
            localStorage.setItem("socialcraft.loggedIn", "true");
            localStorage.setItem("socialcraft.username", result.username);
            localStorage.setItem("socialcraft.role", result.role);

            window.location.href = result.redirect;

        } catch (error) {
            loginError.textContent =
                error.message || "Unable to connect to the server.";
            loginError.classList.add("show");

            passwordInput.value = "";
            passwordInput.focus();

        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "Login";
        }
    });
});