document.addEventListener('DOMContentLoaded', function () {
    const productsDiv = document.getElementById('products');
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalDiv = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('checkoutButton');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const showRegister = document.getElementById('showRegister');
    const userLoginSection = document.getElementById('userLogin');
    const userRegisterSection = document.getElementById('userRegister');
    const cartCount = document.getElementById('cartCount');
    const cartModal = document.getElementById('cartModal');
    const modalCartItems = document.getElementById('modalCartItems');
    const modalCartTotal = document.getElementById('modalCartTotal');
    const closeModal = document.getElementById('closeModal');
    const cartLink = document.getElementById('cartLink');
    const notificationContainer = document.getElementById('notificationContainer');
    const buscarCepButton = document.getElementById('buscarCep');
    const cepInput = document.getElementById('cep');
    const enderecoDiv = document.getElementById('endereco');
    const freteDiv = document.getElementById('frete');
    const searchBar = document.getElementById('searchBar');
    const filterButtons = document.querySelectorAll('#filterButtons button');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let currentUser = null;
    let allProducts = [];

    function updateCartCount() {
        cartCount.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.classList.add('notification', 'show');
        notification.innerText = message;
        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            notificationContainer.removeChild(notification);
        }, 4000);
    }

    buscarCepButton.addEventListener('click', function() {
        const cep = cepInput.value.replace(/\D/g, '');

        if (cep === "") {
            showNotification('Por favor, insira um CEP válido.');
            return;
        }

        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    showNotification('CEP não encontrado.');
                    enderecoDiv.innerHTML = '';
                    freteDiv.innerHTML = '';
                } else {
                    enderecoDiv.innerHTML = `
                        <strong>Endereço:</strong> ${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}
                    `;
                    calculateFrete(data.localidade);
                }
            })
            .catch(error => {
                showNotification('Erro ao buscar o CEP.');
                enderecoDiv.innerHTML = '';
                freteDiv.innerHTML = '';
            });
    });

    function calculateFrete(city) {
        const baseFrete = 10.00;
        let adicional = 0;

        if (city.toLowerCase() === "são paulo") {
            adicional = 5.00;
        } else if (city.toLowerCase() === "rio de janeiro") {
            adicional = 7.00;
        } else {
            adicional = 15.00;
        }

        const frete = baseFrete + adicional;
        freteDiv.innerHTML = `<strong>Frete:</strong> R$ ${frete.toFixed(2)}`;

        const totalCompra = parseFloat(modalCartTotal.textContent.replace('Total: $', ''));
        const totalComFrete = totalCompra + frete;
        modalCartTotal.innerHTML = `<strong>Total com Frete: R$ ${totalComFrete.toFixed(2)}</strong>`;
    }

    showRegister.addEventListener('click', function (e) {
        e.preventDefault();
        userLoginSection.classList.add('hidden');
        userRegisterSection.classList.remove('hidden');
    });

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;

        if (localStorage.getItem(username)) {
            alert('Username already exists');
        } else {
            localStorage.setItem(username, password);
            alert('Registration successful');
            userRegisterSection.classList.add('hidden');
            userLoginSection.classList.remove('hidden');
        }
    });

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const storedPassword = localStorage.getItem(username);

        if (storedPassword && storedPassword === password) {
            alert('Login successful');
            currentUser = username;
            userLoginSection.classList.add('hidden');
            userRegisterSection.classList.add('hidden');
            productCatalogSection.classList.remove('hidden');
            loadProducts();
        } else {
            alert('Invalid username or password');
        }
    });

    function loadProducts() {
        fetch('https://fakestoreapi.com/products')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(products => {
                allProducts = products;
                displayProducts(products);
            })
            .catch(error => {
                console.error('Erro ao carregar produtos:', error);
                alert('Erro ao carregar produtos. Tente novamente mais tarde.');
            });
    }

    function displayProducts(products) {
        productsDiv.innerHTML = '';
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.innerHTML = `
                <h3>${product.title}</h3>
                <img src="${product.image}" alt="${product.title}" width="100">
                <p>${product.description}</p>
                <p><strong>$${product.price}</strong></p>
                <button onclick="addToCart(${product.id}, '${product.title}', ${product.price}, '${product.image}')">Adicionar ao Carrinho</button>
            `;
            productsDiv.appendChild(productDiv);
        });
    }

    window.addToCart = function (id, title, price, image) {
        const product = cart.find(item => item.id === id);
        if (product) {
            product.quantity++;
        } else {
            cart.push({ id, title, price, image, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        updateCartCount();
        showNotification(`"${title}" foi adicionado ao carrinho!`);
    }

    function updateCart() {
        cartItemsDiv.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            cartItemsDiv.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="cart-item-info">
                        ${item.title} - $${item.price} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button class="remove-button" onclick="removeFromCart(${item.id})">Remover</button>
                </div>
            `;
        });
        cartTotalDiv.innerHTML = `Total: $${total.toFixed(2)}`;
    }

    window.removeFromCart = function (id) {
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        updateCartCount();
    }

    function displayModalCart() {
        modalCartItems.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            modalCartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="cart-item-info">
                        <strong>${item.title}</strong> <br>
                        Quantidade: ${item.quantity} <br>
                        Preço unitário: $${item.price.toFixed(2)} <br>
                        Total: $${itemTotal.toFixed(2)}
                    </div>
                    <button class="remove-button" onclick="removeFromCart(${item.id})">Remover</button>
                </div><hr>
            `;
        });
        modalCartTotal.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
        cartModal.style.display = 'flex';
    }

    closeModal.addEventListener('click', function () {
        cartModal.style.display = 'none';
    });

    cartLink.addEventListener('click', function (e) {
        e.preventDefault();
        displayModalCart();
    });

    document.getElementById('checkoutButtonModal').addEventListener('click', function () {
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        showNotification('Pedido confirmado!');
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        updateCartCount();
        cartModal.style.display = 'none';
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            filterProducts(category);
        });
    });

    function filterProducts(category) {
        if (category === 'all') {
            displayProducts(allProducts);
        } else {
            const filteredProducts = allProducts.filter(product => product.category === category);
            displayProducts(filteredProducts);
        }
    }

    searchBar.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        const filteredProducts = allProducts.filter(product => product.title.toLowerCase().includes(searchTerm));
        displayProducts(filteredProducts);
    });

    loadProducts();
    updateCartCount();
});
