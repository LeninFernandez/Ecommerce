/*
CHECKLIST:
[ ] Login hits backend /api/login
[ ] Signup hits backend /api/signup
[ ] Token stored ONLY after login
[ ] Toggle works reliably
[ ] Proper error handling
[ ] Redirect after login works
*/

const API_BASE = "/api";

// ===== AUTH CALLS =====
async function login(email, password) {
    const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);
}

async function signup(name, email, password) {
    const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Signup failed");
    }
}

// ===== UI LOGIC =====
document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    const showLogin = document.getElementById("showLogin");
    const showSignup = document.getElementById("showSignup");

    // ===== TOGGLE =====
    showLogin.onclick = () => {
        loginForm.style.display = "block";
        signupForm.style.display = "none";
    };

    showSignup.onclick = () => {
        loginForm.style.display = "none";
        signupForm.style.display = "block";
    };

    // ===== LOGIN =====
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginForm.email.value;
        const password = loginForm.password.value;

try {
            await login(email, password);
            window.location.href = "shop.html";
        } catch (err) {
            const msg = document.createElement("p");
            msg.style.color = "red";
            msg.textContent = err.message;
            loginForm.appendChild(msg);
        }
    });

    // ===== SIGNUP =====
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = signupForm.name.value;
        const email = signupForm.email.value;
        const password = signupForm.password.value;

try {
            await signup(name, email, password);
            showLogin.click();
        } catch (err) {
            const msg = document.createElement("p");
            msg.style.color = "red";
            msg.textContent = err.message;
            signupForm.appendChild(msg);
        }
    });

});