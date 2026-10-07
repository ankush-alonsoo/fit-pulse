// Utility helper to get currently logged-in user email session
function getActiveUserEmail() {
    return localStorage.getItem('fitpulse_active_user');
}

function setActiveUserEmail(email) {
    if (email) {
        localStorage.setItem('fitpulse_active_user', email);
    } else {
        localStorage.removeItem('fitpulse_active_user');
    }
}

function getAllUsers() {
    return JSON.parse(localStorage.getItem('fitpulse_users')) || [];
}

function saveAllUsers(users) {
    localStorage.setItem('fitpulse_users', JSON.stringify(users));
}

// 1. SIGNUP HANDLER
function initSignup() {
    const form = document.getElementById('signup-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim().toLowerCase();
        const password = document.getElementById('signup-password').value;
        const errorEl = document.getElementById('signup-error');

        let users = getAllUsers();
        if (users.some(u => u.email === email)) {
            errorEl.textContent = 'Email is already registered. Please log in.';
            return;
        }

        users.push({ name, email, password, weight: null, height: null, goal: null, bmi: null });
        saveAllUsers(users);

        alert('Account created successfully! Please log in.');
        window.location.href = 'login.html';
    });
}

// 2. LOGIN HANDLER
function initLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        let users = getAllUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            errorEl.textContent = 'Invalid email or password.';
            return;
        }

        // Set active session
        setActiveUserEmail(email);

        // Check if metrics (weight, height, goal) are completed
        if (!user.weight || !user.height || !user.goal) {
            window.location.href = 'setup.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    });
}

// 3. SETUP / METRICS & GOALS HANDLER
function initSetup() {
    const form = document.getElementById('metrics-form');
    if (!form) return;

    const activeEmail = getActiveUserEmail();
    if (!activeEmail) {
        window.location.href = 'login.html';
        return;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);
        const goal = document.getElementById('goal').value;

        // Calculate BMI
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

        let users = getAllUsers();
        const userIndex = users.findIndex(u => u.email === activeEmail);

        if (userIndex !== -1) {
            users[userIndex].weight = weight;
            users[userIndex].height = height;
            users[userIndex].goal = goal;
            users[userIndex].bmi = bmi;
            saveAllUsers(users);

            window.location.href = 'dashboard.html';
        }
    });
}

// 4. DASHBOARD HANDLER
function initDashboard() {
    const activeEmail = getActiveUserEmail();
    if (!activeEmail) {
        window.location.href = 'login.html';
        return;
    }

    let users = getAllUsers();
    const user = users.find(u => u.email === activeEmail);

    if (!user || !user.weight || !user.height || !user.goal) {
        window.location.href = 'setup.html';
        return;
    }

    // Populate data
    document.getElementById('welcome-msg').textContent = `Hello, ${user.name}`;
    document.getElementById('dash-weight').textContent = `${user.weight} kg`;
    document.getElementById('dash-height').textContent = `${user.height} cm`;
    document.getElementById('dash-bmi').textContent = user.bmi;
    document.getElementById('dash-goal').textContent = user.goal;

    // BMI Badge Styling
    const bmiStatus = document.getElementById('bmi-status');
    let bmiValue = parseFloat(user.bmi);
    let statusText = '';
    let statusColor = '';

    if (bmiValue < 18.5) {
        statusText = 'Underweight';
        statusColor = '#3b82f6';
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
        statusText = 'Normal Weight';
        statusColor = '#10b981';
    } else if (bmiValue >= 25 && bmiValue < 30) {
        statusText = 'Overweight';
        statusColor = '#f59e0b';
    } else {
        statusText = 'Obese';
        statusColor = '#ef4444';
    }

    bmiStatus.textContent = statusText;
    bmiStatus.style.backgroundColor = statusColor;
    bmiStatus.style.color = '#ffffff';

    // Logout button handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            setActiveUserEmail(null);
            window.location.href = 'login.html';
        });
    }
}