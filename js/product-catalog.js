/*	Genera las tarjetas de productos utilizando esos datos */

(function() {
    const catalog = window.productCatalog;
    const catalogStatus = document.querySelector('.shop-preview-note');
    const categoryIds = new Set(catalog.categories.map(function(category) {
        return category.id;
    }));

    function createImage(image) {
        const element = document.createElement('img');
        element.src = image.src;
        element.alt = image.alt;

        if (image.width) {
            element.width = image.width;
        }
        if (image.height) {
            element.height = image.height;
        }
        if (image.loading) {
            element.loading = image.loading;
        }

        return element;
    }

    function createCardContent(image, name, pricePresentation) {
        const imageContainer = document.createElement('div');
        const title = document.createElement('h3');
        const priceContainer = document.createElement('div');
        const priceElement = document.createElement('p');

        imageContainer.className = 'product-img';
        imageContainer.append(createImage(image));
        title.textContent = name;
        priceContainer.className = 'product-card-pricing';
        priceElement.className = 'price-product';
        priceElement.textContent = pricePresentation.currentPrice || '';
        priceElement.hidden = pricePresentation.currentPrice === null;
        priceContainer.append(priceElement);

        if (pricePresentation.isSale) {
            const originalPrice = document.createElement('del');
            const saleBadge = document.createElement('span');

            originalPrice.className = 'product-card-original-price';
            originalPrice.textContent = pricePresentation.originalPrice;
            saleBadge.className = 'product-card-sale-badge';
            saleBadge.textContent = 'Sale';
            priceContainer.append(originalPrice, saleBadge);
        }

        return [imageContainer, title, priceContainer];
    }

    function createProductCard(product) {
        const article = document.createElement('article');
        const link = document.createElement('a');
        const addButton = document.createElement('button');

        article.className = 'products';
        link.className = 'shop-product-link';
        link.href = 'product.html?id=' + encodeURIComponent(product.id);
        link.setAttribute('aria-label', 'View ' + product.name + ' product details');
        link.append.apply(link, createCardContent(
            product.catalogImage,
            product.name,
            window.productUtils.getPricePresentation(
                product.price,
                product.originalPrice,
                product.currency
            )
        ));

        addButton.className = 'add-to-cart';
        addButton.type = 'button';
        addButton.disabled = true;
        addButton.setAttribute('aria-label', 'Add ' + product.name + ' to cart (coming soon)');
        addButton.textContent = 'ADD TO CART';
        article.append(link, addButton);

        return article;
    }

    function createUnidentifiedCard(item) {
        const article = document.createElement('article');
        const button = document.createElement('button');

        article.className = 'products';
        article.append.apply(article, createCardContent(
            item.image,
            item.name,
            {
                currentPrice: item.priceLabel,
                originalPrice: null,
                isSale: false
            }
        ));

        button.className = 'add-to-cart';
        button.type = 'button';
        button.disabled = true;
        button.setAttribute('aria-label', 'Product details coming soon');
        button.textContent = 'ADD TO CART';
        article.append(button);

        return article;
    }

    const productIdError = window.productUtils.getProductIdError(catalog.products);
    if (productIdError) {
        catalogStatus.textContent = 'Catalog data error: ' + productIdError;
        console.error('Catalog data error: ' + productIdError);
    }

    const invalidCategory = productIdError ? null : catalog.products.find(function(product) {
        return product.categories.some(function(categoryId) {
            return !categoryIds.has(categoryId);
        });
    });

    if (invalidCategory && !productIdError) {
        throw new Error('Product "' + invalidCategory.id + '" uses an unknown catalog category.');
    }

    function renderProductCatalog() {
        if (productIdError) {
            return;
        }

        catalog.categories.forEach(function(category) {
            const grid = document.querySelector(
                '.shop-category#' + category.id + ' .shop-product-grid'
            );

            if (!grid) {
                throw new Error('Missing product grid for category "' + category.id + '".');
            }

            grid.replaceChildren();
            catalog.products.forEach(function(product) {
                if (product.categories.includes(category.id)) {
                    grid.append(createProductCard(product));
                }
            });

            if (category.id === 'new-arrivals') {
                catalog.unidentifiedNewArrivals.forEach(function(item) {
                    grid.append(createUnidentifiedCard(item));
                });
            }
        });
    }

    window.renderProductCatalog = renderProductCatalog;
    renderProductCatalog();
})();
