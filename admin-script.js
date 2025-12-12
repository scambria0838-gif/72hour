document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const adminPanel = document.getElementById('admin-panel');
    const leadForm = document.getElementById('lead-form');
    const leadsList = document.getElementById('leads-list');
    const logoutButton = document.getElementById('logout-button');

    const CORRECT_USERNAME = 'admin123';
    const CORRECT_PASSWORD = 'Bozmoski1!';
    const LEADS_STORAGE_KEY = 'leads'; // Standardized key across both portals

    // --- Authentication Functions ---
    const checkAuth = () => {
        const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
        if (isAuthenticated) {
            loginForm.style.display = 'none';
            adminPanel.style.display = 'block';
            displayLeads();
        } else {
            loginForm.style.display = 'block';
            adminPanel.style.display = 'none';
        }
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        // CRITICAL FIX: Changed &amp;&amp; to && to prevent JS crash
        if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
            localStorage.setItem('isAdminAuthenticated', 'true');
            checkAuth();
        } else {
            alert('Invalid credentials');
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('isAdminAuthenticated');
        checkAuth();
    });

    // --- Lead Management Functions ---
    const getLeads = () => {
        const leadsJson = localStorage.getItem(LEADS_STORAGE_KEY);
        // Ensure we always return an array
        return leadsJson ? JSON.parse(leadsJson) : [];
    };

    const saveLeads = (leads) => {
        localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    };

    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newLead = {
            // FIX: Normalizing ID to a string format for consistency ('lead-<timestamp>')
            id: 'lead-' + Date.now(),
            name: e.target.name.value,
            phone: e.target.phone.value,
            status: 'New',
            createdAt: new Date().toISOString()
        };

        const leads = getLeads();
        leads.push(newLead);
        saveLeads(leads);
        displayLeads();
        leadForm.reset();
    });

    const displayLeads = () => {
        const leads = getLeads();
        leadsList.innerHTML = '';

        if (leads.length === 0) {
            leadsList.innerHTML = '<p>No leads found.</p>';
            return;
        }

        leads.forEach(lead => {
            const li = document.createElement('li');
            li.innerHTML = `
                ID: ${lead.id} | Name: ${lead.name} | Phone: ${lead.phone} | Status: <strong>${lead.status}</strong> 
                <button onclick="updateLeadStatus('${lead.id}', 'Contacted')">Contacted</button>
                <button onclick="updateLeadStatus('${lead.id}', 'Follow Up')">Follow Up</button>
                <button onclick="deleteLead('${lead.id}')">Delete</button>
            `;
            leadsList.appendChild(li);
        });
    };

    // --- Global functions for buttons (exposed to global scope) ---
    window.updateLeadStatus = (leadId, newStatus) => {
        const leads = getLeads();
        const leadIndex = leads.findIndex(lead => lead.id === leadId);

        if (leadIndex > -1) {
            leads[leadIndex].status = newStatus;
            saveLeads(leads);
            displayLeads();
        }
    };

    window.deleteLead = (leadId) => {
        if (!confirm('Are you sure you want to delete this lead?')) return;

        const leads = getLeads().filter(lead => lead.id !== leadId);
        saveLeads(leads);
        displayLeads();
    };

    // Initial check on load
    checkAuth();
});