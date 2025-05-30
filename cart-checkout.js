// Cart to Order conversion functionality
function processCartCheckout() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Get cart items
    const cart = JSON.parse(localStorage.getItem('cart_' + user) || '[]');
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Convert cart items to orders
    const orders = JSON.parse(localStorage.getItem('orders_' + user) || '[]');
    const newOrders = cart.map(item => ({
        id: 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        productName: item.name,
        variant: item.shade || item.size || '',
        total: item.price * item.quantity,
        quantity: item.quantity,
        image: item.image,
        status: 'new',
        orderDate: new Date().toISOString()
    }));

    // Add new orders and clear cart
    orders.push(...newOrders);
    localStorage.setItem('orders_' + user, JSON.stringify(orders));
    localStorage.setItem('cart_' + user, '[]');
    
    // Save last order for order success page
    localStorage.setItem('lastOrder', JSON.stringify(cart));

    // Redirect to order success page
    window.location.href = 'order_success.html';
}

// Auto-update order status
function updateOrderStatuses() {
    const user = localStorage.getItem('currentUser');
    if (!user) return;

    const orders = JSON.parse(localStorage.getItem('orders_' + user) || '[]');
    let updated = false;

    orders.forEach(order => {
        if (order.status === 'new') {
            const orderAge = Date.now() - new Date(order.orderDate).getTime();
            if (orderAge > 30000) { // Move to "being prepared" after 30 seconds
                order.status = 'preparing';
                updated = true;
            }
        } else if (order.status === 'preparing') {
            const orderAge = Date.now() - new Date(order.orderDate).getTime();
            if (orderAge > 60000) { // Move to "shipped" after 60 seconds
                order.status = 'shipped';
                updated = true;
            }
        }
    });

    if (updated) {
        localStorage.setItem('orders_' + user, JSON.stringify(orders));
        // If we're on the orders page, refresh the display
        if (window.location.pathname.includes('orders.html')) {
            window.dispatchEvent(new Event('ordersUpdated'));
        }
    }
}

// Start the auto-update process
setInterval(updateOrderStatuses, 5000); // Check every 5 seconds 