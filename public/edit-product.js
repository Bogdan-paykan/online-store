document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products');

    productsContainer.addEventListener('click', async (event) => {
        const productElement = event.target.closest('.product');
        if (!productElement) return;

        const productId = productElement.getAttribute('data-id');
        const viewMode = productElement.querySelector('.view-mode');
        const editMode = productElement.querySelector('.edit-mode');

        if (event.target.classList.contains('edit-button')) {
            // Перехід у режим редагування
            viewMode.style.display = 'none';
            editMode.style.display = 'block';
        } else if (event.target.classList.contains('cancel-button')) {
            // Відміна редагування
            viewMode.style.display = 'block';
            editMode.style.display = 'none';
        } else if (event.target.classList.contains('save-button')) {
            // Збереження змін
            const name = editMode.querySelector('.edit-name').value;
            const price = editMode.querySelector('.edit-price').value;
            const description = editMode.querySelector('.edit-description').value;

            try {
                const response = await axios.put(`/products/${productId}`, { name, price, description });
                alert(response.data.message);

                // Оновлення відображення
                viewMode.querySelector('h2').textContent = name;
                viewMode.querySelector('p:nth-child(2)').textContent = `Price: $${price}`;
                viewMode.querySelector('p:nth-child(3)').textContent = description;

                viewMode.style.display = 'block';
                editMode.style.display = 'none';
            } catch (error) {
                console.error('Error saving product:', error);
                alert('Failed to save changes.');
            }
        }
    });
});


async function logout() {
    try {
        const response = await axios.post('/logout');
        alert(response.data.message);
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout failed:', error);
        alert('Failed to log out.');
    }
}
