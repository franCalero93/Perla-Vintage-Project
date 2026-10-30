const hamburger = document.getElementById('hamburger'); /* Busca el elemento cuyo ID es "hamburguesa"*/
const menuMovil = document.getElementById('menu-movil');

hamburger.addEventListener('click', function() {
    const menuAbierto = menuMovil.classList.toggle('abierto');

    hamburger.setAttribute('aria-expanded', menuAbierto);
    hamburger.setAttribute(
        'aria-label',
        menuAbierto ? 'Cerrar menú' : 'Abrir menú'
    );
});

menuMovil.querySelectorAll('a').forEach(function(enlace) { /*a viene de los enlaces dentro del menú móvil, for each es un método que permite iterar sobre una lista de elementos, y function es la función que se ejecutará para cada enlace*/
    enlace.addEventListener('click', function() {
        menuMovil.classList.remove('abierto'); /* Cuando se hace clic en un enlace, se cierra el menú móvil eliminando la clase "abierto" del elemento del menú móvil. Esto asegura que el menú se cierre después de seleccionar una opción. */
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Abrir menú');
    });
});

const shopCategoryPicker = document.getElementById('shop-category-picker');

if (shopCategoryPicker) {
    const shopCategoryTrigger = document.getElementById('shop-category-picker-trigger');
    const shopCategoryOptions = document.getElementById('shop-category-options');
    const shopCategoryCurrent = document.getElementById('shop-category-current');
    const shopCategoryButtons = Array.from(
        shopCategoryPicker.querySelectorAll('.shop-category-option')
    );
    const shopCategories = shopCategoryButtons.map(
        function(button) {
            return button.dataset.category;
        }
    );

    function openShopCategoryPicker() {
        const triggerRect = shopCategoryTrigger.getBoundingClientRect();
        const availableAbove = triggerRect.top - 4;
        const availableBelow = window.innerHeight - triggerRect.bottom - 4;
        const maxOptionsHeight = Math.min(320, window.innerHeight * 0.6);
        const minimumOptionsHeight = Math.min(180, maxOptionsHeight);
        const opensUp = availableBelow < minimumOptionsHeight && availableAbove > availableBelow;
        const availableSpace = opensUp ? availableAbove : availableBelow;

        shopCategoryPicker.classList.toggle('opens-up', opensUp);
        shopCategoryOptions.style.maxHeight =
            Math.max(0, Math.min(maxOptionsHeight, availableSpace) - 1) + 'px';
        shopCategoryOptions.hidden = false;
        shopCategoryTrigger.setAttribute('aria-expanded', 'true');
    }

    function closeShopCategoryPicker(returnFocus) {
        shopCategoryTrigger.setAttribute('aria-expanded', 'false');
        shopCategoryOptions.hidden = true;
        shopCategoryOptions.style.maxHeight = '';
        shopCategoryPicker.classList.remove('opens-up');

        if (returnFocus) {
            shopCategoryTrigger.focus();
        }
    }

    function activateShopCategory(categoryId, updateHash) {
        if (!shopCategories.includes(categoryId)) {
            return;
        }

        document.querySelectorAll('.shop-category').forEach(
            function(categorySection) {
                categorySection.hidden = categorySection.id !== categoryId; /* Oculta esta seccion si su id no coincide con la categoryId seleccionada. */
            }
        );

        document.querySelectorAll('.shop-category-nav a').forEach(
            function(categoryLink) {
                if (categoryLink.hash.slice(1) === categoryId) {
                    categoryLink.setAttribute('aria-current', 'true');
                } else {
                    categoryLink.removeAttribute('aria-current');
                }
            }
        );

        const selectedButton = shopCategoryButtons.find(
            function(button) {
                return button.dataset.category === categoryId;
            }
        );
        shopCategoryCurrent.textContent = selectedButton.textContent.trim();
        shopCategoryTrigger.setAttribute(
            'aria-label',
            'Choose category: ' + selectedButton.textContent.trim()
        );

        shopCategoryButtons.forEach(
            function(button) {
                button.setAttribute(
                    'aria-pressed',
                    button.dataset.category === categoryId ? 'true' : 'false'
                );
            }
        );

        if (updateHash && window.location.hash !== '#' + categoryId) {
            window.location.hash = categoryId;
        }
    }

    document.querySelectorAll('.shop-category-nav a').forEach(
        function(categoryLink) {
            categoryLink.addEventListener('click', function(event) {
                event.preventDefault();
                activateShopCategory(categoryLink.hash.slice(1), true);
            });
        }
    );

    shopCategoryTrigger.addEventListener('click', function() {
        const isExpanded = shopCategoryTrigger.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            closeShopCategoryPicker(false);
        } else {
            openShopCategoryPicker();
        }
    });

    shopCategoryTrigger.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowDown' && shopCategoryOptions.hidden) {
            event.preventDefault();
            shopCategoryTrigger.click();
            shopCategoryButtons[0].focus();
        }
    });

    shopCategoryButtons.forEach(
        function(button) {
            button.addEventListener('click', function() {
                activateShopCategory(button.dataset.category, true);
                closeShopCategoryPicker(true);
            });
        }
    );

    document.addEventListener('click', function(event) {
        if (!shopCategoryPicker.contains(event.target)) {
            closeShopCategoryPicker(false);
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !shopCategoryOptions.hidden) {
            closeShopCategoryPicker(true);
        }
    });

    window.addEventListener('resize', function() {
        if (!shopCategoryOptions.hidden) {
            openShopCategoryPicker();
        }
    });

    window.addEventListener('hashchange', function() {
        const categoryId = window.location.hash.slice(1);
        activateShopCategory(
            shopCategories.includes(categoryId) ? categoryId : 'new-arrivals',
            false
        );
    });

    const initialCategoryId = window.location.hash.slice(1);
    activateShopCategory(
        shopCategories.includes(initialCategoryId) ? initialCategoryId : 'new-arrivals',
        false
    );
}
