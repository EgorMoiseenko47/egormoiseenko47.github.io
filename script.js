document.addEventListener('DOMContentLoaded', () => {
    // Навигация
    const navToggle = document.getElementById('nav-toggle');
    const navbar = document.querySelector('.navbar');

    navToggle.addEventListener('click', () => {
        navbar.classList.toggle('active');
    });

    // Модальные окна
    const registerModal = document.getElementById('register-modal');
    const loginModal = document.getElementById('login-modal');
    const cartModal = document.getElementById('cart-modal');

    const openRegister = document.getElementById('open-register');
    const openLogin = document.getElementById('open-login');
    const openCart = document.getElementById('open-cart');

    const closeRegister = document.getElementById('close-register');
    const closeLogin = document.getElementById('close-login');
    const closeCart = document.getElementById('close-cart');

    openRegister.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'block';
    });

    openLogin.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'block';
    });

    openCart.addEventListener('click', (e) => {
        e.preventDefault();
        renderCart();
        cartModal.style.display = 'block';
    });

    closeRegister.addEventListener('click', () => {
        registerModal.style.display = 'none';
    });

    closeLogin.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    closeCart.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    // Закрытие модальных окон при клике вне
    window.onclick = function(event) {
        if (event.target == registerModal) {
            registerModal.style.display = 'none';
        }
        if (event.target == loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target == cartModal) {
            cartModal.style.display = 'none';
        }
    }

    // Регистрация
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;

        if (!username || !email || !password) {
            alert('Пожалуйста, заполните все поля.');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];

        // Проверка существования пользователя
        if (users.find(user => user.email === email)) {
            alert('Пользователь с таким email уже существует.');
            return;
        }

        users.push({ username, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Регистрация успешна!');
        registerModal.style.display = 'none';
        registerForm.reset();
    });

    // Вход
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            alert('Пожалуйста, заполните все поля.');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];

        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            alert(`Добро пожаловать, ${user.username}!`);
            localStorage.setItem('currentUser', JSON.stringify(user));
            loginModal.style.display = 'none';
            loginForm.reset();
            updateNavForLoggedInUser();
            updateCartCount();
        } else {
            alert('Неверный email или пароль.');
        }
    });

    // Обновление навигации при входе
    function updateNavForLoggedInUser() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const navLinks = document.querySelector('.nav-links');

        // Удаляем кнопки регистрации и входа
        const registerLink = document.getElementById('open-register');
        const loginLink = document.getElementById('open-login');
        if (registerLink) registerLink.parentElement.remove();
        if (loginLink) loginLink.parentElement.remove();

        // Добавляем приветствие и кнопку выхода
        const userGreeting = document.createElement('li');
        userGreeting.innerHTML = `<a href="#">Привет, ${currentUser.username}</a>`;
        navLinks.appendChild(userGreeting);

        const logoutBtn = document.createElement('li');
        logoutBtn.innerHTML = '<a href="#" id="logout">Выйти</a>';
        navLinks.appendChild(logoutBtn);

        document.getElementById('logout').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            location.reload();
        });
    }

    // Инициализация при загрузке страницы
    function initialize() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            updateNavForLoggedInUser();
        }
        updateCartCount();
    }

    // Реализация корзины покупок
    const addToCartButtons = document.querySelectorAll('.btn-secondary');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });

    function addToCart(e) {
        const productCard = e.target.closest('.product-card');
        const productName = productCard.querySelector('h3').innerText;
        const productPrice = parseInt(productCard.querySelector('.price').innerText.replace(/\D/g, ''));
        const productImage = productCard.querySelector('img').src;

        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        const existingProduct = cart.find(item => item.name === productName);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ name: productName, price: productPrice, image: productImage, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert('Товар добавлен в корзину!');
    }

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((acc, item) => acc + item.quantity, 0);
        document.getElementById('cart-count').innerText = count;
    }

    // Рендер корзины
    function renderCart() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItemsDiv = document.getElementById('cart-items');
        cartItemsDiv.innerHTML = '';

        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p>Ваша корзина пуста.</p>';
            document.getElementById('checkout-btn').style.display = 'none';
            document.getElementById('cart-total').innerText = '0';
            return;
        }

        document.getElementById('checkout-btn').style.display = 'block';

        cart.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            itemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" width="50">
                <div>
                    <h4>${item.name}</h4>
                    <p>Цена: ${item.price}₽</p>
                    <p>Количество: ${item.quantity}</p>
                    <button data-index="${index}" class="remove-item">Удалить</button>
                </div>
            `;
            cartItemsDiv.appendChild(itemDiv);
        });

        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', removeFromCart);
        });

        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        document.getElementById('cart-total').innerText = total;
    }

    function removeFromCart(e) {
        const index = e.target.getAttribute('data-index');
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    }

    // Инициализация
    initialize();
});
// Set the target date and time
const countdownDate = new Date("Dec 31, 2024 23:59:59").getTime();

// Update the countdown every second
const countdownFunction = setInterval(() => {
	const now = new Date().getTime();
	const distance = countdownDate - now;

	// Time calculations for days, hours, minutes, and seconds
	const days = Math.floor(distance / (1000 * 60 * 60 * 24));
	const hours = Math.floor(
		(distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
	);
	const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((distance % (1000 * 60)) / 1000);

	// Update the HTML with the calculated time
	document.getElementById("days").innerHTML = days;
	document.getElementById("hours").innerHTML = ("0" + hours).slice(-2);
	document.getElementById("minutes").innerHTML = ("0" + minutes).slice(-2);
	document.getElementById("seconds").innerHTML = ("0" + seconds).slice(-2);

	// When the countdown is finished, display a message
	if (distance < 0) {
		clearInterval(countdownFunction);
		document.getElementById("countdown").style.display = "none";
		const message = document.getElementById("message");
		message.innerHTML = "Welcome to the Future!";
		message.style.visibility = "visible";
	}
}, 1000);