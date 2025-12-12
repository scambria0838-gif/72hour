// ============================================
// STRIPE INTEGRATION CONFIGURATION
// Complete Setup Guide for 72HR Business
// ============================================

// ============================================
// STEP 1: STRIPE ACCOUNT SETUP
// ============================================
/*
1. Create a Stripe account at https://stripe.com
2. Complete account verification
3. Navigate to Developers > API Keys
4. Copy your Publishable Key and Secret Key
5. For testing, use Test Mode keys
6. For production, use Live Mode keys
*/

// ============================================
// STEP 2: ENVIRONMENT VARIABLES
// ============================================
// Create a .env file in your project root with:
/*
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
*/

// ============================================
// STEP 3: CREATE PRODUCTS IN STRIPE DASHBOARD
// ============================================
/*
Navigate to Products in Stripe Dashboard and create:

1. SETUP FEE (One-Time Payment)
   - Name: "72HR Business Setup Fee"
   - Description: "Complete infrastructure deployment including website, legal docs, and physical brand kit"
   - Price: $499.00 USD
   - Type: One-time
   - Save the Price ID (e.g., price_1234567890abcdef)

2. TIER 1: THE PROFESSIONAL (Recurring)
   - Name: "The Professional Tier"
   - Description: "Website + Admin Panel + Tech Infrastructure + Physical Brand Kit"
   - Price: $199.00 USD/month
   - Billing Period: Monthly
   - Trial Period: 30 days
   - Save the Price ID (e.g., price_tier1_monthly)

3. TIER 2: THE EXECUTIVE (Recurring)
   - Name: "The Executive Tier"
   - Description: "Everything in Professional + Legal Suite + Advanced Admin Toggles + Priority Support"
   - Price: $299.00 USD/month
   - Billing Period: Monthly
   - Trial Period: 30 days
   - Save the Price ID (e.g., price_tier2_monthly)

4. TIER 3: THE EMPIRE (Recurring)
   - Name: "The Empire Tier"
   - Description: "Everything in Executive + Operations Manual + 500-Item Library + White-Glove Service"
   - Price: $499.00 USD/month
   - Billing Period: Monthly
   - Trial Period: 30 days
   - Save the Price ID (e.g., price_tier3_monthly)
*/

// ============================================
// STEP 4: STRIPE PRICE IDS CONFIGURATION
// ============================================
const STRIPE_CONFIG = {
    // Replace these with your actual Stripe Price IDs
    PRICE_IDS: {
        SETUP_FEE: 'price_1234567890abcdef', // $499 one-time
        TIER1: 'price_tier1_monthly',         // $199/month
        TIER2: 'price_tier2_monthly',         // $299/month
        TIER3: 'price_tier3_monthly',         // $499/month
    },
    
    // Publishable Key (safe to expose in frontend)
    PUBLISHABLE_KEY: 'pk_test_your_publishable_key_here',
    
    // Success and Cancel URLs
    SUCCESS_URL: 'https://72hrbusiness.com/onboarding.html?session_id={CHECKOUT_SESSION_ID}',
    CANCEL_URL: 'https://72hrbusiness.com/index.html#checkout',
};

// ============================================
// STEP 5: FRONTEND STRIPE CHECKOUT
// ============================================
// Add this to your script.js or create a separate stripe-checkout.js

// Initialize Stripe
const stripe = Stripe(STRIPE_CONFIG.PUBLISHABLE_KEY);

// Handle checkout form submission
async function handleCheckout(tier) {
    try {
        // Get form data
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        
        // Validate
        if (!email || !phone || !tier) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Get the appropriate price ID
        const tierPriceId = STRIPE_CONFIG.PRICE_IDS[tier.toUpperCase()];
        
        // Create checkout session (this would be done on your backend)
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                phone: phone,
                tier: tier,
                priceId: tierPriceId,
            }),
        });
        
        const session = await response.json();
        
        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
            sessionId: session.id,
        });
        
        if (result.error) {
            alert(result.error.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

// ============================================
// STEP 6: BACKEND CHECKOUT SESSION CREATION
// ============================================
// This code runs on your server (Node.js/Express example)

/*
// Install Stripe SDK: npm install stripe

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const app = express();

app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { email, phone, tier, priceId } = req.body;
        
        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            
            // Customer information
            customer_email: email,
            
            // Line items (setup fee + subscription)
            line_items: [
                {
                    // One-time setup fee
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: '72HR Business Setup Fee',
                            description: 'One-time infrastructure deployment fee',
                        },
                        unit_amount: 49900, // $499.00 in cents
                    },
                    quantity: 1,
                },
            ],
            
            // Subscription configuration
            subscription_data: {
                items: [
                    {
                        price: priceId, // The recurring tier price ID
                    },
                ],
                trial_period_days: 30, // First 30 days free
                metadata: {
                    tier: tier,
                    phone: phone,
                    setup_fee_paid: 'true',
                },
            },
            
            // URLs
            success_url: STRIPE_CONFIG.SUCCESS_URL,
            cancel_url: STRIPE_CONFIG.CANCEL_URL,
            
            // Allow promotion codes
            allow_promotion_codes: true,
            
            // Metadata
            metadata: {
                tier: tier,
                phone: phone,
            },
        });
        
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook endpoint for Stripe events
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Payment successful:', session);
            
            // TODO: Send confirmation email
            // TODO: Create user account
            // TODO: Start onboarding process
            break;
            
        case 'customer.subscription.created':
            const subscription = event.data.object;
            console.log('Subscription created:', subscription);
            
            // TODO: Activate subscription features
            break;
            
        case 'customer.subscription.updated':
            const updatedSubscription = event.data.object;
            console.log('Subscription updated:', updatedSubscription);
            
            // TODO: Handle subscription changes
            break;
            
        case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object;
            console.log('Subscription cancelled:', deletedSubscription);
            
            // TODO: Deactivate subscription features
            break;
            
        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            console.log('Invoice paid:', invoice);
            
            // TODO: Send receipt
            break;
            
        case 'invoice.payment_failed':
            const failedInvoice = event.data.object;
            console.log('Invoice payment failed:', failedInvoice);
            
            // TODO: Send payment failure notification
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({received: true});
});

app.listen(3000, () => console.log('Server running on port 3000'));
*/

// ============================================
// STEP 7: CUSTOMER PORTAL SETUP
// ============================================
/*
Enable the Customer Portal in Stripe Dashboard:
1. Go to Settings > Billing > Customer Portal
2. Enable the portal
3. Configure allowed actions:
   - Update payment method
   - View invoices
   - Cancel subscription
4. Set up branding (logo, colors)
5. Save the portal configuration

Backend code to create portal session:

app.post('/create-portal-session', async (req, res) => {
    try {
        const { customerId } = req.body;
        
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: 'https://72hrbusiness.com/dashboard',
        });
        
        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).json({ error: error.message });
    }
});
*/

// ============================================
// STEP 8: TESTING
// ============================================
/*
Use Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Requires authentication: 4000 0025 0000 3155

Test the complete flow:
1. Select a tier
2. Fill in checkout form
3. Complete payment with test card
4. Verify redirect to onboarding
5. Check Stripe Dashboard for payment
6. Test webhook events
7. Test subscription trial period
8. Test subscription cancellation
*/

// ============================================
// STEP 9: PRODUCTION CHECKLIST
// ============================================
/*
Before going live:
1. Switch to Live Mode in Stripe Dashboard
2. Update API keys to Live keys
3. Set up webhook endpoint in production
4. Configure webhook secret
5. Test with real payment method
6. Set up email notifications
7. Configure tax settings (if applicable)
8. Set up fraud prevention rules
9. Enable 3D Secure authentication
10. Review and accept Stripe Terms of Service
*/

// ============================================
// STEP 10: SECURITY BEST PRACTICES
// ============================================
/*
1. Never expose Secret Key in frontend code
2. Always validate on the server
3. Use HTTPS for all requests
4. Implement CSRF protection
5. Validate webhook signatures
6. Store customer data securely
7. Comply with PCI DSS requirements
8. Implement rate limiting
9. Log all transactions
10. Monitor for suspicious activity
*/

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = STRIPE_CONFIG;
}