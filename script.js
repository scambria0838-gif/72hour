// ============================================
// 72HR BUSINESS - COMPLETE JAVASCRIPT
// Interactive Features &amp; Stripe Integration
// ============================================

// ============================================
// GLOBAL STATE
// ============================================
let selectedTier = null;
let selectedTierPrice = 0;
let selectedAddons = [];
let selectedNiche = null;

// ============================================
// NAVIGATION
// ============================================
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Sticky header on scroll
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.5)';
    } else {
        header.style.boxShadow = 'none';
    }
});

// ============================================
// SMOOTH SCROLLING
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// TIER SELECTION
// ============================================
function selectTier(tier, price) {
    selectedTier = tier;
    selectedTierPrice = price;
    
    // Scroll to checkout
    const checkoutSection = document.getElementById('checkout');
    if (checkoutSection) {
        checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Update checkout form
    setTimeout(() => {
        const tierSelect = document.getElementById('tier-select');
        if (tierSelect) {
            tierSelect.value = tier;
            updateCheckoutSummary();
        }
    }, 500);
}

// ============================================
// NICHE SELECTION
// ============================================
function selectNiche(niche) {
    selectedNiche = niche;
    
    // Map niche to tier
    const nicheToTier = {
        'water': 'tier1',
        'beauty': 'tier2',
        'agency': 'tier3'
    };
    
    const nicheToPrice = {
        'water': 199,
        'beauty': 299,
        'agency': 399
    };
    
    selectTier(nicheToTier[niche], nicheToPrice[niche]);
}

// ============================================
// CHECKOUT SUMMARY UPDATE
// ============================================
function updateCheckoutSummary() {
    const tierSelect = document.getElementById('tier-select');
    const tierSummary = document.getElementById('tier-summary');
    const tierName = document.getElementById('tier-name');
    const tierPrice = document.getElementById('tier-price');
    const nextBilling = document.getElementById('next-billing');
    const nextDate = document.getElementById('next-date');
    
    if (!tierSelect || !tierSelect.value) {
        if (tierSummary) tierSummary.style.display = 'none';
        if (nextBilling) nextBilling.style.display = 'none';
        return;
    }
    
    const selectedOption = tierSelect.options[tierSelect.selectedIndex];
    const price = selectedOption.dataset.price;
    const name = selectedOption.text.split(' (')[0];
    
    // Calculate next billing date (30 days from today)
    const today = new Date();
    const nextBillingDate = new Date(today);
    nextBillingDate.setDate(today.getDate() + 30);
    const formattedDate = nextBillingDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
    
    // Update summary
    if (tierSummary) tierSummary.style.display = 'flex';
    if (tierName) tierName.textContent = name;
    if (tierPrice) tierPrice.textContent = `$${price}.00/mo`;
    if (nextBilling) nextBilling.style.display = 'block';
    if (nextDate) nextDate.textContent = formattedDate;
    
    // Update tier start date
    const tierStartDate = document.getElementById('tier-start-date');
    if (tierStartDate) {
        tierStartDate.textContent = `(Starts ${formattedDate})`;
    }
}

// Listen for tier selection changes
const tierSelect = document.getElementById('tier-select');
if (tierSelect) {
    tierSelect.addEventListener('change', updateCheckoutSummary);
}

// ============================================
// BUNDLE STORE (PICK 4 ADD-ONS)
// ============================================
const addonItems = document.querySelectorAll('.addon-item');
const bundleCount = document.getElementById('bundle-count');
const bundleCheckout = document.getElementById('bundle-checkout');

addonItems.forEach(item => {
    item.addEventListener('click', () => {
        const addonId = item.dataset.addon;
        
        if (item.classList.contains('selected')) {
            // Deselect
            item.classList.remove('selected');
            selectedAddons = selectedAddons.filter(id => id !== addonId);
        } else {
            // Select (if less than 4)
            if (selectedAddons.length < 4) {
                item.classList.add('selected');
                selectedAddons.push(addonId);
            }
        }
        
        // Update counter
        if (bundleCount) {
            bundleCount.textContent = selectedAddons.length;
        }
        
        // Enable/disable checkout button
        if (bundleCheckout) {
            bundleCheckout.disabled = selectedAddons.length !== 4;
        }
    });
});

// Bundle checkout button
if (bundleCheckout) {
    bundleCheckout.addEventListener('click', () => {
        if (selectedAddons.length === 4) {
            alert(`Selected Add-ons:\n${selectedAddons.join(', ')}\n\nTotal: $199\n\nThis would be added to your cart in production.`);
        }
    });
}

// ============================================
// FORM VALIDATION
// ============================================
const checkoutForm = document.getElementById('checkout-form');

if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const tier = document.getElementById('tier-select').value;
        
        // Validate
        if (!email || !phone || !tier) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // In production, this would redirect to Stripe Checkout
        // For now, we'll show a demo message
        const tierPrices = {
            'tier1': 199,
            'tier2': 299,
            'tier3': 499
        };
        
        const tierNames = {
            'tier1': 'The Professional',
            'tier2': 'The Executive',
            'tier3': 'The Empire'
        };
        
        const monthlyPrice = tierPrices[tier];
        const tierName = tierNames[tier];
        
        // Calculate next billing date
        const today = new Date();
        const nextBillingDate = new Date(today);
        nextBillingDate.setDate(today.getDate() + 30);
        const formattedDate = nextBillingDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
        });
        
        // Show confirmation
        const confirmed = confirm(
            `ORDER CONFIRMATION\n\n` +
            `Email: ${email}\n` +
            `Phone: ${phone}\n` +
            `Tier: ${tierName}\n\n` +
            `DUE TODAY: $499.00 (Setup Fee)\n` +
            `RECURRING: $${monthlyPrice}.00/month\n` +
            `First billing: ${formattedDate}\n\n` +
            `In production, you would be redirected to Stripe Checkout.\n\n` +
            `Click OK to simulate checkout.`
        );
        
        if (confirmed) {
            // Simulate redirect to onboarding
            alert('✅ Payment Successful!\n\nRedirecting to onboarding...');
            
            // Store data in sessionStorage
            sessionStorage.setItem('customerEmail', email);
            sessionStorage.setItem('customerPhone', phone);
            sessionStorage.setItem('selectedTier', tier);
            sessionStorage.setItem('setupFee', '499');
            sessionStorage.setItem('monthlyPrice', monthlyPrice);
            
            // Redirect to onboarding page
            setTimeout(() => {
                window.location.href = 'onboarding.html';
            }, 1000);
        }
    });
}

// ============================================
// LIVE SALES NOTIFICATIONS - DISABLED (removed fake spam notifications)

// ============================================
// SCROLL ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.stack-layer, .pricing-card, .niche-card, .timeline-item').forEach(el => {
    observer.observe(el);
});

// ============================================
// ANALYTICS TRACKING
// ============================================
function trackEvent(eventName, eventData) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, eventData);
    }
    
    console.log('Event tracked:', eventName, eventData);
}

// Track tier selections
document.querySelectorAll('[onclick^="selectTier"]').forEach(button => {
    button.addEventListener('click', (e) => {
        const tier = e.target.getAttribute('onclick').match(/selectTier\('(\w+)',\s*(\d+)\)/);
        if (tier) {
            trackEvent('TierSelected', {
                tier: tier[1],
                price: tier[2]
            });
        }
    });
});

// Track form submission
if (checkoutForm) {
    checkoutForm.addEventListener('submit', () => {
        trackEvent('CheckoutInitiated', {
            tier: selectedTier,
            price: selectedTierPrice
        });
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
}

// ============================================
// PAGE LOAD ANIMATIONS
// ============================================
window.addEventListener('load', () => {
    // Fade in hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.opacity = '0';
        setTimeout(() => {
            hero.style.transition = 'opacity 1s ease';
            hero.style.opacity = '1';
        }, 100);
    }
});

// ============================================
// CONSOLE BRANDING
// ============================================
console.log('%c72HR BUSINESS', 'font-size: 40px; font-weight: 900; color: #00D9FF; text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);');
console.log('%cWe Build Empires in 72 Hours', 'font-size: 16px; color: #00FF88;');