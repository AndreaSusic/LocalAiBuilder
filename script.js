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
    initSignup();
    initLoginModal();
    
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
    const prompt   = document.getElementById('aiPrompt');
    const wordCount = document.getElementById('wordCount');
    const followUp = document.getElementById('followUp');
    const btnStart = document.getElementById('btnStart');

    const wraps = {
        company:  document.getElementById('wrapCompany'),
        city:     document.getElementById('wrapCity'),
        industry: document.getElementById('wrapIndustry'),
        lang:     document.getElementById('wrapLang'),
        colors:   document.getElementById('wrapColors')
    };

    // Helper
    function show(id, yes){ 
        if (wraps[id]) {
            wraps[id].hidden = !yes; 
        }
    }

    function evaluate(text){
        // Wait until user has typed ≥10 chars
        if (text.length < 10){
            if (followUp) followUp.classList.remove('show');
            Object.values(wraps).forEach(el => {
                if (el) el.hidden = true;
            });
            return;
        }

        const t = text.toLowerCase();

        const needCompany  = !/(clinic|studio|agency|inc|ltd|corp|company|d\.o\.o|dental)/i.test(t);
        const needCity     = !/\b(austin|belgrade|london|new york|novi sad|paris|[a-z]+ city)\b/i.test(t);
        const needIndustry = !/(dental|plumbing|lawn|roof|law|marketing|design)/i.test(t);
        const needLang     = !/(english|spanish|german|serbian)/i.test(t);

        const anyMissing = needCompany || needCity || needIndustry || needLang;

        if (followUp) followUp.classList.toggle('show', anyMissing);

        show('company',  needCompany);
        show('city',     needCity);
        show('industry', needIndustry);
        show('lang',     needLang);
        show('colors',   anyMissing);
    }
    
    if (prompt && wordCount) {
        // Word count functionality and evaluation
        prompt.addEventListener('input', function() {
            const words = this.value.trim().split(/\s+/).filter(word => word.length > 0);
            const count = words.length;
            wordCount.textContent = count;
            
            // Run evaluate on every keystroke
            evaluate(this.value.trim());
        });
        
        // Start hidden
        evaluate('');
    }
    
    // Handle start button click
    if (btnStart) {
        btnStart.addEventListener('click', function() {
            // Store form data in localStorage
            if (prompt) {
                const formData = {
                    prompt: prompt.value,
                    companyName: document.getElementById('companyName')?.value || '',
                    companyCity: document.getElementById('companyCity')?.value || '',
                    industry: document.getElementById('industry')?.value || '',
                    siteLang: document.getElementById('siteLang')?.value || 'English',
                    primaryColor: document.getElementById('primaryColor')?.value || '#ffc000',
                    secondaryColor: document.getElementById('secondaryColor')?.value || '#000000'
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
    if (!window.location.pathname.includes('pricing.html')) return;
    
    // Initialize toggle elements
    const toggleBtn = document.querySelector('.toggle-btn');
    const checkbox = document.getElementById('billingToggle');
    const switchElement = document.querySelector('.switch');
    const plansWrapper = document.getElementById('plansWrapper');
    const priceAmounts = document.querySelectorAll('.amount[data-monthly]');
    const periodLabels = document.querySelectorAll('.period[data-lang="perMonth"]');

    if (!toggleBtn || !checkbox || !switchElement) {
        console.warn('Toggle component elements not found');
        return;
    }

    // Initialize state
    function updateMode() {
        if (checkbox.checked) {
            // Monthly mode (checkbox checked - slider on right)
            toggleBtn.classList.add('monthly-mode');
            toggleBtn.classList.remove('annual-mode');
            switchElement.setAttribute('aria-checked', 'true');
        } else {
            // Annual mode (checkbox unchecked - slider on left) 
            toggleBtn.classList.add('annual-mode');
            toggleBtn.classList.remove('monthly-mode');
            switchElement.setAttribute('aria-checked', 'false');
        }
        
        updatePrices();
    }
    
    function updatePrices() {
        const isAnnual = !checkbox.checked; // Annual when unchecked (left position)
        
        priceAmounts.forEach(amount => {
            const monthlyPrice = amount.getAttribute('data-monthly');
            const annualPrice = amount.getAttribute('data-annual');
            
            if (isAnnual) {
                // Show annual price divided by 12 for monthly display
                const monthlyFromAnnual = Math.round(annualPrice / 12);
                amount.textContent = monthlyFromAnnual;
            } else {
                amount.textContent = monthlyPrice;
            }
        });
        
        // Update period text
        periodLabels.forEach(period => {
            if (isAnnual) {
                period.textContent = '/month (billed annually)';
            } else {
                period.textContent = '/month';
            }
        });
        
        // Toggle annual class on wrapper
        if (isAnnual) {
            plansWrapper.classList.add('annual');
        } else {
            plansWrapper.classList.remove('annual');
        }
    }

    // Handle checkbox change
    checkbox.addEventListener('change', updateMode);
    
    // Handle keyboard navigation
    switchElement.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            checkbox.checked = !checkbox.checked;
            updateMode();
        }
    });

    // Initial mode setup
    updateMode();
    
    // This function is called when a plan is selected
    window.selectPlan = function(planName) {
        // Get URL parameters to check for industry
        const urlParams = new URLSearchParams(window.location.search);
        const industry = urlParams.get('industry');
        const isAnnual = !checkbox.checked;
        
        // Build signup URL with plan
        let signupUrl = `signup.html?plan=${planName}`;
        if (industry) {
            signupUrl += `&industry=${industry}`;
        }
        if (isAnnual) {
            signupUrl += `&billing=annually`;
        }
        
        // Redirect to signup
        window.location.href = signupUrl;
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
        const billingRadio = document.querySelector('input[name="billing"]:checked');
        const isAnnual = billingRadio ? billingRadio.value === 'annual' : false;
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

// Signup functionality
function initSignup() {
    if (!window.location.pathname.includes('signup.html')) return;
    
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                company: formData.get('company'),
                terms: formData.get('terms'),
                newsletter: formData.get('newsletter')
            };
            
            // Basic validation
            if (!data.firstName || !data.lastName || !data.email || !data.password) {
                alert('Please fill in all required fields.');
                return;
            }
            
            if (!data.terms) {
                alert('You must agree to the Terms of Service to continue.');
                return;
            }
            
            if (data.password.length < 8) {
                alert('Password must be at least 8 characters long.');
                return;
            }
            
            if (!validateEmail(data.email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Store signup data in localStorage (demo purposes)
            saveToLocalStorage('signupData', data);
            
            // Show success message and redirect
            alert('Account created successfully! Redirecting to your dashboard...');
            
            // Redirect to account page after signup
            setTimeout(() => {
                window.location.href = 'account.html?welcome=true';
            }, 1000);
        });
    }
}

// Intersection Observer for animations
if (typeof window !== 'undefined' && !window.goaisite_observer) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    window.goaisite_observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.benefit-card, .step, .industry-card').forEach(el => {
        window.goaisite_observer.observe(el);
    });
}

// Add animation styles dynamically
if (!document.getElementById('goaisite-animations')) {
    const style = document.createElement('style');
    style.id = 'goaisite-animations';
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
}

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

// Login Modal functionality
function initLoginModal() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');

    if (loginBtn && loginModal) {
        // Open modal when login button is clicked
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Close modal when close button is clicked
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                loginModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }

        // Close modal when clicking outside the modal content
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && loginModal.classList.contains('active')) {
                loginModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
}
