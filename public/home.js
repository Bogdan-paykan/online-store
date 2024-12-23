document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('products');
    const searchForm = document.getElementById('search-form');
    const filterForm = document.getElementById('filter-form');

    // Завантаження продуктів
    try {
        const response = await axios.get('/products');
        renderProducts(container, response.data);
    } catch (error) {
        console.error('Error fetching initial product list:', error);
    }

    // Пошук
    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const query = document.getElementById('query').value;
        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;

        try {
            const response = await axios.get('/products/search', {
                params: { query, minPrice, maxPrice },
            });
            renderProducts(container, response.data);
        } catch (error) {
            console.error('Error during search:', error);
        }
    });

    // Фільтрування
    filterForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const query = document.getElementById('query').value;
        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;

        try {
            const response = await axios.get('/products/search', {
                params: { query, minPrice, maxPrice },
            });
            renderProducts(container, response.data);
        } catch (error) {
            console.error('Error during filtering:', error);
        }
    });

const orderButton = document.getElementById('show-order-form');
    const orderFormContainer = document.getElementById('order-form-container');
    const orderForm = document.getElementById('order-form');

    // Показати форму для оформлення замовлення
    orderButton.addEventListener('click', () => {
        orderFormContainer.style.display = 'block';
        orderButton.style.display = 'none';
    });

    // Обробка форми замовлення
    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;

        try {
            const response = await axios.post('/order', { name, address, phone });
            alert('Замовлення успішно оформлено!');
            orderFormContainer.style.display = 'none';
            orderButton.style.display = 'block';
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Помилка оформлення замовлення. Спробуйте ще раз.');
        }
    });
});

function addToCart(productId) {
    const productElement = document.querySelector(`[data-id="${productId}"]`);
    if (!productElement) {
        alert('Product not found on the page.');
        return;
    }

    const productName = productElement.querySelector('.product-name').textContent;
    const productPriceText = productElement.querySelector('.product-price').textContent.replace('Price: $', '');
    const productPrice = parseFloat(productPriceText);

    if (isNaN(productPrice)) {
        alert(`Invalid price for product: ${productName}`);
        return;
    }

    const cart = JSON.parse(getCookie('cart') || '[]');

    const cartItem = cart.find((item) => item.productId === productId);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ productId, name: productName, price: productPrice, quantity: 1 });
    }

    setCookie('cart', JSON.stringify(cart), 7);
    alert(`${productName} added to cart!`);
}

function renderProducts(container, products) {
    container.innerHTML = products
        .map(
            (product) => `
            <div class="product" data-id="${product.id}">
                <h2 class="product-name">${product.name}</h2>
                <p class="product-price">Price: $${product.price}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `
        )
        .join('');
}

function getCookie(name) {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    for (let cookie of cookies) {
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name + '=') === 0) {
            return cookie.substring(name.length + 1, cookie.length);
        }
    }
    return '';
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

