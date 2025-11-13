import { initializeApp} from "./script.js";
window.addEventListener('DOMContentLoaded', initializeApp);


let nameInput = document.querySelector("#name");
let emailInput = document.querySelector("#email");
let passwordInput = document.querySelector("#password");
let confirmPasswordInput = document.querySelector("#confirm-password");
let signupForm = document.querySelector("#signup-form");
let loginForm = document.querySelector("#login-form");



function validateSignup(nameValue, emailValue, passwordValue, confirmPasswordValue) {
    if (nameValue === '' || emailValue === '' || passwordValue === '' || confirmPasswordValue === '') {
        Swal.fire({
            icon: "warning",
            title: "Missing information",
            text: "Please fill in all fields before signing up!",
            confirmButtonColor: "#4f46e5"
        });
        return false;
    }

    if (/^\d+$/.test(nameValue)) {
        Swal.fire({
            icon: "error",
            title: "Invalid name",
            text: "Name cannot be only numbers",
            confirmButtonColor: "#4f46e5"
        });
        return false;
    }

    if (passwordValue !== confirmPasswordValue) {
        Swal.fire({
            icon: "error",
            title: "Password mismatch",
            text: "Password and confirm password do not match",
            confirmButtonColor: "#4f46e5"
        });
        return false;
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordPattern.test(passwordValue)) {
        Swal.fire({
            icon: "error",
            title: "Invalid password",
            text: "Password must be 8–20 chars with uppercase, lowercase, number, and special character",
            confirmButtonColor: "#4f46e5"
        });
        return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
        Swal.fire({
            icon: "error",
            title: "Invalid email",
            text: "Please enter a valid email address",
            confirmButtonColor: "#4f46e5"
        });
        return false;
    }

    return true;
}


if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();

        if (emailValue === '' || passwordValue === '') {
            Swal.fire({
                icon: "warning",
                title: "Missing information",
                text: "Please fill in all fields before login!",
                confirmButtonColor: "#4f46e5"
            });
            return false;
        }

        const userData = { email: emailValue, password: passwordValue };

        fetch("http://127.0.0.1:5000/login_user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: "Login successful!",
                    showConfirmButton: false,
                    timer: 1000
                }).then(() => {
                    window.location.href = data.redirect;;
                });
                emailInput.value = '';
                passwordInput.value = '';
            } else {
                Swal.fire({
                    icon: data.status === "warning" ? "warning" : "error",
                    title: data.message,
                    confirmButtonColor: "#4f46e5"
                });
            }
        })
        .catch(error => {
            console.error("Error:", error);
            Swal.fire({ icon: "error", title: "Something went wrong!", confirmButtonColor: "#4f46e5" });
        });
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nameValue = nameInput.value.trim();
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();
        const confirmPasswordValue = confirmPasswordInput.value.trim();

        if (!validateSignup(nameValue, emailValue, passwordValue, confirmPasswordValue)) return;

        const userData = {
            name: nameValue,
            email: emailValue,
            password: passwordValue,
            confirmPassword: confirmPasswordValue
        };

        fetch("http://127.0.0.1:5000/add_user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: "Signup successful!",
                    showConfirmButton: false,
                    timer: 1000
                }).then(() => {
                    window.location.href = data.redirect;;
                });

                nameInput.value = '';
                emailInput.value = '';
                passwordInput.value = '';
                confirmPasswordInput.value = '';
            } else {
                Swal.fire({
                    icon: data.status === "warning" ? "warning" : "error",
                    title: data.message,
                    confirmButtonColor: "#4f46e5"
                });
            }
        })
        .catch(error => {
            console.error("Error:", error);
            Swal.fire({ icon: "error", title: "Something went wrong!", confirmButtonColor: "#4f46e5" });
        });
    });
}
