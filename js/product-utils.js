(function() {
    function getProductIdError(products) {
        const seenIds = new Set();

        for (let index = 0; index < products.length; index += 1) {
            const product = products[index];
            const id = product && typeof product.id === 'string'
                ? product.id.trim()
                : '';

            if (!id) {
                return 'Product at position ' + (index + 1) + ' is missing an ID.';
            }
            if (seenIds.has(id)) {
                return 'Duplicate product ID "' + id + '" found.';
            }

            seenIds.add(id);
        }

        return null;
    }

    function formatPrice(amount, currency) {
        if (amount === null || amount === undefined || amount === '' ||
            typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)) {
            return null;
        }

        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount < 0) {
            return null;
        }

        try {
            const currencyFormatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            });
            const maximumFractionDigits = Math.max(
                2,
                currencyFormatter.resolvedOptions().maximumFractionDigits
            );
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: Number.isInteger(numericAmount)
                    ? 0
                    : maximumFractionDigits,
                maximumFractionDigits: maximumFractionDigits
            });

            return formatter.format(numericAmount);
        } catch (error) {
            if (error instanceof RangeError) {
                return null;
            }
            throw error;
        }
    }

    function getPricePresentation(price, originalPrice, currency) {
        const currentPrice = formatPrice(price, currency);
        const validSale = currentPrice !== null &&
            typeof price === 'number' && Number.isFinite(price) && price >= 0 &&
            typeof originalPrice === 'number' && Number.isFinite(originalPrice) &&
            originalPrice > price;

        if (!validSale) {
            return {
                currentPrice: currentPrice,
                originalPrice: null,
                isSale: false
            };
        }

        const formattedOriginalPrice = formatPrice(originalPrice, currency);
        if (formattedOriginalPrice === null) {
            return {
                currentPrice: currentPrice,
                originalPrice: null,
                isSale: false
            };
        }

        return {
            currentPrice: currentPrice,
            originalPrice: formattedOriginalPrice,
            isSale: true
        };
    }

    window.productUtils = {
        getProductIdError: getProductIdError,
        formatPrice: formatPrice,
        getPricePresentation: getPricePresentation
    };
})();
