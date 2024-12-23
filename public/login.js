document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Submitting login:', { username, password });

    try {
        const response = await axios.post('/login', { username, password });
        console.log('Login response:', response.data);

        // Перенаправлення на сторінку товарів
        window.location.href = '/products';
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data.message : error.message);
        document.getElementById('error-message').textContent = 'Invalid username or password.';
    }
});
