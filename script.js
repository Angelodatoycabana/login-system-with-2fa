// Initialize EmailJS with your User ID
emailjs.init("g44qCNpLShiWiZrFT"); // Replace with your actual EmailJS User ID

const users = JSON.parse(localStorage.getItem("users")) || {};
let loginAttempts = JSON.parse(localStorage.getItem("loginAttempts")) || {};
let verificationCodes = {}; // Store temporary 2FA codes

function generate2FACode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function showRegister() {
    document.getElementById("registerContainer").style.display = "block";
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("message").innerText = "";
    document.getElementById("registerMessage").innerText = "";
}

function showLogin() {
    document.getElementById("loginContainer").style.display = "block";
    document.getElementById("registerContainer").style.display = "none";
    document.getElementById("message").innerText = "";
    document.getElementById("registerMessage").innerText = "";
    document.getElementById("2faContainer").style.display = "none";
}

function register() {
    const username = document.getElementById("newUsername").value;
    const password = document.getElementById("newPassword").value;
    const email = prompt("Enter your email for notifications:");

    if (users[username]) {
        document.getElementById("registerMessage").innerText = "Username already exists!";
        return;
    }

    users[username] = { password: password, email: email };
    localStorage.setItem("users", JSON.stringify(users));
    document.getElementById("registerMessage").innerText = "Account created successfully!";
}

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if (!users[username]) {
        message.innerText = "User not found!";
        return;
    }

    if (!loginAttempts[username]) {
        loginAttempts[username] = { count: 0, lockUntil: null };
    }

    if (loginAttempts[username].lockUntil && new Date() < new Date(loginAttempts[username].lockUntil)) {
        const remainingTime = Math.ceil((new Date(loginAttempts[username].lockUntil) - new Date()) / 1000);
        message.innerText = `Too many attempts. Try again in ${remainingTime} seconds.`;
        return;
    }

    if (users[username].password !== password) {
        loginAttempts[username].count++;

        if (loginAttempts[username].count >= 3) {
            loginAttempts[username].lockUntil = new Date(new Date().getTime() + 30 * 1000);
            message.innerText = "Too many failed attempts. Locked for 30 seconds.";
        } else {
            message.innerText = "Invalid password!";
        }

        localStorage.setItem("loginAttempts", JSON.stringify(loginAttempts));

        // Send email notification on failed login attempt
        sendEmailNotification(username, users[username].email, "Failed login attempt detected!");

        return;
    }

    // Generate and store 2FA code
    const code = generate2FACode();
    verificationCodes[username] = code;
    alert(`Your 2FA code is: ${code}`); // Simulating sending via alert

    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("2faContainer").style.display = "block";
    document.getElementById("2faMessage").innerText = "";
    document.getElementById("2faUsername").value = username;
}

function verify2FA() {
    const username = document.getElementById("2faUsername").value;
    const code = document.getElementById("2faCode").value;
    const message = document.getElementById("2faMessage");

    if (verificationCodes[username] && verificationCodes[username] === code) {
        message.innerText = "Login successful!";
        delete verificationCodes[username]; // Remove code after successful login
    } else {
        message.innerText = "Invalid 2FA code!";
    }
}

function sendEmailNotification(username, email, alertMessage) {
    if (!email) return;

    emailjs.send("service_o8qktuo", "lala2", {
        to_email: email,
        username: username,
        message: alertMessage
    })
    .then(response => {
        console.log("Email sent successfully:", response);
    })
    .catch(error => {
        console.error("Error sending email:", error);
    });
}
