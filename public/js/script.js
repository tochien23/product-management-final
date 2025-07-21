// Modern Client Alert System - Fixed Version
const allClientAlerts = document.querySelectorAll("[show-alert]");

// Enhanced hide alert function for client
function hideClientAlert(alertElement) {
    if (alertElement) {
        alertElement.classList.add("alert-hidden");
        
        // Remove element from DOM after animation completes
        setTimeout(() => {
            if (alertElement && alertElement.parentNode) {
                alertElement.parentNode.removeChild(alertElement);
            }
        }, 500); // Increased timeout to match animation
    }
}

// Process each client alert individually
allClientAlerts.forEach((showAlert, index) => {
    if (!showAlert) return;
    
    const time = parseInt(showAlert.getAttribute("data-time")) || 5000;
    const closeAlert = showAlert.querySelector("[close-alert]");
    let autoHideTimer = null;
    let isPaused = false;
    let timeRemaining = time;
    let startTime = Date.now();

    // Stagger multiple alerts
    if (allClientAlerts.length > 1) {
        showAlert.style.top = `${1 + (index * 5)}rem`;
    }

    // Start auto-hide timer
    function startTimer() {
        if (autoHideTimer) {
            clearTimeout(autoHideTimer);
        }
        
        autoHideTimer = setTimeout(() => {
            hideClientAlert(showAlert);
        }, timeRemaining);
        
        startTime = Date.now();
        isPaused = false;
    }

    // Pause timer
    function pauseTimer() {
        if (autoHideTimer && !isPaused) {
            clearTimeout(autoHideTimer);
            timeRemaining = Math.max(0, timeRemaining - (Date.now() - startTime));
            isPaused = true;
        }
    }

    // Manual close functionality
    if (closeAlert) {
        closeAlert.addEventListener("click", () => {
            if (autoHideTimer) {
                clearTimeout(autoHideTimer);
            }
            hideClientAlert(showAlert);
        });
    }

    // Add progress bar animation for client alerts
    if (showAlert.classList.contains('client-alert') && time > 0) {
        const progressBar = document.createElement('div');
        progressBar.className = 'client-progress-bar';
        progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: currentColor;
            opacity: 0.3;
            border-radius: 0 0 0.75rem 0.75rem;
            animation: clientAlertProgress linear ${time}ms;
            transform-origin: left center;
            width: 100%;
        `;
        showAlert.appendChild(progressBar);

        // Pause progress bar on hover
        showAlert.addEventListener('mouseenter', () => {
            progressBar.style.animationPlayState = 'paused';
            pauseTimer();
        });

        // Resume progress bar on mouse leave
        showAlert.addEventListener('mouseleave', () => {
            progressBar.style.animationPlayState = 'running';
            if (timeRemaining > 0) {
                // Update animation duration to remaining time
                progressBar.style.animation = `clientAlertProgress linear ${timeRemaining}ms`;
                startTimer();
            }
        });
    } else {
        // For non-client alerts, still handle hover pause
        showAlert.addEventListener('mouseenter', () => {
            pauseTimer();
        });

        showAlert.addEventListener('mouseleave', () => {
            if (timeRemaining > 0) {
                startTimer();
            }
        });
    }

    // Start the initial timer
    startTimer();
});
// End Modern Client Alert System

// Enhanced Product List Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize product list enhancements
    initializeProductList();
});

function initializeProductList() {
    // Filter functionality
    initializeFilters();
    
    // View toggle functionality
    initializeViewToggle();
    
    // Product card animations
    initializeProductAnimations();
    
    // Pagination enhancement
    initializePagination();
    
    // Tooltip initialization
    initializeTooltips();
}

// Filter Functions for Global Access
function applyFilters() {
    const products = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    const searchTerm = document.getElementById('productSearch').value.toLowerCase().trim();
    const selectedPriceRange = document.querySelector('input[name="priceRange"]:checked')?.value;
    const featuredOnly = document.getElementById('featuredOnly').checked;
    const discountOnly = document.getElementById('discountOnly').checked;

    products.forEach(product => {
        let matches = true;

        // Search filter
        if (searchTerm) {
            const title = product.dataset.title || product.querySelector('.product-title a').textContent.toLowerCase();
            if (!title.includes(searchTerm)) {
                matches = false;
            }
        }

        // Price range filter
        if (selectedPriceRange && selectedPriceRange !== '') {
            const price = parseFloat(product.dataset.price);
            if (!matchesPriceRange(price, selectedPriceRange)) {
                matches = false;
            }
        }

        // Featured filter
        if (featuredOnly && product.dataset.featured !== "1") {
            matches = false;
        }

        // Discount filter
        if (discountOnly && (!product.dataset.discount || product.dataset.discount == "0")) {
            matches = false;
        }

        // Show/hide product
        const productColumn = product.closest('[class*="col-"]');
        if (matches) {
            productColumn.style.display = 'block';
            visibleCount++;
        } else {
            productColumn.style.display = 'none';
        }
    });

    updateResultsCount(visibleCount);
    showFilterFeedback();
}

function resetFilters() {
    // Reset all form controls
    document.getElementById('productSearch').value = '';
    document.getElementById('priceAll').checked = true;
    document.getElementById('featuredOnly').checked = false;
    document.getElementById('discountOnly').checked = false;
    document.getElementById('sortSelect').value = '';

    // Show all products
    document.querySelectorAll('.product-card').forEach(product => {
        product.closest('[class*="col-"]').style.display = 'block';
    });

    updateResultsCount(document.querySelectorAll('.product-card').length);
    showToast('Đã đặt lại tất cả bộ lọc', 'success');
}

// Enhanced Filters
function initializeFilters() {
    // Price range filters
    const priceFilters = document.querySelectorAll('input[name="priceRange"]');
    priceFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });

    // Special feature filters
    const specialFilters = document.querySelectorAll('.special-filters input[type="checkbox"]');
    specialFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });

    // Search input with real-time filtering
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                applyFilters();
            }, 300);
        });
    }
}

// Global function for sorting
function sortProducts(sortType) {
    if (!sortType) return;
    
    const productsContainer = document.querySelector('#productsGrid .row');
    if (!productsContainer) return;

    const products = Array.from(productsContainer.children);
    
    products.sort((a, b) => {
        return compareProducts(a, b, sortType);
    });

    // Animate sorting
    productsContainer.style.opacity = '0.5';
    
    setTimeout(() => {
        products.forEach(product => productsContainer.appendChild(product));
        productsContainer.style.opacity = '1';
    }, 200);
}

function matchesPriceRange(price, range) {
    if (!price || isNaN(price)) return true;
    
    switch (range) {
        case '0-100':
            return price < 100;
        case '100-500':
            return price >= 100 && price <= 500;
        case '500-1000':
            return price >= 500 && price <= 1000;
        case '1000+':
            return price > 1000;
        default:
            return true;
    }
}



function compareProducts(a, b, sortType) {
    const getPrice = (product) => {
        const priceEl = product.querySelector('.price-new');
        return priceEl ? parseFloat(priceEl.textContent.replace('$', '')) : 0;
    };

    const getTitle = (product) => {
        const titleEl = product.querySelector('.product-title a');
        return titleEl ? titleEl.textContent.toLowerCase() : '';
    };

    switch (sortType) {
        case 'price-asc':
            return getPrice(a) - getPrice(b);
        case 'price-desc':
            return getPrice(b) - getPrice(a);
        case 'name-asc':
            return getTitle(a).localeCompare(getTitle(b));
        case 'name-desc':
            return getTitle(b).localeCompare(getTitle(a));
        case 'newest':
            return 0; // Keep original order for newest
        case 'popular':
            return Math.random() - 0.5; // Random for demo
        case 'rating':
            return Math.random() - 0.5; // Random for demo
        default:
            return 0;
    }
}



// View Toggle
function initializeViewToggle() {
    const gridViewBtn = document.getElementById('gridView');
    const listViewBtn = document.getElementById('listView');
    const productsGrid = document.querySelector('.products-grid');

    if (!gridViewBtn || !listViewBtn || !productsGrid) return;

    gridViewBtn.addEventListener('change', function() {
        if (this.checked) {
            productsGrid.classList.remove('list-view');
            productsGrid.classList.add('grid-view');
            animateViewChange();
        }
    });

    listViewBtn.addEventListener('change', function() {
        if (this.checked) {
            productsGrid.classList.remove('grid-view');
            productsGrid.classList.add('list-view');
            animateViewChange();
        }
    });
}

function animateViewChange() {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach((product, index) => {
        product.style.opacity = '0';
        product.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            product.style.opacity = '1';
            product.style.transform = 'scale(1)';
            product.style.transition = 'all 0.3s ease';
        }, index * 30);
    });
}

// Product Animations
function initializeProductAnimations() {
    // Hover animations for product cards
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('animate__animated', 'animate__pulse');
        });

        card.addEventListener('mouseleave', function() {
            this.classList.remove('animate__animated', 'animate__pulse');
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    }, observerOptions);

    productCards.forEach(card => {
        observer.observe(card);
    });
}



// Enhanced Pagination
function initializePagination() {
    const paginationLinks = document.querySelectorAll('.pagination .page-link');
    
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.pagination .page-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.parentElement.classList.add('active');
            
            // Scroll to top of products
            document.querySelector('.products-main').scrollIntoView({
                behavior: 'smooth'
            });
            
            // Show loading animation
            showLoadingAnimation();
        });
    });
}

// Tooltip Initialization
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Utility Functions
function updateResultsCount(count) {
    const resultElement = document.querySelector('.result-count');
    if (resultElement) {
        resultElement.textContent = `Tìm thấy ${count} sản phẩm`;
    }
}

function showFilterFeedback() {
    const applyBtn = document.getElementById('applyFilters');
    if (applyBtn) {
        const originalText = applyBtn.innerHTML;
        applyBtn.innerHTML = '<i class="fas fa-check me-2"></i>Đã áp dụng!';
        applyBtn.classList.add('btn-success');
        applyBtn.classList.remove('btn-primary');
        
        setTimeout(() => {
            applyBtn.innerHTML = originalText;
            applyBtn.classList.remove('btn-success');
            applyBtn.classList.add('btn-primary');
        }, 2000);
    }
}

function showLoadingAnimation() {
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
        productsGrid.style.opacity = '0.5';
        
        setTimeout(() => {
            productsGrid.style.opacity = '1';
        }, 800);
    }
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#22c55e' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add CSS animations for toasts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        font-weight: 500;
    }
`;
document.head.appendChild(style);