// LocalAI Builder - Main JavaScript File
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initPromptForm();
    initFAQ();
    initCarousel();
    initPricing();
    initCart();
    initCheckout();
    initAccount();
    
    // Handle URL parameters
    handleURLParams();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on links
        navLinks.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
}

// Prompt form functionality
function initPromptForm() {
    const aiPrompt = document.getElementById('aiPrompt');
    const wordCount = document.getElementById('wordCount');
    const followUp = document.getElementById('followUp');
    const btnStart = document.getElementById('btnStart');
    
    if (aiPrompt && wordCount) {
        // Word count functionality
        aiPrompt.addEventListener('input', function() {
            const words = this.value.trim().split(/\s+/).filter(word => word.length > 0);
            const count = words.length;
            wordCount.textContent = count;
            
            // Show follow-up fields if less than 15 words
            if (followUp) {
                if (count > 0 && count < 15) {
                    followUp.classList.remove('hidden');
                } else {
                    followUp.classList.add('hidden');
                }
            }
        });
        
        // Handle blur event for word count check
        aiPrompt.addEventListener('blur', function() {
            const words = this.value.trim().split(/\s+/).filter(word => word.length > 0);
            const count = words.length;
            
            if (followUp && count > 0 && count < 15) {
                followUp.classList.remove('hidden');
            }
        });
    }
    
    // Handle start button click
    if (btnStart) {
        btnStart.addEventListener('click', function() {
            // Store form data in localStorage
            if (aiPrompt) {
                const formData = {
                    prompt: aiPrompt.value,
                    companyName: document.getElementById('companyName')?.value || '',
                    brandColor: document.getElementById('brandColor')?.value || '#2e8b57',
                    contactEmail: document.getElementById('contactEmail')?.value || ''
                };
                localStorage.setItem('aiBuilderFormData', JSON.stringify(formData));
            }
            
            // Redirect to pricing page
            window.location.href = 'pricing.html';
        });
    }
}

// FAQ accordion functionality
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

// Carousel functionality
function initCarousel() {
    const carousel = document.querySelector('.reviews-carousel');
    if (!carousel) return;
    
    const track = carousel.querySelector('.review-track');
    const cards = carousel.querySelectorAll('.review-card');
    const indicators = carousel.querySelectorAll('.indicator');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    
    let currentSlide = 0;
    
    function showSlide(index) {
        // Remove active class from all cards and indicators
        cards.forEach(card => card.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to current slide
        if (cards[index]) {
            cards[index].classList.add('active');
        }
        if (indicators[index]) {
            indicators[index].classList.add('active');
        }
        
        // Move track
        if (track) {
            track.style.transform = `translateX(-${index * 100}%)`;
        }
        
        currentSlide = index;
    }
    
    // Next slide
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % cards.length;
        showSlide(nextIndex);
    }
    
    // Previous slide
    function prevSlide() {
        const prevIndex = (currentSlide - 1 + cards.length) % cards.length;
        showSlide(prevIndex);
    }
    
    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    // Indicator clicks
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showSlide(index));
    });
    
    // Auto-advance carousel
    setInterval(nextSlide, 5000);
    
    // Initialize first slide
    showSlide(0);
}

// Pricing page functionality
function initPricing() {
    // This function is called when a plan is selected
    window.selectPlan = function(planName) {
        // Get URL parameters to check for industry
        const urlParams = new URLSearchParams(window.location.search);
        const industry = urlParams.get('industry');
        
        // Build cart URL
        let cartUrl = `cart.html?plan=${planName}`;
        if (industry) {
            cartUrl += `&industry=${industry}`;
        }
        
        // Redirect to cart
        window.location.href = cartUrl;
    };
}

// Cart functionality
function initCart() {
    if (!window.location.pathname.includes('cart.html')) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    const industry = urlParams.get('industry');
    
    // Plan details
    const plans = {
        free: {
            name: 'Free',
            price: 0,
            features: [
                '1 website',
                'HTTPS hosting',
                '1 prompt-generated site',
                'Industry SEO pages (view only)'
            ]
        },
        starter: {
            name: 'Starter',
            price: 29,
            features: [
                '3 websites',
                'Custom domain support',
                'HTTPS hosting',
                '10 prompt-generated sites',
                'Membership/Login areas',
                '24/7 AI Chat Support',
                'Industry SEO pages',
                'Stripe & PayPal checkout',
                '3 team seats',
                '10% annual billing discount'
            ]
        },
        pro: {
            name: 'Pro',
            price: 50,
            features: [
                '10 websites',
                'Custom domain support',
                'HTTPS hosting',
                '50 prompt-generated sites',
                'Membership/Login areas',
                '24/7 AI Chat Support',
                'Industry SEO pages',
                'Stripe & PayPal checkout',
                'White-label export',
                '10 team seats',
                '10% annual billing discount'
            ]
        },
        agency: {
            name: 'Agency',
            price: 99,
            features: [
                'Unlimited websites',
                'Custom domain support',
                'HTTPS hosting',
                'Unlimited prompt-generated sites',
                'Membership/Login areas',
                '24/7 AI Chat Support',
                'Industry SEO pages',
                'Stripe & PayPal checkout',
                'White-label export',
                'Unlimited team seats',
                '15% annual billing discount'
            ]
        }
    };
    
    const selectedPlan = plans[plan];
    if (!selectedPlan) {
        // Redirect to pricing if no valid plan
        window.location.href = 'pricing.html';
        return;
    }
    
    // Populate cart summary
    const cartSummary = document.getElementById('cartSummary');
    if (cartSummary) {
        const industryText = industry ? ` (${industry.replace('-', ' ')})` : '';
        cartSummary.innerHTML = `
            <h3>${selectedPlan.name} Plan${industryText}</h3>
            <ul class="plan-features">
                ${selectedPlan.features.map(feature => `<li>✓ ${feature}</li>`).join('')}
            </ul>
        `;
    }
    
    // Handle billing frequency change
    const billingInputs = document.querySelectorAll('input[name="billing"]');
    const subtotalAmount = document.getElementById('subtotalAmount');
    const discountLine = document.getElementById('discountLine');
    const discountAmount = document.getElementById('discountAmount');
    const totalAmount = document.getElementById('totalAmount');
    
    function updateTotals() {
        const isAnnual = document.querySelector('input[name="billing"]:checked').value === 'annual';
        const monthlyPrice = selectedPlan.price;
        let subtotal, discount = 0, total;
        
        // Free plan is always $0
        if (plan === 'free') {
            subtotal = 0;
            total = 0;
            discountLine.style.display = 'none';
        } else if (isAnnual) {
            subtotal = monthlyPrice * 12;
            // Different discount rates for different plans
            let discountRate = 0.10; // Default 10% for starter and pro
            if (plan === 'agency') {
                discountRate = 0.15; // 15% for agency
            }
            discount = Math.round(subtotal * discountRate);
            total = subtotal - discount;
            discountLine.style.display = 'flex';
        } else {
            subtotal = monthlyPrice;
            total = subtotal;
            discountLine.style.display = 'none';
        }
        
        subtotalAmount.textContent = `$${subtotal}`;
        discountAmount.textContent = `-$${discount}`;
        totalAmount.textContent = `$${total}`;
    }
    
    billingInputs.forEach(input => {
        input.addEventListener('change', updateTotals);
    });
    
    // Initialize totals
    updateTotals();
    
    // Handle back button
    window.goBack = function() {
        window.history.back();
    };
    
    // Handle proceed to checkout
    window.proceedToCheckout = function() {
        const billing = document.querySelector('input[name="billing"]:checked').value;
        let checkoutUrl = `checkout.html?plan=${plan}&billing=${billing}`;
        if (industry) {
            checkoutUrl += `&industry=${industry}`;
        }
        window.location.href = checkoutUrl;
    };
}

// Checkout functionality
function initCheckout() {
    if (!window.location.pathname.includes('checkout.html')) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    const billing = urlParams.get('billing');
    const industry = urlParams.get('industry');
    
    // Plan details (same as cart)
    const plans = {
        free: { name: 'Free', price: 0 },
        starter: { name: 'Starter', price: 29 },
        pro: { name: 'Pro', price: 50 },
        agency: { name: 'Agency', price: 99 }
    };
    
    const selectedPlan = plans[plan];
    if (!selectedPlan) {
        window.location.href = 'pricing.html';
        return;
    }
    
    // Calculate total
    const isAnnual = billing === 'annual';
    const monthlyPrice = selectedPlan.price;
    let total;
    
    // Free plan is always $0
    if (plan === 'free') {
        total = 0;
    } else if (isAnnual) {
        const subtotal = monthlyPrice * 12;
        // Different discount rates for different plans
        let discountRate = 0.10; // Default 10% for starter and pro
        if (plan === 'agency') {
            discountRate = 0.15; // 15% for agency
        }
        const discount = Math.round(subtotal * discountRate);
        total = subtotal - discount;
    } else {
        total = monthlyPrice;
    }
    
    // Populate order summary
    const orderSummary = document.getElementById('checkoutOrderSummary');
    if (orderSummary) {
        const industryText = industry ? ` (${industry.replace('-', ' ')})` : '';
        const billingText = isAnnual ? 'Annual' : 'Monthly';
        
        orderSummary.innerHTML = `
            <div class="order-item">
                <h4>${selectedPlan.name} Plan${industryText}</h4>
                <p>Billing: ${billingText}</p>
                <p class="order-total">Total: $${total}</p>
            </div>
        `;
    }
    
    // Payment method handlers
    window.handleStripePayment = function() {
        alert('Stripe/PayPal integration coming soon! This is a demo version.');
    };
    
    window.handleGooglePay = function() {
        alert('Google Pay integration coming soon! This is a demo version.');
    };
    
    window.handlePayPalPayment = function() {
        alert('PayPal integration coming soon! This is a demo version.');
    };
}

// Account page functionality
function initAccount() {
    if (!window.location.pathname.includes('account.html')) return;
    
    // Tab functionality
    window.showTab = function(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab content
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Add active class to clicked button
        event.target.classList.add('active');
    };
    
    // Account functionality
    window.createNewSite = function() {
        window.location.href = 'index.html';
    };
    
    window.saveProfile = function() {
        alert('Profile saved successfully!');
    };
    
    window.manageBilling = function() {
        alert('Billing management coming soon!');
    };
    
    window.cancelSubscription = function() {
        if (confirm('Are you sure you want to cancel your subscription?')) {
            alert('Subscription cancellation initiated. You will receive a confirmation email.');
        }
    };
}

// Handle URL parameters
function handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    const industry = urlParams.get('industry');
    
    // If on pricing page with plan parameter, highlight the plan
    if (window.location.pathname.includes('pricing.html') && plan) {
        const planCard = document.querySelector(`[onclick="selectPlan('${plan}')"]`)?.closest('.plan-card');
        if (planCard) {
            planCard.style.transform = 'scale(1.02)';
            planCard.style.boxShadow = '0 20px 25px -5px rgba(46, 139, 87, 0.2)';
            planCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form validation helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Local storage helpers
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.warn('Could not read from localStorage:', e);
        return null;
    }
}

// Utility function for handling fetch requests
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}

// Debounce function for input events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.benefit-card, .step, .industry-card').forEach(el => {
    observer.observe(el);
});

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    .benefit-card, .step, .industry-card {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }
        }, 0);
    });
}

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Commented out for now - can be enabled when SW is implemented
        // navigator.serviceWorker.register('/sw.js');
    });
}
