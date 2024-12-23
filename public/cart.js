document.addEventListener('DOMContentLoaded', () => {
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
