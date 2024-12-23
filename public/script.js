document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await axios.get('/products');
        const products = response.data;

        const container = document.getElementById('products');
        container.innerHTML = products.map(product => `
            <div class="product">
                <h2>${product.name}</h2>
                <p>Price: $${product.price}</p>
                <p>${product.description}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching products:', error);
    }
});
