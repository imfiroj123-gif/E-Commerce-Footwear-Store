const API_URL = '/api/users';

// Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('login-error');

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('userInfo', JSON.stringify(data));
                if (data.isAdmin) {
                    window.location.href = '../admin/dashboard/index.html';
                } else {
                    window.location.href = '../index.html';
                }
            } else {
                errorMsg.textContent = data.message || 'Invalid credentials';
                errorMsg.style.display = 'block';
            }
        } catch (error) {
            errorMsg.textContent = 'Server error. Try again later.';
            errorMsg.style.display = 'block';
        }
    });
}

// Handle Register
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('register-error');

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('userInfo', JSON.stringify(data));
                window.location.href = '../index.html';
            } else {
                errorMsg.textContent = data.message || 'Registration failed';
                errorMsg.style.display = 'block';
            }
        } catch (error) {
            errorMsg.textContent = 'Server error. Try again later.';
            errorMsg.style.display = 'block';
        }
    });
}
