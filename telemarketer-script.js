// ===================================
// TELEMARKETER PORTAL JAVASCRIPT
// 72HR Business - Sales Team Interface
// ===================================

// ===================================
// DATA STRUCTURES
// ===================================

// Pricing configuration based on business age
const PRICING_CONFIG = {
    newBusiness: { // 0-6 months
        threshold: 6,
        setup: 499,
        tiers: {
            starter: { monthly: 199, name: 'Starter' },
            growth: { monthly: 299, name: 'Growth' },
            empire: { monthly: 399, name: 'Empire' }
        },
        flexPay: { first: 249, second: 250 },
        discount: '50% OFF'
    },
    established: { // 6+ months
        threshold: 6,
        setup: 999,
        tiers: {
            starter: { monthly: 299, name: 'Starter' },
            growth: { monthly: 399, name: 'Growth' },
            empire: { monthly: 499, name: 'Empire' }
        },
        flexPay: { first: 499, second: 500 },
        discount: null
    }
};

// ===================================
// STATE MANAGEMENT
// ===================================

let currentUser = null;
let currentLead = null;
let leads = [];
let callLogs = [];
let activeFilter = 'all';

// ===================================
// AUTHENTICATION
// ===================================

function initAuth() {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check if already logged in
    const savedUser = localStorage.getItem('telemarketer_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
    
    // Login handler
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Get telemarketers from localStorage (set by admin)
            const telemarketers = JSON.parse(localStorage.getItem('telemarketers') || '[]');
            
            // Default telemarketer for testing
            const defaultTelemarketers = [
                { username: 'sales1', password: 'Makemoney1', name: 'Sales Rep 1' },
                { username: 'sales2', password: 'sales123', name: 'Sales Rep 2' }
            ];
            
            const allTelemarketers = [...telemarketers, ...defaultTelemarketers];
            const user = allTelemarketers.find(t => t.username === username && t.password === password);
            
            if (user) {
                currentUser = { username: user.username, name: user.name };
                localStorage.setItem('telemarketer_user', JSON.stringify(currentUser));
                showDashboard();
            } else {
                document.getElementById('loginError').textContent = 'Invalid username or password';
            }
        });
    }
    
    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('telemarketer_user');
            currentUser = null;
            location.reload();
        });
    }
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    document.getElementById('userBadge').textContent = currentUser.name;
    
    loadLeads();
    loadCallLogs();
    updateStats();
    renderLeads();
    setupEventListeners();
}

// ===================================
// DATA LOADING
// ===================================

function loadLeads() {
    // Get all leads from admin system
    const allLeads = JSON.parse(localStorage.getItem('leads') || '[]');
    
    // Filter leads assigned to current user
    leads = allLeads.filter(lead => 
        lead.assignedTo === currentUser.username || 
        lead.assignedTo === currentUser.name
    );
    
    // If no assigned leads, show sample leads for demo
    if (leads.length === 0) {
        leads = getSampleLeads();
    }
}

function getSampleLeads() {
    return [
        {
            id: 'lead-1',
            name: 'John Smith',
            phone: '(555) 123-4567',
            email: 'john@smithconstruction.com',
            businessType: 'Construction',
            businessAge: 4,
            status: 'new',
            notes: '',
            createdDate: new Date().toISOString(),
            assignedTo: currentUser.username
        },
        {
            id: 'lead-2',
            name: 'Sarah Johnson',
            phone: '(555) 234-5678',
            email: 'sarah@beautysalon.com',
            businessType: 'Beauty Salon',
            businessAge: 8,
            status: 'contacted',
            notes: 'Interested in Growth tier',
            createdDate: new Date().toISOString(),
            assignedTo: currentUser.username
        },
        {
            id: 'lead-3',
            name: 'Mike Davis',
            phone: '(555) 345-6789',
            email: 'mike@daviscleaning.com',
            businessType: 'Cleaning Service',
            businessAge: 2,
            status: 'new',
            notes: '',
            createdDate: new Date().toISOString(),
            assignedTo: currentUser.username
        }
    ];
}

function loadCallLogs() {
    const allLogs = JSON.parse(localStorage.getItem('call_logs') || '[]');
    callLogs = allLogs.filter(log => log.telemarketer === currentUser.username);
}

// ===================================
// PRICING LOGIC
// ===================================

function getPricingForLead(businessAge) {
    return businessAge <= PRICING_CONFIG.newBusiness.threshold 
        ? PRICING_CONFIG.newBusiness 
        : PRICING_CONFIG.established;
}

function isNewBusiness(businessAge) {
    return businessAge <= PRICING_CONFIG.newBusiness.threshold;
}

// ===================================
// RENDERING
// ===================================

function renderLeads() {
    const leadsList = document.getElementById('leadsList');
    const callbacksList = document.getElementById('callbacksList');
    
    if (!leadsList || !callbacksList) {
        console.error('Required elements not found');
        return;
    }
    
    // Filter leads
    let filteredLeads = leads;
    if (activeFilter === 'callbacks') {
        filteredLeads = leads.filter(lead => hasCallbackDueToday(lead));
    } else if (activeFilter !== 'all') {
        filteredLeads = leads.filter(lead => lead.status === activeFilter);
    }
    
    // Render callbacks due today
    const callbackLeads = leads.filter(lead => hasCallbackDueToday(lead));
    const callbacksSection = document.getElementById('callbacksSection');
    if (callbackLeads.length > 0 && callbacksSection) {
        callbacksSection.style.display = 'block';
        callbacksList.innerHTML = callbackLeads.map(lead => `
            <div class="callback-item" onclick="selectLead('${lead.id}')">
                <div class="callback-time">${getCallbackTime(lead)}</div>
                <strong>${lead.name}</strong> - ${lead.businessType}
            </div>
        `).join('');
    } else if (callbacksSection) {
        callbacksSection.style.display = 'none';
    }
    
    // Render leads list
    if (filteredLeads.length === 0) {
        leadsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No leads assigned yet. Contact your admin to get leads assigned.</p>';
        return;
    }
    
    leadsList.innerHTML = filteredLeads.map(lead => {
        const pricing = getPricingForLead(lead.businessAge);
        const isNew = isNewBusiness(lead.businessAge);
        
        return `
            <div class="lead-card ${currentLead?.id === lead.id ? 'active' : ''}" onclick="selectLead('${lead.id}')">
                <div class="lead-header">
                    <div>
                        <div class="lead-name">${lead.name}</div>
                        <div class="lead-business">${lead.businessType}</div>
                    </div>
                    <div class="business-age-badge ${isNew ? 'badge-new' : 'badge-established'}">
                        ${lead.businessAge} ${lead.businessAge === 1 ? 'MONTH' : 'MONTHS'} OLD
                        ${isNew ? ' - NEW!' : ''}
                    </div>
                </div>
                
                <div class="lead-info">
                    <div class="info-row">
                        <span class="info-icon">📞</span>
                        <span>${lead.phone}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-icon">✉️</span>
                        <span>${lead.email}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-icon">📊</span>
                        <span>Status: <strong>${lead.status.toUpperCase()}</strong></span>
                    </div>
                </div>
                
                <div class="lead-pricing">
                    <div class="pricing-highlight">
                        💰 Setup: <strong class="${isNew ? 'discount-badge' : ''}">$${pricing.setup}</strong>
                        ${isNew ? '<span class="discount-badge">50% OFF!</span>' : ''}
                    </div>
                    <div style="margin-top: 5px; font-size: 12px; color: var(--text-secondary);">
                        Monthly: $${pricing.tiers.starter.monthly} / $${pricing.tiers.growth.monthly} / $${pricing.tiers.empire.monthly}
                    </div>
                </div>
                
                <div class="lead-actions">
                    <button class="btn-call" onclick="event.stopPropagation(); callLead('${lead.id}')">
                        📞 Call Now
                    </button>
                    <button class="btn-log" onclick="event.stopPropagation(); openCallLog('${lead.id}')">
                        📝 Log Call
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function selectLead(leadId) {
    currentLead = leads.find(l => l.id === leadId);
    renderLeads();
    updateScriptBoard();
}

function updateScriptBoard() {
    const activeLeadInfo = document.getElementById('activeLeadInfo');
    const scriptSteps = document.getElementById('scriptSteps');
    const quickPricing = document.getElementById('quickPricing');
    
    if (!currentLead) {
        activeLeadInfo.innerHTML = '<p>Select a lead to see personalized script</p>';
        scriptSteps.style.display = 'none';
        quickPricing.innerHTML = '<p>Select a lead to see pricing</p>';
        return;
    }
    
    const pricing = getPricingForLead(currentLead.businessAge);
    const isNew = isNewBusiness(currentLead.businessAge);
    
    // Update active lead info
    activeLeadInfo.innerHTML = `
        <h3>${currentLead.name}</h3>
        <p>${currentLead.businessType} - ${currentLead.businessAge} months old</p>
        <p style="color: var(--accent-blue);">${currentLead.phone}</p>
    `;
    
    // Show script steps
    scriptSteps.style.display = 'block';
    
    // Update dynamic script content
    document.getElementById('scriptAge').textContent = `${currentLead.businessAge} MONTHS AGO`;
    document.getElementById('subsidyType').textContent = isNew ? 'NEW BUSINESS tech subsidy program' : 'tech subsidy program';
    document.getElementById('scriptSetupFee').textContent = `$${pricing.setup}`;
    document.getElementById('scriptMonthlyFee').textContent = `$${pricing.tiers.starter.monthly}/month`;
    document.getElementById('scriptTotalSetup').textContent = `$${pricing.setup}`;
    document.getElementById('scriptFlexPay1').textContent = `$${pricing.flexPay.first}`;
    document.getElementById('scriptFlexPay2').textContent = `$${pricing.flexPay.second}`;
    document.getElementById('scriptTierName').textContent = pricing.tiers.starter.name;
    document.getElementById('scriptFinalPrice').textContent = `$${pricing.setup}`;
    document.getElementById('scriptFinalMonthly').textContent = `$${pricing.tiers.starter.monthly}/month`;
    
    // Show/hide new business badge
    const newBusinessBadge = document.getElementById('newBusinessBadge');
    if (isNew) {
        newBusinessBadge.style.display = 'block';
    } else {
        newBusinessBadge.style.display = 'none';
    }
    
    // Update quick pricing reference
    quickPricing.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;">
            <div style="text-align: center; padding: 10px; background: rgba(0, 217, 255, 0.1); border-radius: 6px;">
                <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">STARTER</div>
                <div style="font-size: 16px; font-weight: 700; color: ${isNew ? 'var(--accent-green)' : 'var(--accent-blue)'};">
                    $${pricing.setup} + $${pricing.tiers.starter.monthly}/mo
                </div>
            </div>
            <div style="text-align: center; padding: 10px; background: rgba(0, 217, 255, 0.1); border-radius: 6px;">
                <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">GROWTH</div>
                <div style="font-size: 16px; font-weight: 700; color: ${isNew ? 'var(--accent-green)' : 'var(--accent-blue)'};">
                    $${pricing.setup} + $${pricing.tiers.growth.monthly}/mo
                </div>
            </div>
            <div style="text-align: center; padding: 10px; background: rgba(0, 217, 255, 0.1); border-radius: 6px;">
                <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">EMPIRE</div>
                <div style="font-size: 16px; font-weight: 700; color: ${isNew ? 'var(--accent-green)' : 'var(--accent-blue)'};">
                    $${pricing.setup} + $${pricing.tiers.empire.monthly}/mo
                </div>
            </div>
        </div>
        ${isNew ? '<div style="background: var(--accent-green); color: var(--primary-bg); padding: 8px; border-radius: 6px; text-align: center; font-weight: 700; font-size: 12px;">🎉 NEW BUSINESS: 50% OFF SETUP FEE!</div>' : ''}
        <div style="margin-top: 15px; padding: 10px; background: rgba(255, 215, 0, 0.1); border-radius: 6px; border-left: 3px solid var(--accent-yellow);">
            <strong style="color: var(--accent-yellow);">Flex Pay Option:</strong><br>
            <span style="color: var(--text-secondary); font-size: 13px;">
                $${pricing.flexPay.first} today + $${pricing.flexPay.second} at delivery
            </span>
        </div>
    `;
}

// ===================================
// CALL ACTIONS
// ===================================

async function callLead(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    // Select the lead to show script
    selectLead(leadId);
    
    // Show calling status
    const callButton = event.target;
    const originalText = callButton.textContent;
    callButton.textContent = '📞 Calling...';
    callButton.disabled = true;
    
    try {
        // Call Twilio backend API
        const response = await fetch('https://72hrbusiness-backend.stevencambria.repl.co/api/make-call', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                leadPhone: lead.phone,
                leadName: lead.name,
                leadId: lead.id,
                telemarketerId: currentUser.username
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Call initiated successfully
            callButton.textContent = '✅ Call Connected';
            
            // Show success message
            alert(`Call initiated to ${lead.name}!\n\nCall SID: ${data.callSid}\nStatus: ${data.status}`);
            
            // Automatically open call log modal after 2 seconds
            setTimeout(() => {
                callButton.textContent = originalText;
                callButton.disabled = false;
                openCallLog(leadId);
            }, 2000);
            
        } else {
            // Call failed
            callButton.textContent = '❌ Call Failed';
            alert(`Failed to initiate call: ${data.error}`);
            
            setTimeout(() => {
                callButton.textContent = originalText;
                callButton.disabled = false;
            }, 2000);
        }
        
    } catch (error) {
        console.error('Error calling lead:', error);
        callButton.textContent = '❌ Error';
        alert(`Error: ${error.message}\n\nMake sure the Twilio backend server is running.`);
        
        setTimeout(() => {
            callButton.textContent = originalText;
            callButton.disabled = false;
        }, 2000);
    }
}

function openCallLog(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    currentLead = lead;
    document.getElementById('callLogLeadId').value = leadId;
    document.getElementById('callLogModal').classList.add('active');
    
    // Reset form
    document.getElementById('callLogForm').reset();
    document.getElementById('callbackDateGroup').style.display = 'none';
    document.getElementById('tierSelectGroup').style.display = 'none';
}

// ===================================
// CALL LOG HANDLING
// ===================================

function setupCallLogModal() {
    const modal = document.getElementById('callLogModal');
    const form = document.getElementById('callLogForm');
    const outcomeSelect = document.getElementById('callOutcome');
    
    // Close modal handlers
    document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });
    
    // Show/hide callback date based on outcome
    outcomeSelect.addEventListener('change', (e) => {
        const callbackGroup = document.getElementById('callbackDateGroup');
        const tierGroup = document.getElementById('tierSelectGroup');
        
        if (e.target.value === 'callback') {
            callbackGroup.style.display = 'block';
            document.getElementById('callbackDate').required = true;
        } else {
            callbackGroup.style.display = 'none';
            document.getElementById('callbackDate').required = false;
        }
        
        if (e.target.value === 'converted') {
            tierGroup.style.display = 'block';
            document.getElementById('tierSold').required = true;
        } else {
            tierGroup.style.display = 'none';
            document.getElementById('tierSold').required = false;
        }
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCallLog();
    });
}

function saveCallLog() {
    const leadId = document.getElementById('callLogLeadId').value;
    const outcome = document.getElementById('callOutcome').value;
    const notes = document.getElementById('callNotes').value;
    const callbackDate = document.getElementById('callbackDate').value;
    const tierSold = document.getElementById('tierSold').value;
    
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    // Create call log entry
    const logEntry = {
        id: 'log-' + Date.now(),
        leadId: leadId,
        leadName: lead.name,
        telemarketer: currentUser.username,
        outcome: outcome,
        notes: notes,
        callbackDate: callbackDate || null,
        tierSold: tierSold || null,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    callLogs.push(logEntry);
    const allLogs = JSON.parse(localStorage.getItem('call_logs') || '[]');
    allLogs.push(logEntry);
    localStorage.setItem('call_logs', JSON.stringify(allLogs));
    
    // Update lead status
    if (outcome === 'answered-interested') {
        lead.status = 'contacted';
    } else if (outcome === 'converted') {
        lead.status = 'converted';
        lead.tierSold = tierSold;
    } else if (outcome === 'lost' || outcome === 'answered-not-interested') {
        lead.status = 'lost';
    }
    
    // Update callback date
    if (callbackDate) {
        lead.callbackDate = callbackDate;
    }
    
    // Update last contact
    lead.lastContact = new Date().toISOString();
    
    // Save updated leads
    const allLeads = JSON.parse(localStorage.getItem('leads') || '[]');
    const leadIndex = allLeads.findIndex(l => l.id === leadId);
    if (leadIndex !== -1) {
        allLeads[leadIndex] = lead;
        localStorage.setItem('leads', JSON.stringify(allLeads));
    }
    
    // Close modal and refresh
    document.getElementById('callLogModal').classList.remove('active');
    loadLeads();
    loadCallLogs();
    updateStats();
    renderLeads();
    
    // Show success message
    alert('Call logged successfully!');
}

// ===================================
// STATS & CALLBACKS
// ===================================

function updateStats() {
    const today = new Date().toDateString();
    const todayLogs = callLogs.filter(log => 
        new Date(log.timestamp).toDateString() === today
    );
    
    const conversions = todayLogs.filter(log => log.outcome === 'converted').length;
    const conversionRate = todayLogs.length > 0 
        ? Math.round((conversions / todayLogs.length) * 100) 
        : 0;
    
    // Calculate revenue
    let revenue = 0;
    todayLogs.filter(log => log.outcome === 'converted').forEach(log => {
        const lead = leads.find(l => l.id === log.leadId);
        if (lead) {
            const pricing = getPricingForLead(lead.businessAge);
            revenue += pricing.setup;
        }
    });
    
    document.getElementById('callsToday').textContent = todayLogs.length;
    document.getElementById('conversionsToday').textContent = conversions;
    document.getElementById('conversionRate').textContent = conversionRate + '%';
    document.getElementById('revenueToday').textContent = '$' + revenue.toLocaleString();
}

function hasCallbackDueToday(lead) {
    if (!lead.callbackDate) return false;
    const callbackDate = new Date(lead.callbackDate);
    const today = new Date();
    return callbackDate.toDateString() === today.toDateString();
}

function getCallbackTime(lead) {
    if (!lead.callbackDate) return '';
    const date = new Date(lead.callbackDate);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ===================================
// EVENT LISTENERS
// ===================================

function setupEventListeners() {
    // Filter tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeFilter = e.target.dataset.filter;
            renderLeads();
        });
    });
    
    // Script toggle
    document.getElementById('toggleScript').addEventListener('click', (e) => {
        const content = document.getElementById('scriptContent');
        if (content.style.display === 'none') {
            content.style.display = 'block';
            e.target.textContent = 'Collapse';
        } else {
            content.style.display = 'none';
            e.target.textContent = 'Expand';
        }
    });
    
    // Setup call log modal
    setupCallLogModal();
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

// Make functions globally accessible
window.selectLead = selectLead;
window.callLead = callLead;
window.openCallLog = openCallLog;