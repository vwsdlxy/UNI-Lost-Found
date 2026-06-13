/* =====================================================
HOMEPAGE - LOGIN 
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const LoginForm = document.getElementById("LoginForm");
    if (LoginForm) {
    LoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        const messageEl = document.getElementById("loginMessage");
        const emailError = document.getElementById("emailError");
        const passwordError = document.getElementById("passwordError");

        // Clear previous errors
        emailError.textContent = "";
        passwordError.textContent = "";
        messageEl.textContent = "";

        if (!email) {
        emailError.textContent = "Email is required";
        return;
        }
        
        const uniEmailPattern = /^[a-zA-Z0-9._%+-]+@uni\.edu\.my$/;

        if (!uniEmailPattern.test(email)) {
        emailError.textContent = "Please use your UNI email.";
        return;
        }

        if (!password) {
        passwordError.textContent = "Password is required";
        return;
        }

        try {
        // User login - authenticate against database
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {

            // Store user info from database response
            localStorage.setItem("loggedInEmail", email);
            localStorage.setItem("userName", data.data.name);
            localStorage.setItem("userId", data.data.member_id);

            messageEl.textContent = "Login successful! Redirecting...";
            messageEl.style.color = "green";

            setTimeout(() => {
            window.location.href = "dashboard.html"; // Redirect to dashboard, not home.html
            }, 1000);

        } else {
            // Show invalid account message for any failed login
            messageEl.textContent = "Invalid email or password.";
            messageEl.style.color = "red";
        }

        } catch (error) {
        console.error("Login error:", error);
        messageEl.textContent = "Server error. Please try again.";
        messageEl.style.color = "red";
        }
    });
    }
});

/* =====================================================
NAV MENU OVERLAY
===================================================== */
// Toggle menu function
function toggleMenu() {
    const overlay = document.getElementById('menuOverlay');
    const panel = document.getElementById('menuPanel');
    
    overlay.classList.toggle('active');
    panel.classList.toggle('active');
    
    // Prevent body scrolling when menu is open
    if (panel.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Close menu when pressing Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const panel = document.getElementById('menuPanel');
        if (panel.classList.contains('active')) {
            toggleMenu();
        }
    }
});

/* =====================================================
MULTI-STEP FORM FOR REPORT PAGE
===================================================== */
// API endpoint - update this with your actual backend URL
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://uni-lost-found-backend-production.up.railway.app/api';

// Current section tracker
let currentSection = 1;
const totalSections = 3;

// Initialize multi-step form if on report page
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the report page
    if (document.getElementById('reportForm')) {
        updateProgressBar();
        
        // Add validation for phone input (with +60 prefix)
        const phoneInput = document.getElementById('reportContactPhone');
        if (phoneInput) {
            // Ensure only digits are entered
            phoneInput.addEventListener('input', function(e) {
                this.value = this.value.replace(/\D/g, '');
            });
            
            // Add blur event for phone validation
            phoneInput.addEventListener('blur', function(e) {
                validatePhoneField(this);
            });
        }

        // Add validation for email input
        const emailInput = document.getElementById('reportContactEmail');
        if (emailInput) {
            emailInput.addEventListener('blur', function(e) {
                validateEmailField(this);
            });
        }

        // Enable/disable next button based on category selection
        document.querySelectorAll('input[name="category"]').forEach(radio => {
            radio.addEventListener('change', function() {
                document.getElementById('nextToDetails').disabled = false;
            });
        });
    }

    // Load items from database if on view pages
    if (document.getElementById('lostItems')) {
        loadLostItemsFromDB();
    }
    if (document.getElementById('foundItems')) {
        loadFoundItemsFromDB();
    }
    if (document.getElementById('details')) {
        loadItemDetailsFromDB();
    }
});

// Validate email field for UNI format
function validateEmailField(input) {
    const uniEmailPattern = /^[a-zA-Z0-9._%+-]+@uni\.edu\.my$/;
    const formGroup = input.closest('.form-group');
    const errorSpan = document.getElementById('emailError');
    
    if (input.value && !uniEmailPattern.test(input.value)) {
        input.style.borderColor = '#dc3545';
        if (!errorSpan) {
            const error = document.createElement('span');
            error.id = 'emailError';
            error.className = 'field-error';
            error.style.color = '#dc3545';
            error.style.fontSize = '0.8rem';
            error.style.marginTop = '0.2rem';
            error.textContent = 'Please use your UNI email (xxxx@uni.edu.my)';
            if (formGroup) {
                formGroup.appendChild(error);
            }
        }
        return false;
    } else {
        input.style.borderColor = '';
        const errorSpan = document.getElementById('emailError');
        if (errorSpan) errorSpan.remove();
        return true;
    }
}

// Validate phone field for Malaysian format (with +60 prefix)
function validatePhoneField(input) {
    // Malaysian mobile numbers after +60:
    // 1X-XXXXXXX or 11-XXXXXXXX (9-10 digits after +60)
    const digitsOnly = input.value.replace(/\D/g, '');
    
    // Check if it's a valid Malaysian mobile number (after +60)
    // Must start with 1 (for mobile) and be 8-10 digits total
    const isValidMobile = digitsOnly.length >= 8 && digitsOnly.length <= 10 && digitsOnly.startsWith('1');
    
    const formGroup = input.closest('.form-group');
    const errorSpan = document.getElementById('phoneError');
    
    if (input.value && !isValidMobile) {
        input.style.borderColor = '#dc3545';
        if (!errorSpan) {
            const error = document.createElement('span');
            error.id = 'phoneError';
            error.className = 'field-error';
            error.style.color = '#dc3545';
            error.style.fontSize = '0.8rem';
            error.style.marginTop = '0.2rem';
            error.textContent = 'Please enter a valid Malaysian mobile number (8-10 digits after +60, starting with 1)';
            
            if (formGroup) {
                formGroup.appendChild(error);
            } else {
                // Fallback: append after the input's parent
                input.parentNode.parentNode.appendChild(error);
            }
        }
        return false;
    } else {
        input.style.borderColor = '';
        const errorSpan = document.getElementById('phoneError');
        if (errorSpan) errorSpan.remove();
        return true;
    }
}

// Navigation functions
function nextSection() {
    if (validateSection(currentSection)) {
        if (currentSection < totalSections) {
            // Hide current section
            document.getElementById(`section${currentSection}`).classList.remove('active');
            
            // Update step status
            document.getElementById(`step${currentSection}`).classList.add('completed');
            document.getElementById(`step${currentSection}`).classList.remove('active');
            
            // Move to next section
            currentSection++;
            document.getElementById(`section${currentSection}`).classList.add('active');
            document.getElementById(`step${currentSection}`).classList.add('active');
            
            // Update progress bar
            updateProgressBar();
        }
    }
}

function prevSection() {
    if (currentSection > 1) {
        // Hide current section
        document.getElementById(`section${currentSection}`).classList.remove('active');
        document.getElementById(`step${currentSection}`).classList.remove('active');
        
        // Remove completed status from current
        if (document.getElementById(`step${currentSection}`).classList.contains('completed')) {
            document.getElementById(`step${currentSection}`).classList.remove('completed');
        }
        
        // Move to previous section
        currentSection--;
        document.getElementById(`section${currentSection}`).classList.add('active');
        document.getElementById(`step${currentSection}`).classList.add('active');
        
        // Update progress bar
        updateProgressBar();
    }
}

// Validate section before proceeding
function validateSection(section) {
    switch(section) {
        case 1: // Category section
            const categorySelected = document.querySelector('input[name="category"]:checked');
            if (!categorySelected) {
                alert('Please select a category (Lost or Found)');
                return false;
            }
            return true;
            
        case 2: // Details section
            const title = document.getElementById('reportTitle').value.trim();
            const description = document.getElementById('reportDescription').value.trim();
            const location = document.getElementById('reportLocation').value.trim();
            
            if (!title || !description || !location) {
                alert('Please fill in all details fields');
                return false;
            }
            return true;
            
        case 3: // Contact section
            const email = document.getElementById('reportContactEmail').value.trim();
            const phone = document.getElementById('reportContactPhone').value.trim();
            const uniEmailPattern = /^[a-zA-Z0-9._%+-]+@uni\.edu\.my$/;
            
            if (!email && !phone) {
                alert('Please provide at least one contact method');
                return false;
            }
            
            if (email && !uniEmailPattern.test(email)) {
                alert('Please use your UNI email (xxxx@uni.edu.my)');
                return false;
            }
            
            if (phone) {
                const digitsOnly = phone.replace(/\D/g, '');
                // Malaysian mobile after +60: must start with 1, 8-10 digits
                const isValidMobile = digitsOnly.length >= 8 && digitsOnly.length <= 10 && digitsOnly.startsWith('1');
                
                if (!isValidMobile) {
                    alert('Please enter a valid Malaysian mobile number (8-10 digits after +60, starting with 1)\nExample: 123456789, 1123456789');
                    return false;
                }
            }
            return true;
            
        default:
            return true;
    }
}

// Helper validation functions
function isValidEmail(email) {
    const uniEmailPattern = /^[a-zA-Z0-9._%+-]+@uni\.edu\.my$/;
    return uniEmailPattern.test(email);
}

function isValidPhone(phone) {
    const digitsOnly = phone.replace(/\D/g, '');
    // Malaysian mobile after +60: must start with 1, 8-10 digits
    return digitsOnly.length >= 8 && digitsOnly.length <= 10 && digitsOnly.startsWith('1');
}

// Update progress bar width
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = (currentSection / totalSections) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

// Handle form submission for report page - SAVE TO DATABASE ONLY
document.addEventListener('DOMContentLoaded', function() {
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (validateSection(3)) {
                // Show loading state
                const submitBtn = document.querySelector('.btn-submit');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
                submitBtn.disabled = true;
                
                const phoneDigits = document.getElementById('reportContactPhone').value.replace(/\D/g, '');
                const fullPhoneNumber = phoneDigits ? `+60${phoneDigits}` : null;
                
                // Get user email from login if available
                const userEmail = localStorage.getItem("loggedInEmail") || "";
                
                const formData = {
                    title: document.getElementById('reportTitle').value,
                    description: document.getElementById('reportDescription').value,
                    category: document.querySelector('input[name="category"]:checked').value,
                    location: document.getElementById('reportLocation').value,
                    contact_email: document.getElementById('reportContactEmail').value || userEmail || null,
                    contact_phone: fullPhoneNumber,
                    status: "Active",
                    member_id: localStorage.getItem("userId")
                };

                try {
                    // Send to backend database only
                    console.log('Sending to:', `${API_BASE_URL}/items`);
                    console.log('Form data:', formData);
                    
                    const response = await fetch(`${API_BASE_URL}/items`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    console.log('Response status:', response.status);
                    const data = await response.json();
                    console.log('Response data:', data);

                    if (response.ok && data.success) {
                        alert("Report submitted successfully!");
                        
                        // Navigate to My Reports page to see the new report
                        window.location.href = "myreport.html";
                        
                    } else {
                        alert(data.message || 'Error submitting report to database');
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                    
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error connecting to database. Please try again.');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
});

/* =====================================================
DATABASE FUNCTIONS - LOAD ITEMS FROM DATABASE
===================================================== */

// Load Lost Items from Database
async function loadLostItemsFromDB() {
    try {
        const response = await fetch(`${API_BASE_URL}/items?category=Lost`);
        const data = await response.json();
        
        if (data.success && data.data) {
            displayLostItems(data.data);
        } else {
            console.error('Failed to load lost items');
            // Fallback to localStorage if database fails
            loadLostItemsFromLocal();
        }
    } catch (error) {
        console.error('Error loading lost items from database:', error);
        // Fallback to localStorage if database fails
        loadLostItemsFromLocal();
    }
}

// Load Found Items from Database
async function loadFoundItemsFromDB() {
    try {
        const response = await fetch(`${API_BASE_URL}/items?category=Found`);
        const data = await response.json();
        
        if (data.success && data.data) {
            displayFoundItems(data.data);
        } else {
            console.error('Failed to load found items');
            // Fallback to localStorage if database fails
            loadFoundItemsFromLocal();
        }
    } catch (error) {
        console.error('Error loading found items from database:', error);
        // Fallback to localStorage if database fails
        loadFoundItemsFromLocal();
    }
}

// Load Item Details from Database
async function loadItemDetailsFromDB() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    if (!id) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/items/${id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            displayItemDetails(data.data);
        } else {
            console.error('Failed to load item details');
            // Fallback to localStorage if database fails
            loadItemDetailsFromLocal(id);
        }
    } catch (error) {
        console.error('Error loading item details from database:', error);
        // Fallback to localStorage if database fails
        loadItemDetailsFromLocal(id);
    }
}

/* =====================================================
DISPLAY FUNCTIONS
===================================================== */

// Display Lost Items
function displayLostItems(items) {
    let lostContainer = document.getElementById("lostItems");
    if (!lostContainer) return;
    
    lostContainer.innerHTML = '';
    
    if (items.length === 0) {
        lostContainer.innerHTML = '<p class="no-items">No lost items reported yet.</p>';
        return;
    }

    items.forEach(item => {
        lostContainer.innerHTML += `
            <div class="item-card">
                <h3>${item.title}</h3>
                <p><i class="fa-solid fa-location-dot"></i> ${item.location}</p>
                <p><i class="fa-solid fa-circle-info"></i> Status: ${item.status}</p>
                <p><i class="fa-solid fa-calendar"></i> ${new Date(item.created_at).toLocaleDateString()}</p>
                <a href="details.html?id=${item.report_id}" class="view-btn">View Details</a>
            </div>
        `;
    });
}

// Display Found Items
function displayFoundItems(items) {
    let foundContainer = document.getElementById("foundItems");
    if (!foundContainer) return;
    
    foundContainer.innerHTML = '';
    
    if (items.length === 0) {
        foundContainer.innerHTML = '<p class="no-items">No found items reported yet.</p>';
        return;
    }

    items.forEach(item => {
        foundContainer.innerHTML += `
            <div class="item-card">
                <h3>${item.title}</h3>
                <p><i class="fa-solid fa-location-dot"></i> ${item.location}</p>
                <p><i class="fa-solid fa-circle-info"></i> Status: ${item.status}</p>
                <p><i class="fa-solid fa-calendar"></i> ${new Date(item.created_at).toLocaleDateString()}</p>
                <a href="details.html?id=${item.report_id}" class="view-btn">View Details</a>
            </div>
        `;
    });
}

// Display Item Details
function displayItemDetails(item) {
    let details = document.getElementById("details");
    if (!details) return;

    details.innerHTML = `
        <div class="details-container">
            <h2>${item.title}</h2>
            <p class="category-badge ${item.category.toLowerCase()}">${item.category}</p>
            
            <div class="detail-section">
                <h3><i class="fa-solid fa-align-left"></i> Description</h3>
                <p>${item.description}</p>
            </div>
            
            <div class="detail-section">
                <h3><i class="fa-solid fa-location-dot"></i> Location</h3>
                <p>${item.location}</p>
            </div>
            
            <div class="detail-section">
                <h3><i class="fa-solid fa-calendar"></i> Date Reported</h3>
                <p>${new Date(item.created_at).toLocaleDateString()}</p>
            </div>
            
            <div class="detail-section">
                <h3><i class="fa-solid fa-address-card"></i> Contact Information</h3>
                ${item.contact_email ? `<p><strong>Email:</strong> ${item.contact_email}</p>` : ''}
                ${item.contact_phone ? `<p><strong>Phone:</strong> ${item.contact_phone}</p>` : ''}
            </div>
            
            <div class="detail-section">
                <h3><i class="fa-solid fa-circle-info"></i> Status</h3>
                <p class="status-badge ${item.status.toLowerCase()}">${item.status}</p>
            </div>
            
            <div class="action-buttons">
                ${item.status === 'Active' ? 
                    `<button onclick="updateStatusInDB(${item.report_id})" class="btn-resolve">
                        <i class="fa-solid fa-check-circle"></i> Mark as Claimed
                    </button>` : 
                    ''}
                <button onclick="deleteItemFromDB(${item.report_id})" class="btn-delete">
                    <i class="fa-solid fa-trash"></i> Delete Report
                </button>
                <button onclick="window.history.back()" class="btn-back">
                    <i class="fa-solid fa-arrow-left"></i> Back
                </button>
            </div>
        </div>
    `;
}

/* =====================================================
LOCALSTORAGE FALLBACK FUNCTIONS
===================================================== */

// Load Lost Items from localStorage (fallback)
function loadLostItemsFromLocal() {
    let items = JSON.parse(localStorage.getItem("items")) || [];
    let lostItems = items.filter(i => i.category === "Lost");
    displayLostItems(lostItems);
}

// Load Found Items from localStorage (fallback)
function loadFoundItemsFromLocal() {
    let items = JSON.parse(localStorage.getItem("items")) || [];
    let foundItems = items.filter(i => i.category === "Found");
    displayFoundItems(foundItems);
}

// Load Item Details from localStorage (fallback)
function loadItemDetailsFromLocal(id) {
    let items = JSON.parse(localStorage.getItem("items")) || [];
    let item = items.find(i => i.id == id);
    if (item) {
        displayItemDetails(item);
    }
}

/* =====================================================
DATABASE UPDATE/DELETE FUNCTIONS
===================================================== */

// Update Status in Database
async function updateStatusInDB(id) {
    if (!confirm('Are you sure you want to mark this item as claimed?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/items/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'Claimed' })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('Status updated successfully!');
            location.reload();
        } else {
            alert(data.message || 'Error updating status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error connecting to database');
    }
}

// Delete Item from Database
async function deleteItemFromDB(id) {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/items/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('Item deleted successfully!');
            window.location.href = "index.html";
        } else {
            alert(data.message || 'Error deleting item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error connecting to database');
    }
}

/* =====================================================
LEGACY FUNCTIONS - Kept for backward compatibility
===================================================== */

// These are kept for any pages that might still use them
let items = JSON.parse(localStorage.getItem("items")) || [];

/* Submit Lost Item - Legacy */
let lostForm = document.getElementById("lostForm");
if(lostForm){
    lostForm.addEventListener("submit", function(e){
        e.preventDefault();
        let item = {
            id: Date.now(),
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            category: "Lost",
            location: document.getElementById("location").value,
            date: document.getElementById("date").value,
            contact: document.getElementById("contact").value,
            status: "Active"
        };
        items.push(item);
        localStorage.setItem("items", JSON.stringify(items));
        alert("Lost item reported!");
        window.location.href="myreport.html";
    });
}

/* Submit Found Item - Legacy */
let foundForm = document.getElementById("foundForm");
if(foundForm){
    foundForm.addEventListener("submit", function(e){
        e.preventDefault();
        let item = {
            id: Date.now(),
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            category: "Found",
            location: document.getElementById("location").value,
            date: document.getElementById("date").value,
            contact: document.getElementById("contact").value,
            status: "Active"
        };
        items.push(item);
        localStorage.setItem("items", JSON.stringify(items));
        alert("Found item reported!");
        window.location.href="myreport.html";
    });
}

// Legacy display functions (will be overwritten by database versions if they exist)
if (document.getElementById('lostItems') && !window.location.href.includes('database')) {
    let lostItems = items.filter(i => i.category === "Lost");
    lostItems.forEach(item => {
        document.getElementById('lostItems').innerHTML += `
            <div class="item">
                <h3>${item.title}</h3>
                <p>${item.location}</p>
                <p>Status: ${item.status}</p>
                <a href="details.html?id=${item.report_id}">View Details</a>
            </div>
        `;
    });
}

if (document.getElementById('foundItems') && !window.location.href.includes('database')) {
    let foundItems = items.filter(i => i.category === "Found");
    foundItems.forEach(item => {
        document.getElementById('foundItems').innerHTML += `
            <div class="item">
                <h3>${item.title}</h3>
                <p>${item.location}</p>
                <p>Status: ${item.status}</p>
                <a href="details.html?id=${item.report_id}">View Details</a>
            </div>
        `;
    });
}

// Legacy details display
if (document.getElementById('details') && !window.location.href.includes('database')) {
    let params = new URLSearchParams(window.location.search);
    let id = params.get("id");
    let item = items.find(i => i.id == id);
    if (item) {
        document.getElementById('details').innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <p>Category: ${item.category}</p>
            <p>Location: ${item.location}</p>
            <p>Date: ${item.date}</p>
            <p>Contact: ${item.contact}</p>
            <p>Status: ${item.status}</p>
            <button onclick="updateStatus(${item.report_id})">Mark as Claimed</button>
            <button onclick="deleteItem(${item.report_id})">Delete Report</button>
        `;
    }
}

// Legacy status update
function updateStatus(id){
    items = items.map(item => {
        if(item.report_id == id){
            item.status = "Claimed";
        }
        return item;
    });
    localStorage.setItem("items", JSON.stringify(items));
    alert("Status Updated");
    location.reload();
}

// Legacy delete
function deleteItem(id){
    items = items.filter(item => item.report_id != id);
    localStorage.setItem("items", JSON.stringify(items));
    alert("Item Deleted");
    window.location.href="index.html";
}

/* =====================================================
VIEW PAGE FUNCTIONS
===================================================== */
// Selected filters (single select for each type)
let selectedCategory = null;
let selectedStatus = null;

// Initialize view page
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the view page
    if (document.getElementById('itemsContainer')) {
        loadViewItems();
    }
});

// Toggle category filter (single select)
function toggleCategory(category) {
    // If clicking the same category, unselect it
    if (selectedCategory === category) {
        selectedCategory = null;
    } else {
        // Otherwise, select the new category
        selectedCategory = category;
    }
    
    // Update button active states for categories
    document.querySelectorAll('.filter-btn.category-btn').forEach(btn => {
        const btnCategory = btn.getAttribute('data-category');
        if (selectedCategory === btnCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Reload items with current filters
    loadViewItems();
}

// Toggle status filter (single select)
function toggleStatus(status) {
    // If clicking the same status, unselect it
    if (selectedStatus === status) {
        selectedStatus = null;
    } else {
        // Otherwise, select the new status
        selectedStatus = status;
    }
    
    // Update button active states for statuses
    document.querySelectorAll('.filter-btn.status-btn').forEach(btn => {
        const btnStatus = btn.getAttribute('data-status');
        if (selectedStatus === btnStatus) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Reload items with current filters
    loadViewItems();
}

// Load items from database for view page
async function loadViewItems() {
    const container = document.getElementById('itemsContainer');
    
    // Show loading state
    container.innerHTML = `
        <div class="loading-spinner">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Loading items...</p>
        </div>
    `;
    
    try {
        // Fetch all items from database
        const response = await fetch(`${API_BASE_URL}/items`);
        const data = await response.json();
        
        if (data.success && data.data) {
            // Apply filters to all items
            let filteredItems = data.data;
            
            // Filter by selected category (if any)
            if (selectedCategory) {
                filteredItems = filteredItems.filter(item => 
                    item.category.toLowerCase() === selectedCategory
                );
            }
            
            // Filter by selected status (if any)
            if (selectedStatus) {
                filteredItems = filteredItems.filter(item => {
                    const itemStatus = item.status ? item.status.toLowerCase() : 'active';
                    
                    if (selectedStatus === 'active') {
                        return itemStatus === 'active';
                    } else if (selectedStatus === 'claimed') {
                        return itemStatus === 'claimed';
                    }
                    return false;
                });
            }
            
            displayViewItems(filteredItems);
        } else {
            showNoItems(container, 'Failed to load items');
        }
    } catch (error) {
        console.error(`Error loading items:`, error);
        // Fallback to localStorage if database fails
        loadViewItemsFromLocal();
    }
}

// Load items from localStorage as fallback
function loadViewItemsFromLocal() {
    const container = document.getElementById('itemsContainer');
    const items = JSON.parse(localStorage.getItem("items")) || [];
    
    // Apply filters to all items
    let filteredItems = items;
    
    // Filter by selected category (if any)
    if (selectedCategory) {
        filteredItems = filteredItems.filter(item => {
            const itemCategory = item.category ? item.category.toLowerCase() : '';
            return itemCategory === selectedCategory;
        });
    }
    
    // Filter by selected status (if any)
    if (selectedStatus) {
        filteredItems = filteredItems.filter(item => {
            const itemStatus = item.status ? item.status.toLowerCase() : 'active';
            
            if (selectedStatus === 'active') {
                return itemStatus === 'active';
            } else if (selectedStatus === 'claimed') {
                return itemStatus === 'claimed';
            }
            return false;
        });
    }
    
    displayViewItems(filteredItems);
}

// Display items in grid layout
function displayViewItems(items) {
    const container = document.getElementById('itemsContainer');
    
    if (!items || items.length === 0) {
        showNoItems(container);
        return;
    }
    
    container.innerHTML = '';
    
    items.forEach(item => {
        const itemCard = createViewItemCard(item);
        container.appendChild(itemCard);
    });
    
    // Check truncation after items are added to DOM
    setTimeout(checkTruncation, 100);
}

// Create individual item card for view page with standard status badge
function createViewItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    // Format date with time
    const date = item.created_at ? new Date(item.created_at) : new Date(item.date);
    const formattedDateTime = date.toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    // Truncate description
    const description = item.description || 'No description provided';
    const shortDescription = description.length > 100 ? 
        description.substring(0, 100) + '...' : description;
    
    // Determine status display with standard format (with icon)
    const statusDisplay = item.status || 'Active';
    const statusClass = statusDisplay.toLowerCase();
    const statusIcon = statusClass === 'active' ? 'fa-hourglass-half' : 'fa-check-circle';
    
    card.innerHTML = `
        <div class="item-header">
            <h3 class="item-title">${escapeHtml(item.title)}</h3>
            <span class="category-badge ${item.category.toLowerCase()}">${item.category}</span>
        </div>
        
        <p class="item-description">${escapeHtml(shortDescription)}</p>
        
        <div class="item-details">
            <div class="detail-row">
                <i class="fa-solid fa-location-dot"></i>
                <span>${escapeHtml(item.location)}</span>
            </div>
            <div class="detail-row">
                <i class="fa-solid fa-calendar"></i>
                <span>${formattedDateTime}</span>
            </div>
            <div class="detail-row">
                <i class="fa-solid fa-circle-info"></i>
                <span>Status: 
                    <span class="status-badge ${statusClass}">
                        <i class="fa-solid ${statusIcon}"></i>
                        ${statusDisplay}
                    </span>
                </span>
            </div>
        </div>
        
        <button onclick="showItemDetails(${item.report_id})" class="view-details-btn">
            <i class="fa-solid fa-eye"></i>
            View Details
        </button>
    `;
    
    return card;
}

function checkTruncation() {
    // Check if description is truncated and add class for gradient fade
    const descriptions = document.querySelectorAll('.item-description');
    descriptions.forEach(desc => {
        if (desc.scrollHeight > desc.clientHeight) {
            desc.classList.add('truncated');
        }
    });
}

// Show no items message
function showNoItems(container, message = null) {
    let filterDescription = '';
    
    if (selectedCategory || selectedStatus) {
        filterDescription = ' with selected filters';
    }
    
    container.innerHTML = `
        <div class="no-items">
            <i class="fa-solid fa-box-open"></i>
            <p>${message || `No items found${filterDescription}`}</p>
            <p class="sub-text">Try adjusting your filters or check back later</p>
        </div>
    `;
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* =====================================================
MODAL FUNCTIONS FOR VIEW PAGE
===================================================== */
// Show item details in modal
async function showItemDetails(itemId) {
    try {
        // Try to fetch from database first
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            displayModalWithItem(data.data);
        } else {
            // Fallback to localStorage
            const items = JSON.parse(localStorage.getItem("items")) || [];
            const item = items.find(i => i.id == itemId);
            if (item) {
                displayModalWithItem(item);
            } else {
                alert('Item not found');
            }
        }
    } catch (error) {
        console.error('Error loading item details:', error);
        // Fallback to localStorage
        const items = JSON.parse(localStorage.getItem("items")) || [];
        const item = items.find(i => i.id == itemId);
        if (item) {
            displayModalWithItem(item);
        } else {
            alert('Error loading item details');
        }
    }
}

// Display modal with item details (standard status badge)
function displayModalWithItem(item) {
    const modal = document.getElementById('itemModal');
    const modalBody = document.getElementById('modalBody');
    
    // Format dates with time
    const createdDate = item.created_at ? new Date(item.created_at) : new Date(item.date);
    const updatedDate = item.updated_at ? new Date(item.updated_at) : new Date();
    
    const formattedCreated = createdDate.toLocaleString('en-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    
    const formattedUpdated = updatedDate.toLocaleString('en-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    
    // Determine status display with standard format (with icon)
    const statusDisplay = item.status || 'Active';
    const statusClass = statusDisplay.toLowerCase();
    const statusIcon = statusClass === 'active' ? 'fa-hourglass-half' : 'fa-check-circle';
    
    // Build modal content - "Got It" button for both Lost and Found
    modalBody.innerHTML = `
        <div class="modal-item-details">
            <h2 class="modal-item-title">${escapeHtml(item.title)}</h2>
            
            <div class="modal-category-badge ${item.category.toLowerCase()}">
                ${item.category} Item
            </div>
            
            <div class="modal-detail-group">
                <h3><i class="fa-solid fa-align-left"></i> Description</h3>
                <p>${escapeHtml(item.description || 'No description provided')}</p>
            </div>
            
            <div class="modal-detail-group">
                <h3><i class="fa-solid fa-location-dot"></i> Location</h3>
                <p>${escapeHtml(item.location || 'Location not specified')}</p>
            </div>
            
            <div class="modal-detail-group">
                <h3><i class="fa-solid fa-address-card"></i> Contact Information</h3>
                <div class="modal-contact-info">
                    ${item.contact_email ? `
                        <div class="modal-contact-item">
                            <i class="fa-solid fa-envelope"></i>
                            <span>${escapeHtml(item.contact_email)}</span>
                        </div>
                    ` : ''}
                    ${item.contact_phone ? `
                        <div class="modal-contact-item">
                            <i class="fa-solid fa-phone"></i>
                            <span>${escapeHtml(item.contact_phone)}</span>
                        </div>
                    ` : ''}
                    ${!item.contact_email && !item.contact_phone ? 
                        '<p>No contact information provided</p>' : ''}
                </div>
            </div>
            
            <div class="modal-detail-group">
                <h3><i class="fa-solid fa-circle-info"></i> Status</h3>
                <p>
                    <span class="modal-status-badge ${statusClass}">
                        <i class="fa-solid ${statusIcon}"></i>
                        ${statusDisplay}
                    </span>
                </p>
            </div>
            
            <div class="modal-detail-group">
                <h3><i class="fa-solid fa-clock"></i> Timestamps</h3>
                <div class="modal-timestamp">
                    <div>
                        <i class="fa-solid fa-calendar-plus"></i>
                        <strong>Created:</strong> ${formattedCreated}
                    </div>
                    <div>
                        <i class="fa-solid fa-calendar-check"></i>
                        <strong>Last Updated:</strong> ${formattedUpdated}
                    </div>
                </div>
            </div>
            
            <!-- Single "Got It" button for both Lost and Found -->
            <div class="modal-actions">
                <button onclick="closeModal()" class="modal-btn modal-btn-primary">
                    <i class="fa-solid fa-check"></i> Got It
                </button>
            </div>
        </div>
    `;
    
    // Show modal
    modal.style.display = 'block';
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('itemModal');
    modal.style.display = 'none';
    
    // Restore body scrolling
    document.body.style.overflow = '';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('itemModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('itemModal');
        if (modal.style.display === 'block') {
            closeModal();
        }
    }
});

/* =====================================================
DASHBOARD FUNCTIONS
===================================================== */
// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('recentItemsList')) return;
    // Check if user is logged in
    const userEmail = localStorage.getItem("loggedInEmail");
    if (!userEmail) {
        // Redirect to login if not logged in
        window.location.href = "index.html";
        return;
    }
    
    // Load recent items
    loadRecentItems();
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem("loggedInEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("userId");
        window.location.href = "index.html";
    }
}

// Load recent items from database
async function loadRecentItems() {
    const container = document.getElementById('recentItemsList');
    
    try {
        const response = await fetch(`${API_BASE_URL}/items`);
        const data = await response.json();
        
        if (data.success && data.data) {
            // Get the 4 most recent items
            const recentItems = data.data
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 4);
            
            displayRecentItems(recentItems);
        } else {
            // Fallback to localStorage
            loadRecentItemsFromLocal();
        }
    } catch (error) {
        console.error('Error loading recent items:', error);
        // Fallback to localStorage
        loadRecentItemsFromLocal();
    }
}

// Load recent items from localStorage as fallback
function loadRecentItemsFromLocal() {
    const container = document.getElementById('recentItemsList');
    const items = JSON.parse(localStorage.getItem("items")) || [];
    
    // Get the 4 most recent items
    const recentItems = items
        .sort((a, b) => b.id - a.id)
        .slice(0, 4);
    
    displayRecentItems(recentItems);
}

// Display recent items in the list
function displayRecentItems(items) {
    const container = document.getElementById('recentItemsList');
    
    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="no-items-message">
                <i class="fa-solid fa-box-open"></i>
                <p>No recent items found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    items.forEach((item, index) => {
        const date = item.created_at ? new Date(item.created_at) : new Date(item.date);
        const formattedDate = date.toLocaleDateString('en-MY', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusClass = item.status ? item.status.toLowerCase() : 'active';
        const categoryClass = item.category.toLowerCase();
        const statusIcon = statusClass === 'active' ? 'fa-hourglass-half' : 'fa-check-circle';
        
        const itemCard = document.createElement('div');
        itemCard.className = `recent-item-card ${categoryClass}`;
        itemCard.style.setProperty('--item-index', index);
        
        itemCard.innerHTML = `
            <div class="item-icon ${categoryClass}">
                <i class="fa-solid ${categoryClass === 'lost' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
            </div>
            <div class="item-info">
                <h4>${escapeHtml(item.title)}</h4>
                <p>
                    <i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location)}
                    <span class="item-status ${statusClass}">
                        <i class="fa-solid ${statusIcon}"></i>
                        ${item.status || 'Active'}
                    </span>
                </p>
                <p>
                    <i class="fa-solid fa-clock"></i> ${formattedDate}
                </p>
            </div>
            <a href="#" onclick="showItemDetails(${item.report_id}); return false;" class="view-link">
                View <i class="fa-solid fa-arrow-right"></i>
            </a>
        `;
        
        container.appendChild(itemCard);
    });
}

// Show item details in modal
async function showItemDetails(itemId) {
    try {
        // Try to fetch from database first
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            displayModalWithItem(data.data);
        } else {
            // Fallback to localStorage
            const items = JSON.parse(localStorage.getItem("items")) || [];
            const item = items.find(i => i.id == itemId);
            if (item) {
                displayModalWithItem(item);
            } else {
                alert('Item not found');
            }
        }
    } catch (error) {
        console.error('Error loading item details:', error);
        // Fallback to localStorage
        const items = JSON.parse(localStorage.getItem("items")) || [];
        const item = items.find(i => i.id == itemId);
        if (item) {
            displayModalWithItem(item);
        } else {
            alert('Error loading item details');
        }
    }
}

/* =====================================================
MY REPORTS PAGE - USER'S OWN REPORTS
===================================================== */

// Initialize My Reports page
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('myReportsContainer')) {
        // Check if user is logged in
        const userEmail = localStorage.getItem("loggedInEmail");
        if (!userEmail) {
            window.location.href = "";
            return;
        }
        
        // Load user's reports
        loadMyReports();
    }
});

// Load current user's reports from database
async function loadMyReports() {
    const container = document.getElementById('myReportsContainer');
    const userEmail = localStorage.getItem("loggedInEmail");
    const userId = localStorage.getItem("userId");
    if (!userEmail) return;
    
    try {
        // Fetch all items and filter by user's email
        const response = await fetch(`${API_BASE_URL}/items`);
        const data = await response.json();
        
        if (data.success && data.data) {
            // Filter items where contact_email matches logged in user
            const userReports = data.data.filter(item => 
                String(item.member_id) === String(userId) ||
                (item.contact_email && item.contact_email.toLowerCase() === userEmail.toLowerCase())
            );
            
            // Update report count
            updateReportCount(userReports.length);
            
            // Store all reports for filtering
            window.allUserReports = userReports;
            
            // Display reports
            displayMyReports(userReports);
        } else {
            // Fallback to localStorage
            loadMyReportsFromLocal();
        }
    } catch (error) {
        console.error('Error loading user reports:', error);
        // Fallback to localStorage
        loadMyReportsFromLocal();
    }
}

// Load user reports from localStorage as fallback
function loadMyReportsFromLocal() {
    const container = document.getElementById('myReportsContainer');
    const userEmail = localStorage.getItem("loggedInEmail");
    const userId = localStorage.getItem("userId");
    if (!userEmail) return;
    
    const items = JSON.parse(localStorage.getItem("items")) || [];
    
    // Filter items by contact email (case insensitive)
    const userReports = data.data.filter(item => 
        String(item.member_id) === String(userId) ||
        item.contact_email && item.contact_email.toLowerCase() === userEmail.toLowerCase()
    );
    
    // Update report count
    updateReportCount(userReports.length);
    
    // Store all reports for filtering
    window.allUserReports = userReports;
    
    // Display reports
    displayMyReports(userReports);
}

// Update report count badge
function updateReportCount(count) {
    const countElement = document.getElementById('reportCount');
    if (countElement) {
        countElement.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
    }
}

// Display user's reports
function displayMyReports(reports) {
    const container = document.getElementById('myReportsContainer');
    
    if (!container) return;
    
    if (!reports || reports.length === 0) {
        container.innerHTML = `
            <div class="no-items">
                <i class="fa-solid fa-box-open"></i>
                <p>You haven't reported any items yet</p>
                <p class="sub-text">Click "New Report" to get started</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    // Sort by date (newest first)
    const sortedReports = [...reports].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(a.date || 0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(b.date || 0);
        return dateB - dateA;
    });
    
    sortedReports.forEach(report => {
        const card = createMyReportCard(report);
        container.appendChild(card);
    });
}

// Create individual report card for My Reports page
function createMyReportCard(report) {
    const card = document.createElement('div');
    card.className = `myreport-card ${report.category.toLowerCase()}`;
    card.setAttribute('data-category', report.category.toLowerCase());
    card.setAttribute('data-status', (report.status || 'active').toLowerCase());
    card.setAttribute('data-id', report.report_id); // Add data-id for easy selection
    
    // Format date
    const reportDate = report.created_at ? new Date(report.created_at) : new Date(report.date || Date.now());
    const formattedDate = reportDate.toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const formattedTime = reportDate.toLocaleTimeString('en-MY', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    // Truncate description
    const description = report.description || 'No description provided';
    const shortDescription = description.length > 80 ? 
        description.substring(0, 80) + '...' : description;
    
    // Status display with standard format (with icon)
    const statusDisplay = report.status || 'Active';
    const statusClass = statusDisplay.toLowerCase();
    const statusIcon = statusClass === 'active' ? 'fa-hourglass-half' : 'fa-check-circle';
    
    card.innerHTML = `
        <div class="myreport-header">
            <div class="myreport-type-badge ${report.category.toLowerCase()}">
                <i class="fa-solid ${report.category.toLowerCase() === 'lost' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
                ${report.category}
            </div>
            <div class="myreport-status ${statusClass}">
                <i class="fa-solid ${statusIcon}"></i>
                ${statusDisplay}
            </div>
        </div>
        
        <h3 class="myreport-title">${escapeHtml(report.title)}</h3>
        
        <p class="myreport-description">${escapeHtml(shortDescription)}</p>
        
        <div class="myreport-meta">
            <div class="meta-item">
                <i class="fa-solid fa-location-dot"></i>
                <span>${escapeHtml(report.location || 'Location not specified')}</span>
            </div>
            <div class="meta-item">
                <i class="fa-solid fa-calendar"></i>
                <span>${formattedDate} at ${formattedTime}</span>
            </div>
        </div>
        
        <div class="myreport-actions">
            <button onclick="showMyReportDetails(${report.report_id})" class="action-btn view-btn">
                <i class="fa-solid fa-eye"></i> View Details
            </button>
            ${statusDisplay.toLowerCase() === 'active' ? 
                `<button onclick="markAsClaimedFromMyReports(${report.report_id})" class="action-btn claim-btn">
                    <i class="fa-solid fa-check-circle"></i> Mark Claimed
                </button>` : 
                `<button class="action-btn claimed-btn" disabled>
                    <i class="fa-solid fa-check-circle"></i> Claimed
                </button>`
            }
            <button onclick="deleteReportFromMyReports(${report.report_id})" class="action-btn delete-btn">
                <i class="fa-solid fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    return card;
}

// Filter My Reports by category or status
function filterMyReports(filterType) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`tab${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`).classList.add('active');
    
    if (!window.allUserReports) return;
    
    let filteredReports = window.allUserReports;
    
    switch(filterType) {
        case 'lost':
            filteredReports = window.allUserReports.filter(r => r.category.toLowerCase() === 'lost');
            break;
        case 'found':
            filteredReports = window.allUserReports.filter(r => r.category.toLowerCase() === 'found');
            break;
        case 'active':
            filteredReports = window.allUserReports.filter(r => (r.status || 'active').toLowerCase() === 'active');
            break;
        case 'claimed':
            filteredReports = window.allUserReports.filter(r => (r.status || 'active').toLowerCase() === 'claimed');
            break;
        case 'all':
        default:
            filteredReports = window.allUserReports;
            break;
    }
    
    displayMyReports(filteredReports);
}

// Show report details in modal (for My Reports page)
async function showMyReportDetails(itemId) {
    try {
        // Try to fetch from database first
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            displayMyReportModal(data.data);
        } else {
            // Fallback to localStorage
            const items = JSON.parse(localStorage.getItem("items")) || [];
            const item = items.find(i => i.id == itemId);
            if (item) {
                displayMyReportModal(item);
            } else {
                alert('Report not found');
            }
        }
    } catch (error) {
        console.error('Error loading report details:', error);
        // Fallback to localStorage
        const items = JSON.parse(localStorage.getItem("items")) || [];
        const item = items.find(i => i.id == itemId);
        if (item) {
            displayMyReportModal(item);
        } else {
            alert('Error loading report details');
        }
    }
}

// Display modal with report details (with complete details like view page)
function displayMyReportModal(item) {
    const modal = document.getElementById('itemModal');
    const modalBody = document.getElementById('modalBody');
    
    // Format dates with time (like view page)
    const createdDate = item.created_at ? new Date(item.created_at) : new Date(item.date || Date.now());
    const updatedDate = item.updated_at ? new Date(item.updated_at) : new Date();
    
    const formattedCreated = createdDate.toLocaleString('en-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    
    const formattedUpdated = updatedDate.toLocaleString('en-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    
    // Status display with standard format (with icon)
    const statusDisplay = item.status || 'Active';
    const statusClass = statusDisplay.toLowerCase();
    const statusIcon = statusClass === 'active' ? 'fa-hourglass-half' : 'fa-check-circle';
    
    modalBody.innerHTML = `
        <div class="modal-item-details">
            <h2 class="modal-item-title">${escapeHtml(item.title)}</h2>
            
            <div class="modal-category-badge ${item.category.toLowerCase()}">
                <i class="fa-solid ${item.category.toLowerCase() === 'lost' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
                ${item.category} Item
            </div>
            
            <div class="modal-detail-group">
                <h3><i class="fa-solid fa-align-left"></i> Description</h3>
                <p>${escapeHtml(item.description || 'No description provided')}</p>
            </div>
            
            <div class="modal-detail-group">
                <h3><i class="fa-solid fa-location-dot"></i> Location</h3>
                <p>${escapeHtml(item.location || 'Location not specified')}</p>
            </div>
            
            <div class="modal-detail-group">
                <h3><i class="fa-solid fa-address-card"></i> Your Contact Information</h3>
                <div class="modal-contact-info">
                    ${item.contact_email ? `
                        <div class="modal-contact-item">
                            <i class="fa-solid fa-envelope"></i>
                            <span>${escapeHtml(item.contact_email)}</span>
                        </div>
                    ` : ''}
                    ${item.contact_phone ? `
                        <div class="modal-contact-item">
                            <i class="fa-solid fa-phone"></i>
                            <span>${escapeHtml(item.contact_phone)}</span>
                        </div>
                    ` : ''}
                    ${!item.contact_email && !item.contact_phone ? 
                        '<p>No contact information provided</p>' : ''}
                </div>
            </div>
            
            <div class="modal-detail-group">
                <h3><i class="fa-solid fa-circle-info"></i> Status</h3>
                <p>
                    <span class="modal-status-badge ${statusClass}">
                        <i class="fa-solid ${statusIcon}"></i>
                        ${statusDisplay}
                    </span>
                </p>
            </div>
            
            <div class="modal-detail-group">
                <h3><i class="fa-solid fa-clock"></i> Timestamps</h3>
                <div class="modal-timestamp">
                    <div>
                        <i class="fa-solid fa-calendar-plus"></i>
                        <strong>Created:</strong> ${formattedCreated}
                    </div>
                    <div>
                        <i class="fa-solid fa-calendar-check"></i>
                        <strong>Last Updated:</strong> ${formattedUpdated}
                    </div>
                </div>
            </div>
            
            <!-- Single "Got It" button only -->
            <div class="modal-actions">
                <button onclick="closeModal()" class="modal-btn modal-btn-primary">
                    <i class="fa-solid fa-check"></i> Got It
                </button>
            </div>
        </div>
    `;
    
    // Show modal
    modal.style.display = 'block';
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

// Mark as claimed from My Reports card
async function markAsClaimedFromMyReports(itemId) {
    if (!confirm('Are you sure you want to mark this item as claimed?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'Claimed' })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('Item marked as claimed successfully!');
            // Reload the reports to reflect the change
            loadMyReports();
        } else {
            // Fallback to localStorage
            markAsClaimedFromLocal(itemId);
        }
    } catch (error) {
        console.error('Error updating status:', error);
        // Fallback to localStorage
        markAsClaimedFromLocal(itemId);
    }
}

// Mark as claimed from modal
async function markAsClaimedFromModal(itemId) {
    await markAsClaimedFromMyReports(itemId);
    closeModal();
}

// LocalStorage fallback for marking as claimed
function markAsClaimedFromLocal(itemId) {
    let items = JSON.parse(localStorage.getItem("items")) || [];
    const itemIndex = items.findIndex(i => i.id == itemId);
    
    if (itemIndex !== -1) {
        items[itemIndex].status = 'Claimed';
        localStorage.setItem("items", JSON.stringify(items));
        alert('Item marked as claimed successfully!');
        loadMyReports();
        closeModal();
    }
}

// Delete report from My Reports card
async function deleteReportFromMyReports(itemId) {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('Report deleted successfully!');
            // Remove the card from DOM immediately
            const card = document.querySelector(`.myreport-card[data-id="${itemId}"]`);
            if (card) {
                card.remove();
            }
            // Reload the reports to refresh the list and count
            loadMyReports();
        } else {
            // Fallback to localStorage
            deleteReportFromLocal(itemId);
        }
    } catch (error) {
        console.error('Error deleting report:', error);
        // Fallback to localStorage
        deleteReportFromLocal(itemId);
    }
}

// Delete report from modal
async function deleteReportFromModal(itemId) {
    await deleteReportFromMyReports(itemId);
    closeModal();
}

// LocalStorage fallback for deleting report
function deleteReportFromLocal(itemId) {
    let items = JSON.parse(localStorage.getItem("items")) || [];
    items = items.filter(item => item.report_id != itemId);
    localStorage.setItem("items", JSON.stringify(items));
    
    // Remove the card from DOM
    const card = document.querySelector(`.myreport-card[data-id="${itemId}"]`);
    if (card) {
        card.remove();
    }
    
    alert('Report deleted successfully!');
    loadMyReports(); // Reload to update count
    closeModal();
}