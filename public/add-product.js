document.getElementById('add-product-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('authToken'); // Отримуємо токен із localStorage

    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;

    try {
        const response = await axios.post('/products', { name, price, description }, {
            headers: {
                Authorization: `Bearer ${token}`, // Передаємо токен у заголовку
            },
        });

        console.log('Product added successfully:', response.data.message);

        // Очищення форми та повідомлення про успіх
        document.getElementById('add-product-form').reset();
        alert('Product added successfully!');
    } catch (error) {
        console.error('Error adding product:', error);
        document.getElementById('error-message').textContent = 'Failed to add product.';
    }
});
