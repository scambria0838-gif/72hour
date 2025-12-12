// ============================================
// ONBOARDING PAGE JAVASCRIPT
// ============================================

// ============================================
// TERMINAL LOADING ANIMATION
// ============================================
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('terminal-loading').style.display = 'none';
        document.getElementById('onboarding-form').style.display = 'block';
    }, 4000); // Show terminal for 4 seconds
});

// ============================================
// CHARACTER COUNTERS
// ============================================
const businessName = document.getElementById('business-name');
const charCount = document.getElementById('char-count');

if (businessName && charCount) {
    businessName.addEventListener('input', (e) => {
        const length = e.target.value.length;
        charCount.textContent = `${length}/50 characters`;
        
        // Check domain availability (simulated)
        if (length > 0) {
            checkDomainAvailability(e.target.value);
        } else {
            document.getElementById('domain-check').textContent = '';
        }
    });
}

const tagline = document.getElementById('tagline');
const taglineCount = document.getElementById('tagline-count');

if (tagline && taglineCount) {
    tagline.addEventListener('input', (e) => {
        const length = e.target.value.length;
        taglineCount.textContent = `${length}/100 characters`;
    });
}

const tumblerText = document.getElementById('tumbler-text');
const tumblerCount = document.getElementById('tumbler-count');
const engravingPreview = document.getElementById('engraving-preview');

if (tumblerText && tumblerCount && engravingPreview) {
    tumblerText.addEventListener('input', (e) => {
        const length = e.target.value.length;
        tumblerCount.textContent = `${length}/25 characters`;
        engravingPreview.textContent = e.target.value.toUpperCase() || 'YOUR BUSINESS NAME';
    });
}

const additionalNotes = document.getElementById('additional-notes');
const notesCount = document.getElementById('notes-count');

if (additionalNotes && notesCount) {
    additionalNotes.addEventListener('input', (e) => {
        const length = e.target.value.length;
        notesCount.textContent = `${length}/500 characters`;
    });
}

// ============================================
// DOMAIN AVAILABILITY CHECK (SIMULATED)
// ============================================
function checkDomainAvailability(name) {
    const domainCheck = document.getElementById('domain-check');
    if (!domainCheck) return;
    
    // Simulate API call
    domainCheck.textContent = 'Checking...';
    domainCheck.className = 'domain-status';
    
    setTimeout(() => {
        // Random availability for demo
        const available = Math.random() > 0.5;
        
        if (available) {
            domainCheck.textContent = `✓ ${name.toLowerCase().replace(/\s+/g, '')}.com available`;
            domainCheck.classList.add('available');
        } else {
            domainCheck.textContent = `✗ ${name.toLowerCase().replace(/\s+/g, '')}.com taken`;
            domainCheck.classList.add('unavailable');
        }
    }, 500);
}

// ============================================
// COLOR SCHEME SELECTION
// ============================================
const colorOptions = document.querySelectorAll('.color-option');
const customColorPicker = document.getElementById('custom-color-picker');
const customColorPreview = document.getElementById('custom-color-preview');

colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        const radio = option.querySelector('input[type="radio"]');
        radio.checked = true;
        
        // Show color picker for custom option
        if (radio.value === 'custom') {
            customColorPicker.style.display = 'block';
        } else {
            customColorPicker.style.display = 'none';
        }
    });
});

if (customColorPicker && customColorPreview) {
    customColorPicker.addEventListener('input', (e) => {
        customColorPreview.style.background = e.target.value;
    });
}

// ============================================
// FILE UPLOAD
// ============================================
const logoUpload = document.getElementById('logo-upload');
const fileName = document.getElementById('file-name');

if (logoUpload && fileName) {
    logoUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                e.target.value = '';
                fileName.textContent = 'No file chosen';
                return;
            }
            
            fileName.textContent = file.name;
        } else {
            fileName.textContent = 'No file chosen';
        }
    });
}

// ============================================
// PASSWORD VALIDATION
// ============================================
const adminPassword = document.getElementById('admin-password');
const confirmPassword = document.getElementById('confirm-password');
const passwordMatch = document.getElementById('password-match');

const requirements = {
    length: document.getElementById('req-length'),
    upper: document.getElementById('req-upper'),
    lower: document.getElementById('req-lower'),
    number: document.getElementById('req-number'),
    special: document.getElementById('req-special')
};

if (adminPassword) {
    adminPassword.addEventListener('input', (e) => {
        const password = e.target.value;
        
        // Check length
        if (password.length >= 8) {
            requirements.length.classList.add('valid');
            requirements.length.textContent = '✓ At least 8 characters';
        } else {
            requirements.length.classList.remove('valid');
            requirements.length.textContent = '✗ At least 8 characters';
        }
        
        // Check uppercase
        if (/[A-Z]/.test(password)) {
            requirements.upper.classList.add('valid');
            requirements.upper.textContent = '✓ One uppercase letter';
        } else {
            requirements.upper.classList.remove('valid');
            requirements.upper.textContent = '✗ One uppercase letter';
        }
        
        // Check lowercase
        if (/[a-z]/.test(password)) {
            requirements.lower.classList.add('valid');
            requirements.lower.textContent = '✓ One lowercase letter';
        } else {
            requirements.lower.classList.remove('valid');
            requirements.lower.textContent = '✗ One lowercase letter';
        }
        
        // Check number
        if (/[0-9]/.test(password)) {
            requirements.number.classList.add('valid');
            requirements.number.textContent = '✓ One number';
        } else {
            requirements.number.classList.remove('valid');
            requirements.number.textContent = '✗ One number';
        }
        
        // Check special character
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            requirements.special.classList.add('valid');
            requirements.special.textContent = '✓ One special character';
        } else {
            requirements.special.classList.remove('valid');
            requirements.special.textContent = '✗ One special character';
        }
        
        // Check password match
        checkPasswordMatch();
    });
}

if (confirmPassword) {
    confirmPassword.addEventListener('input', checkPasswordMatch);
}

function checkPasswordMatch() {
    if (!adminPassword || !confirmPassword || !passwordMatch) return;
    
    if (confirmPassword.value === '') {
        passwordMatch.textContent = '';
        return;
    }
    
    if (adminPassword.value === confirmPassword.value) {
        passwordMatch.textContent = '✓ Passwords match';
        passwordMatch.style.color = 'var(--color-accent-green)';
    } else {
        passwordMatch.textContent = '✗ Passwords do not match';
        passwordMatch.style.color = '#E63946';
    }
}

// ============================================
// LAUNCH DATE VALIDATION
// ============================================
const launchDate = document.getElementById('launch-date');

if (launchDate) {
    // Set minimum date (3 business days from today)
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 3);
    
    // Set maximum date (10 business days from today)
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 10);
    
    launchDate.min = minDate.toISOString().split('T')[0];
    launchDate.max = maxDate.toISOString().split('T')[0];
}

// ============================================
// FORM SUBMISSION
// ============================================
const configForm = document.getElementById('config-form');

if (configForm) {
    configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate password requirements
        const password = adminPassword.value;
        const passwordValid = 
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        if (!passwordValid) {
            alert('Please ensure your password meets all requirements.');
            adminPassword.focus();
            return;
        }
        
        // Check password match
        if (adminPassword.value !== confirmPassword.value) {
            alert('Passwords do not match.');
            confirmPassword.focus();
            return;
        }
        
        // Collect form data
        const formData = new FormData(configForm);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add customer info from session storage
        const customerEmail = sessionStorage.getItem('customerEmail');
        const customerPhone = sessionStorage.getItem('customerPhone');
        const selectedTier = sessionStorage.getItem('selectedTier');
        
        data.email = customerEmail;
        data.phone = customerPhone;
        data.tier = selectedTier;
        
        console.log('Form Data:', data);
        
        // In production, this would send data to the server
        // For now, we'll show the success message
        
        // Hide form
        document.getElementById('onboarding-form').style.display = 'none';
        
        // Show success message
        const successMessage = document.getElementById('success-message');
        successMessage.style.display = 'flex';
        
        // Generate tracking number
        const trackingNumber = '#72HR-' + Math.floor(100000 + Math.random() * 900000);
        document.getElementById('tracking-number').textContent = trackingNumber;
        
        // Start countdown
        let countdown = 5;
        const countdownElement = document.getElementById('countdown');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                // Redirect to build status dashboard (would be a real page in production)
                alert('In production, you would be redirected to your Build Status Dashboard.\n\nFor this demo, we\'ll return to the homepage.');
                window.location.href = 'index.html';
            }
        }, 1000);
    });
}

// ============================================
// LOAD CUSTOMER DATA FROM SESSION
// ============================================
window.addEventListener('load', () => {
    const customerEmail = sessionStorage.getItem('customerEmail');
    const customerPhone = sessionStorage.getItem('customerPhone');
    
    if (customerEmail) {
        console.log('Customer Email:', customerEmail);
    }
    
    if (customerPhone) {
        // Pre-fill delivery phone if available
        const deliveryPhone = document.getElementById('delivery-phone');
        if (deliveryPhone) {
            deliveryPhone.value = customerPhone;
        }
    }
});

// ============================================
// CONSOLE BRANDING
// ============================================
console.log('%c72HR BUSINESS - ONBOARDING', 'font-size: 24px; font-weight: 900; color: #00D9FF;');
console.log('%cYour 72-hour countdown begins now.', 'font-size: 14px; color: #00FF88;');