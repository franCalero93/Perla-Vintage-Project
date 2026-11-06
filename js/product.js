(function() {
    const productCatalog = window.productCatalog;
    const productLayout = document.querySelector('.product-layout');
    const productNotFound = document.getElementById('product-not-found');
    const productErrorMessage = document.getElementById('product-error-message');
    const breadcrumbCategory = document.getElementById('product-breadcrumb-category');
    const productName = document.getElementById('product-name');
    const productPrice = document.getElementById('product-price');
    const comparePrice = document.getElementById('product-compare-price');
    const saleBadge = document.getElementById('product-sale-badge');
    const productDescription = document.getElementById('product-description');
    const productAttributes = document.getElementById('product-attributes');
    const productMeasurements = document.getElementById('product-measurements');
    const pendingMeasurements = document.getElementById('measurements-pending');
    const productAction = document.getElementById('product-action');
    const productGallery = document.querySelector('.product-gallery');
    const mainProductImage = document.getElementById('product-main-image');
    const productThumbnails = document.getElementById('product-thumbnails');
    const previousProductPhoto = document.getElementById('product-gallery-previous');
    const nextProductPhoto = document.getElementById('product-gallery-next');
    const relatedProducts = document.getElementById('related-products');
    const relatedProductsGrid = document.getElementById('related-products-grid');
    let activePhotos = [];
    let currentProductImageIndex = 0;

    function validateProduct(product) {
        if (!product || typeof product.name !== 'string' || !product.name.trim()) {
            throw new Error('Product data must include a name.');
        }
        if (product.availability !== null && product.availability !== undefined &&
            product.availability !== 'available' && product.availability !== 'soldOut') {
            throw new Error('Availability must be "available", "soldOut", or unset for draft data.');
        }
        if (!Array.isArray(product.photos) || !Array.isArray(product.measurements) ||
            !Array.isArray(product.relatedProducts) || !Array.isArray(product.categories)) {
            throw new Error('Product photos, measurements, and related products must be arrays.');
        }
        if (!product.categories.length || !productCatalog.categories.some(function(category) {
            return category.id === product.categories[0];
        })) {
            throw new Error('Product data must include a valid primary category.');
        }

        product.photos.forEach(function(photo) {
            if (!photo || typeof photo.src !== 'string' || !photo.src.trim()) {
                throw new Error('Each product photo must include a source path.');
            }
        });

        product.measurements.forEach(function(measurement) {
            const centimeters = measurement && Number(measurement.cm);
            if (!measurement || typeof measurement.label !== 'string' ||
                !measurement.label.trim() || !Number.isFinite(centimeters) || centimeters <= 0) {
                throw new Error('Each measurement must include a label and a positive centimeter value.');
            }
        });

    }

    function renderPrice(product) {
        const pricing = document.getElementById('product-pricing');
        const pricePresentation = window.productUtils.getPricePresentation(
            product.price,
            product.originalPrice,
            product.currency
        );

        pricing.hidden = pricePresentation.currentPrice === null;
        productPrice.textContent = pricePresentation.currentPrice || '';
        comparePrice.hidden = !pricePresentation.isSale;
        saleBadge.hidden = !pricePresentation.isSale;

        if (pricePresentation.isSale) {
            comparePrice.textContent = pricePresentation.originalPrice;
            productPrice.classList.add('product-price-on-sale');
        } else {
            comparePrice.textContent = '';
            productPrice.classList.remove('product-price-on-sale');
        }
    }

    function renderAttributes(product) {
        productAttributes.replaceChildren();
        const fields = [
            ['Brand', product.brand],
            ['Color', product.color],
            ['Material', product.material],
            ['Era', product.era],
            ['Made in', product.madeIn],
            ['Size', product.size],
            ['Condition', product.condition],
            ['Condition notes', product.conditionNotes]
        ];

        fields.forEach(function(field) {
            if (typeof field[1] !== 'string' || !field[1].trim()) {
                return;
            }

            const row = document.createElement('div');
            const label = document.createElement('dt');
            const value = document.createElement('dd');
            label.textContent = field[0];
            value.textContent = field[1];
            row.append(label, value);
            productAttributes.append(row);
        });

        productAttributes.hidden = productAttributes.childElementCount === 0;
    }

    function renderMeasurements(measurements) {
        productMeasurements.replaceChildren();

        measurements.forEach(function(measurement) {
            const row = document.createElement('div');
            const label = document.createElement('dt');
            const value = document.createElement('dd');
            const cmValue = String(measurement.cm).trim();
            const inches = (Number(cmValue) / 2.54).toFixed(1);

            label.textContent = measurement.label;
            value.textContent = cmValue + ' cm (' + inches + ' in)';
            row.append(label, value);
            productMeasurements.append(row);
        });

        pendingMeasurements.hidden = measurements.length > 0;
    }

    function showProductImage(index) {
        currentProductImageIndex = index;
        const image = activePhotos[index];
        mainProductImage.src = image.src;
        mainProductImage.alt = image.alt || 'Product photograph ' + (index + 1);

        productThumbnails.querySelectorAll('.product-thumbnail').forEach(
            function(button, buttonIndex) {
                button.setAttribute('aria-pressed', String(buttonIndex === index));
            }
        );
    }

    function showAdjacentProductImage(direction) {
        if (!activePhotos.length) {
            return;
        }

        const nextIndex = (currentProductImageIndex + direction + activePhotos.length) % activePhotos.length;
        showProductImage(nextIndex);
    }

    function renderPhotos(photos) {
        activePhotos = photos;
        currentProductImageIndex = 0;
        productThumbnails.replaceChildren();
        productGallery.hidden = photos.length === 0;
        productLayout.classList.toggle('product-layout-no-gallery', photos.length === 0);

        photos.forEach(function(image, index) {
            const thumbnail = document.createElement('button');
            const thumbnailImage = document.createElement('img');
            thumbnail.className = 'product-thumbnail';
            thumbnail.type = 'button';
            thumbnail.setAttribute('aria-label', 'View product photo ' + (index + 1));
            thumbnail.setAttribute('aria-pressed', String(index === 0));
            thumbnailImage.src = image.src;
            thumbnailImage.alt = '';
            thumbnail.append(thumbnailImage);
            thumbnail.addEventListener('click', function() {
                showProductImage(index);
            });
            productThumbnails.append(thumbnail);
        });

        if (photos.length) {
            showProductImage(0);
        }
    }

    function renderAvailability(availability) {
        const labels = {
            available: 'ADD TO CART',
            soldOut: 'SOLD OUT'
        };
        productAction.hidden = !availability;

        if (availability) {
            productAction.textContent = labels[availability];
            productAction.disabled = true;
            productAction.classList.toggle('product-action-sold-out', availability === 'soldOut');
        }
    }

    function renderRelatedProducts(products) {
        relatedProductsGrid.replaceChildren();
        const seenIds = new Set();
        const validProducts = [];

        products.forEach(function(productId) {
            if (typeof productId !== 'string' || !productId.trim()) {
                console.warn('Product "' + productName.dataset.productId +
                    '" has an invalid related product ID; recommendation skipped.');
                return;
            }
            if (productId === productName.dataset.productId) {
                console.warn('Product "' + productId +
                    '" cannot recommend itself; recommendation skipped.');
                return;
            }
            if (seenIds.has(productId)) {
                console.warn('Product "' + productName.dataset.productId +
                    '" repeats related product ID "' + productId + '"; duplicate recommendation skipped.');
                return;
            }

            seenIds.add(productId);
            const product = productCatalog.products.find(function(item) {
                return item.id === productId;
            });

            if (!product) {
                console.warn('Product "' + productName.dataset.productId +
                    '" recommends unknown product ID "' + productId + '"; recommendation skipped.');
                return;
            }

            if (!product.catalogImage || !product.catalogImage.src) {
                console.warn('Related product "' + productId +
                    '" has no catalog image; recommendation skipped.');
                return;
            }

            validProducts.push(product);
        });

        validProducts.forEach(function(product) {
            const card = document.createElement('a');
            const image = document.createElement('img');
            const name = document.createElement('h3');
            const pricePresentation = window.productUtils.getPricePresentation(
                product.price,
                product.originalPrice,
                product.currency
            );

            card.className = 'related-product-card';
            card.href = 'product.html?id=' + encodeURIComponent(product.id);
            image.src = product.catalogImage.src;
            image.alt = product.catalogImage.alt || product.name;
            name.textContent = product.name;
            card.append(image, name);

            if (pricePresentation.currentPrice !== null) {
                const pricing = document.createElement('div');
                const price = document.createElement('p');

                pricing.className = 'related-product-pricing';
                price.className = 'product-price';
                price.textContent = pricePresentation.currentPrice;
                pricing.append(price);

                if (pricePresentation.isSale) {
                    const originalPrice = document.createElement('del');
                    const saleBadge = document.createElement('span');

                    originalPrice.className = 'product-compare-price';
                    originalPrice.textContent = pricePresentation.originalPrice;
                    saleBadge.className = 'product-sale-badge';
                    saleBadge.textContent = 'Sale';
                    pricing.append(originalPrice, saleBadge);
                }

                card.append(pricing);
            }

            relatedProductsGrid.append(card);
        });

        relatedProducts.hidden = validProducts.length === 0;
    }

    function renderProductPage(product) {
        validateProduct(product);
        productLayout.hidden = false;
        productNotFound.hidden = true;
        productName.textContent = product.name;
        productName.dataset.productId = product.id;
        document.title = product.name + ' | Perla Vintage NYC';
        const category = productCatalog.categories.find(function(item) {
            return item.id === product.categories[0];
        });
        breadcrumbCategory.textContent = category.label;
        productDescription.textContent = product.description || '';
        productDescription.hidden = !product.description;
        renderPrice(product);
        renderAttributes(product);
        renderMeasurements(product.measurements);
        renderPhotos(product.photos);
        renderAvailability(product.availability);
        renderRelatedProducts(product.relatedProducts);
    }

    function showProductNotFound(message) {
        productLayout.hidden = true;
        relatedProducts.hidden = true;
        productNotFound.hidden = false;
        productErrorMessage.textContent = message;
        document.title = 'Product Not Found | Perla Vintage NYC';
    }

    previousProductPhoto.addEventListener('click', function() {
        showAdjacentProductImage(-1);
    });

    nextProductPhoto.addEventListener('click', function() {
        showAdjacentProductImage(1);
    });

    window.renderProductPage = renderProductPage;
    const productIdError = window.productUtils.getProductIdError(productCatalog.products);
    const requestedProductId = new URLSearchParams(window.location.search).get('id');
    const matchingProducts = productCatalog.products.filter(function(product) {
        return product && product.id === requestedProductId;
    });

    if (productIdError) {
        showProductNotFound('Product catalog data error: ' + productIdError);
        console.error('Product catalog data error: ' + productIdError);
    } else if (matchingProducts.length === 1) {
        try {
            renderProductPage(matchingProducts[0]);
        } catch (error) {
            if (!(error instanceof Error)) {
                throw error;
            }

            showProductNotFound('Product data error: ' + error.message);
            console.error('Product data error for "' + requestedProductId + '":', error);
        }
    } else if (requestedProductId) {
        showProductNotFound('The product "' + requestedProductId + '" could not be found.');
    } else {
        showProductNotFound('No product was specified.');
    }
})();
