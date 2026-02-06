// --- Theme & Config ---

function initializeTheme() {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', CONFIG.PRIMARY_COLOR);
    root.style.setProperty('--secondary-color', CONFIG.SECONDARY_COLOR);
    root.style.setProperty('--accent-color', CONFIG.ACCENT_COLOR);
    root.style.setProperty('--background-color', CONFIG.BACKGROUND_COLOR);
    root.style.setProperty('--text-color', CONFIG.TEXT_COLOR);
    root.style.setProperty('--font-family', CONFIG.FONT_FAMILY);

    // Update Shop Name
    const shopNameEls = document.querySelectorAll('#sidebar-shop-name');
    shopNameEls.forEach(el => el.innerText = CONFIG.SHOP_NAME);

    // Tax update
    const taxEl = document.getElementById('tax-pct');
    if (taxEl) taxEl.innerText = CONFIG.TAX_PERCENTAGE;

    // Restaurant specific
    if (CONFIG.SHOP_TYPE === 'Restaurant') {
        const rc = document.getElementById('restaurant-controls');
        if (rc) rc.classList.remove('hidden');
    }
}

// --- Auth ---

async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            window.location.href = 'dashboard.html';
        } else {
            errorMsg.innerText = "Invalid credentials";
        }
    } catch (e) {
        errorMsg.innerText = "Connection error " + e;
    }
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
    }
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
        userDisplay.innerText = localStorage.getItem('role') || 'User';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'index.html';
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

// --- POS Logic ---

let cart = [];
let allProducts = [];

async function initPOS() {
    await loadProducts();
    // Setup Filter Buttons
    const categories = [...new Set(allProducts.map(p => p.category))];
    const filterContainer = document.getElementById('category-filter');
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.innerText = cat;
        btn.onclick = () => filterProducts(cat);
        filterContainer.appendChild(btn);
    });
}

async function loadProducts() {
    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/products`, {
            headers: getAuthHeaders()
        });
        if (res.ok) {
            allProducts = await res.json();
            renderProducts(allProducts);
        }
    } catch (e) {
        console.error("Failed to load products", e);
    }
}

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => addToCart(p);

        let displayPrice = CONFIG.CURRENCY_SYMBOL + p.price.toFixed(2);

        card.innerHTML = `
            <div class="product-img"></div> 
            <h4>${p.name}</h4>
            <p>${displayPrice}</p>
            <small>${p.stock} in stock</small>
        `;
        grid.appendChild(card);
    });
}

function filterProducts(category) {
    // UI update
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active'); // Assumption: event from click

    if (category === 'All') {
        renderProducts(allProducts);
    } else {
        renderProducts(allProducts.filter(p => p.category === category));
    }
}

function addToCart(product) {
    // Logic for SHOP_TYPE
    if (CONFIG.SHOP_TYPE === 'Clothing' && !product.size && !product.color) {
        // In a real app, show modal to select variant. 
        // For this demo, we assume product INCLUDES variant info or we just add it.
        // Let's assume generic add for simplicity unless we want to wow hard.
    }

    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ product: product, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';

    let subtotal = 0;

    cart.forEach((item, index) => {
        const total = item.quantity * item.product.price;
        subtotal += total;

        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div class="cart-item-details">
                <h5>${item.product.name}</h5>
                <small>${item.quantity} x ${CONFIG.CURRENCY_SYMBOL}${item.product.price}</small>
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
            </div>
        `;
        container.appendChild(row);
    });

    // Calcs
    const tax = subtotal * (CONFIG.TAX_PERCENTAGE / 100);
    const discount = 0; // Configurable but manual input not implemented for brevity
    const grandTotal = subtotal + tax - discount;

    document.getElementById('sub-total').innerText = CONFIG.CURRENCY_SYMBOL + subtotal.toFixed(2);
    document.getElementById('tax-amount').innerText = CONFIG.CURRENCY_SYMBOL + tax.toFixed(2);
    document.getElementById('discount-amount').innerText = CONFIG.CURRENCY_SYMBOL + discount.toFixed(2);
    document.getElementById('grand-total').innerText = CONFIG.CURRENCY_SYMBOL + grandTotal.toFixed(2);
}

function updateQty(index, delta) {
    const item = cart[index];
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
}

async function processOrder() {
    if (cart.length === 0) return alert("Cart is empty");

    const orderData = {
        tableNumber: document.getElementById('table-number')?.value || null,
        totalAmount: 0, // Backend recalcs
        taxAmount: parseFloat(document.getElementById('tax-amount').innerText.replace(CONFIG.CURRENCY_SYMBOL, '')),
        discountAmount: 0,
        items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
        }))
    };

    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            alert("Order Placed Successfully!");
            cart = [];
            updateCartUI();
            loadProducts(); // Refresh stock
        } else {
            alert("Order Failed");
        }
    } catch (e) {
        alert("Error sending order");
    }
}

// --- Dashboard & Product Mgmt Helpers ---

async function loadDashboardStats() {
    // Mock stats for demo or fetch real stats
    // Ideally create stats endpoint
    document.getElementById('stat-daily-sales').innerText = CONFIG.CURRENCY_SYMBOL + "1,240.00";
    document.getElementById('stat-daily-orders').innerText = "45";

    // Fetch orders
    const res = await fetch(`${CONFIG.API_BASE_URL}/orders`, { headers: getAuthHeaders() });
    if (res.ok) {
        const orders = await res.json();
        const tbody = document.getElementById('orders-table-body');
        tbody.innerHTML = '';
        orders.slice(0, 10).forEach(o => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${o.id}</td>
                <td>${o.orderDate}</td>
                <td>${CONFIG.CURRENCY_SYMBOL}${o.finalAmount.toFixed(2)}</td>
                <td><button class="btn-primary" style="padding:0.25rem 0.5rem; font-size:0.8rem">View</button></td>
            `;
            tbody.appendChild(tr);
        });
    }
}

async function loadProductsTable() {
    const res = await fetch(`${CONFIG.API_BASE_URL}/products`, { headers: getAuthHeaders() });
    if (res.ok) {
        const products = await res.json();
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = '';
        products.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${CONFIG.CURRENCY_SYMBOL}${p.price}</td>
                <td>${p.stock}</td>
                <td><button class="text-danger" onclick="deleteProduct(${p.id})">Delete</button></td>
            `;
            tbody.appendChild(tr);
        });
    }
}

async function deleteProduct(id) {
    if (!confirm("Are you sure?")) return;
    await fetch(`${CONFIG.API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    loadProductsTable();
}

// Add Product Modal Logic
function showAddProductModal() {
    document.getElementById('add-product-modal').classList.remove('hidden');
    // Populate categories based on SHOP_TYPE
    const catSelect = document.getElementById('p-category');
    catSelect.innerHTML = '';
    let cats = [];
    if (CONFIG.SHOP_TYPE === 'Grocery') cats = ['Rice', 'Vegetables', 'Fruits', 'Beverages'];
    if (CONFIG.SHOP_TYPE === 'Clothing') cats = ['Men', 'Women', 'Kids'];
    if (CONFIG.SHOP_TYPE === 'Pharmacy') cats = ['Medicines', 'Devices'];
    if (CONFIG.SHOP_TYPE === 'Restaurant') cats = ['Food', 'Drinks'];

    cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.innerText = c;
        catSelect.appendChild(opt);
    });
}

function closeModal() {
    document.getElementById('add-product-modal').classList.add('hidden');
}

document.getElementById('add-product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const product = {
        name: document.getElementById('p-name').value,
        category: document.getElementById('p-category').value,
        price: parseFloat(document.getElementById('p-price').value),
        stock: parseInt(document.getElementById('p-stock').value),
        imageUrl: document.getElementById('p-image').value
        // Would gather dynamic properties here
    };

    await fetch(`${CONFIG.API_BASE_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product)
    });

    closeModal();
    loadProductsTable();
});

function checkShopSpecificInputs() {
    const container = document.getElementById('dynamic-fields');
    if (!container) return;
    container.innerHTML = '';

    if (CONFIG.SHOP_TYPE === 'Clothing') {
        container.innerHTML = `
            <div class="form-group"><label>Size</label><input type="text" id="p-size" placeholder="S, M, L"></div>
            <div class="form-group"><label>Color</label><input type="text" id="p-color"></div>
        `;
    }
    // Add other types as needed
}
