const STORAGE_KEY = 'animalAdoptionData';
const DARK_MODE_KEY = 'pawsAdoptDarkMode';
const PREMIUM_STATS = {
    rescued: 250,
    families: 180,
    support: 24,
    success: 98
};
let animals = [];
let editingId = null;

// DOM Elements - Core
const messagePanel = document.getElementById('messagePanel');
const formModal = document.getElementById('formModal');
const animalForm = document.getElementById('animalForm');
const formTitle = document.getElementById('formTitle');
const modalClose = document.getElementById('modalClose');
const cancelEdit = document.getElementById('cancelEdit');
const animalTable = document.getElementById('animalTable');
const availableTable = document.getElementById('availableTable');
const filterName = document.getElementById('filterName');
const resetFilter = document.getElementById('resetFilter');
const searchId = document.getElementById('searchId');
const searchButton = document.getElementById('searchButton');
const searchResult = document.getElementById('searchResult');
const speciesCount = document.getElementById('speciesCount');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const navAddBtn = document.getElementById('navAddBtn');
const heroFindBtn = document.getElementById('heroFindBtn');
const viewAllBtn = document.getElementById('viewAllBtn');
const featuredPets = document.getElementById('featuredPets');

// DOM Elements - Premium Features
const darkModeToggle = document.getElementById('darkModeToggle');
const loadingScreen = document.getElementById('loadingScreen');
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');

// Initialize
function init() {
    // Hide loading screen after 2 seconds
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }, 2000);
    
    loadAnimals();
    initDarkMode();
    setupEventListeners();
    setupFormHandlers();
    setupMobileMenu();
    setupFaqAccordion();
    renderFeaturedPets();
    updateStatistics();
    renderAllAnimals();
    setupScrollAnimations();
    animateCounters();
}

// ============================================
// PREMIUM FEATURES - Dark Mode
// ============================================
function initDarkMode() {
    const savedDarkMode = localStorage.getItem(DARK_MODE_KEY) === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) darkModeToggle.textContent = '☀️';
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem(DARK_MODE_KEY, isDarkMode);
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

// ============================================
// PREMIUM FEATURES - Scroll Animations
// ============================================
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-scroll').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// PREMIUM FEATURES - Animated Counters
// ============================================
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                const target = parseInt(entry.target.dataset.target) || 0;
                animateCounterValue(entry.target, 0, target, 2000);
                entry.target.dataset.animated = 'true';
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateCounterValue(element, start, end, duration) {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

// ============================================
// PREMIUM FEATURES - Mobile Menu
// ============================================
function setupMobileMenu() {
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when nav link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}

function setupFaqAccordion() {
    document.querySelectorAll('.faq-item').forEach(item => {
        const button = item.querySelector('.faq-question');
        if (!button) return;

        button.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(entry => {
                entry.classList.remove('active');
            });

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ============================================
// PREMIUM FEATURES - Form Handlers
// ============================================
function setupFormHandlers() {
    // Rescue Form
    const rescueForm = document.querySelector('.rescue-form');
    if (rescueForm) {
        rescueForm.addEventListener('submit', handleRescueSubmit);
    }
    
    // Contact Form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Donate Buttons
    const donateButtons = document.querySelectorAll('.donate-btn');
    donateButtons.forEach(btn => {
        btn.addEventListener('click', handleDonation);
    });
    
    // Adopt CTA Navigation
    const adoptCTA = document.getElementById('adoptCTA');
    if (adoptCTA) {
        adoptCTA.addEventListener('click', () => {
            document.querySelector('[data-tab="view-tab"]')?.click();
            const mainPanel = document.querySelector('.main-panel');
            if (mainPanel) {
                window.scrollTo({ top: mainPanel.offsetTop - 100, behavior: 'smooth' });
            }
        });
    }
}

function handleRescueSubmit(e) {
    e.preventDefault();
    
    const location = e.target.querySelector('input[name="rescue-location"]')?.value.trim();
    const description = e.target.querySelector('textarea[name="rescue-description"]')?.value.trim();
    const name = e.target.querySelector('input[name="rescue-name"]')?.value.trim();
    const phone = e.target.querySelector('input[name="rescue-phone"]')?.value.trim();
    
    if (!location || !description || !name || !phone) {
        showMessage('Please fill in all rescue report fields.', 'error');
        return;
    }
    
    if (phone.length < 10) {
        showMessage('Please enter a valid phone number.', 'error');
        return;
    }
        showMessage('Thank you for reporting. Our rescue team will contact you soon at ' + phone, 'success');
    e.target.reset();
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const name = e.target.querySelector('input[name="contact-name"]')?.value.trim();
    const email = e.target.querySelector('input[name="contact-email"]')?.value.trim();
    const subject = e.target.querySelector('input[name="contact-subject"]')?.value.trim();
    const message = e.target.querySelector('textarea[name="contact-message"]')?.value.trim();
    
    if (!name || !email || !subject || !message) {
        showMessage('Please fill in all contact fields.', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    showMessage('✉️ Thank you for contacting us! We\'ll respond to ' + email + ' shortly.', 'success');
    e.target.reset();
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]')?.value.trim();
    
    if (!email) {
        showMessage('Please enter an email address.', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    showMessage('📧 Welcome to our newsletter! Check ' + email + ' for updates.', 'success');
    e.target.reset();
}

function handleDonation(e) {
    const amount = e.currentTarget.dataset.amount || '?';
    showMessage('💖 Thank you for your generous donation of $' + amount + '! Your support saves lives.', 'success');
}

// Event Listeners
function setupEventListeners() {
    // Form Events
    animalForm.addEventListener('submit', addAnimal);
    modalClose.addEventListener('click', closeModal);
    cancelEdit.addEventListener('click', closeModal);

    // Button Events
    navAddBtn.addEventListener('click', openAddModal);
    heroFindBtn.addEventListener('click', () => {
        document.querySelector('[data-tab="view-tab"]').click();
        document.documentElement.scrollIntoView({ behavior: 'smooth' });
    });
    viewAllBtn.addEventListener('click', () => {
        document.querySelector('[data-tab="view-tab"]').click();
        document.documentElement.scrollIntoView({ behavior: 'smooth' });
    });

    // Tab Events
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tabId = e.currentTarget.dataset.tab;
            switchTab(tabId);
        });
    });

    // Table Filter Events
    filterName.addEventListener('input', () => renderAllAnimals(filterName.value));
    resetFilter.addEventListener('click', () => {
        filterName.value = '';
        renderAllAnimals();
    });

    // Search Events
    searchButton.addEventListener('click', searchById);
    searchId.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchById();
    });

    // Close modal when clicking outside
    formModal.addEventListener('click', (e) => {
        if (e.target === formModal) closeModal();
    });
}

// Local Storage
function loadAnimals() {
    const saved = localStorage.getItem(STORAGE_KEY);
    animals = saved ? JSON.parse(saved) : [];
}

function saveAnimals() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(animals));
}

// Messages
function showMessage(text, type = 'success') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = `
        <span>${text}</span>
        <button onclick="this.parentElement.remove()" style="background:none; border:none; color:inherit; font-size:1.2rem; cursor:pointer;">&times;</button>
    `;
    messagePanel.appendChild(messageEl);
    setTimeout(() => messageEl.remove(), 4000);
}

// Modal Management
function openAddModal() {
    clearForm();
    formTitle.textContent = 'Add New Pet';
    document.getElementById('animalId').disabled = false;
    formModal.classList.add('active');
}

function closeModal() {
    formModal.classList.remove('active');
    clearForm();
}

function clearForm() {
    animalForm.reset();
    document.getElementById('animalStatus').value = 'Available';
    editingId = null;
}

function setFormData(animal) {
    document.getElementById('animalId').value = animal.id;
    document.getElementById('animalName').value = animal.name;
    document.getElementById('animalSpecies').value = animal.species;
    document.getElementById('animalBreed').value = animal.breed;
    document.getElementById('animalAge').value = animal.age;
    document.getElementById('animalGender').value = animal.gender;
    document.getElementById('animalHealth').value = animal.health;
    document.getElementById('animalStatus').value = animal.status;
}

function getFormData() {
    return {
        id: Number(document.getElementById('animalId').value),
        name: document.getElementById('animalName').value.trim(),
        species: document.getElementById('animalSpecies').value.trim(),
        breed: document.getElementById('animalBreed').value.trim(),
        age: Number(document.getElementById('animalAge').value),
        gender: document.getElementById('animalGender').value,
        health: document.getElementById('animalHealth').value.trim(),
        status: document.getElementById('animalStatus').value
    };
}

// Rendering Functions
function renderFeaturedPets() {
    const featured = animals.filter(a => a.status === 'Available').slice(0, 3);
    featuredPets.innerHTML = featured.length === 0 
        ? '<p style="grid-column: 1/-1; text-align: center; color: #999;">No featured pets available</p>'
        : featured.map(animal => createPetCard(animal)).join('');
}

function getAnimalPhoto(animal) {
    const speciesPhotos = {
        dog: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=80',
        cat: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80',
        bird: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=900&q=80',
        rabbit: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80',
        hamster: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80',
        fish: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=900&q=80'
    };

    const namePhotos = {
        bella: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
        max: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=80',
        luna: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=900&q=80',
        mocha: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80'
    };

    const normalizedName = (animal.name || '').trim().toLowerCase();
    if (namePhotos[normalizedName]) {
        return namePhotos[normalizedName];
    }

    return speciesPhotos[animal.species.toLowerCase()] || 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80';
}

function createPetCard(animal) {
    const photo = getAnimalPhoto(animal);

    return `
        <div class="pet-card">
            <div class="pet-card-header">
                <img src="${photo}" alt="${animal.name} the ${animal.species}" loading="lazy">
            </div>
            <div class="pet-card-body">
                <h3>${animal.name}</h3>
                <span class="pet-species">${animal.species}</span>
                <p>${animal.breed}</p>
                <div class="pet-info">
                    <div class="pet-info-item">
                        <div class="pet-info-label">Age</div>
                        <div class="pet-info-value">${animal.age}y</div>
                    </div>
                    <div class="pet-info-item">
                        <div class="pet-info-label">Gender</div>
                        <div class="pet-info-value">${animal.gender}</div>
                    </div>
                    <div class="pet-info-item">
                        <div class="pet-info-label">Health</div>
                        <div class="pet-info-value">${animal.health.substring(0, 8)}...</div>
                    </div>
                </div>
                <button class="btn-primary" onclick="adoptAnimal(${animal.id})">Adopt</button>
            </div>
        </div>
    `;
}

function renderAllAnimals(filter = '') {
    const normalized = filter.trim().toLowerCase();
    const filtered = animals.filter(animal => animal.name.toLowerCase().includes(normalized));
    
    animalTable.innerHTML = filtered.length === 0
        ? '<tr><td colspan="9" style="text-align: center; padding: 30px;">No pets found</td></tr>'
        : filtered.map(animal => createTableRow(animal, true)).join('');
}

function renderAvailableAnimals() {
    const available = animals.filter(animal => animal.status === 'Available');
    availableTable.innerHTML = available.length === 0
        ? '<tr><td colspan="8" style="text-align: center; padding: 30px;">No available pets</td></tr>'
        : available.map(animal => createTableRow(animal, false)).join('');
}

function createTableRow(animal, showStatus = true) {
    const statusBadge = `<span class="status-badge status-${animal.status.toLowerCase()}">${animal.status}</span>`;
    
    if (showStatus) {
        return `
            <tr>
                <td>${animal.id}</td>
                <td>${animal.name}</td>
                <td>${animal.species}</td>
                <td>${animal.breed}</td>
                <td>${animal.age}</td>
                <td>${animal.gender}</td>
                <td>${animal.health}</td>
                <td>${statusBadge}</td>
                <td class="action-buttons">
                    <button class="btn-edit" onclick="editAnimal(${animal.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" onclick="deleteAnimal(${animal.id})"><i class="fas fa-trash"></i> Delete</button>
                    <button class="btn-adopt" onclick="adoptAnimal(${animal.id})"><i class="fas fa-heart"></i> Adopt</button>
                </td>
            </tr>
        `;
    } else {
        return `
            <tr>
                <td>${animal.id}</td>
                <td>${animal.name}</td>
                <td>${animal.species}</td>
                <td>${animal.breed}</td>
                <td>${animal.age}</td>
                <td>${animal.gender}</td>
                <td>${animal.health}</td>
                <td class="action-buttons">
                    <button class="btn-edit" onclick="editAnimal(${animal.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" onclick="deleteAnimal(${animal.id})"><i class="fas fa-trash"></i> Delete</button>
                    <button class="btn-adopt" onclick="adoptAnimal(${animal.id})"><i class="fas fa-heart"></i> Adopt</button>
                </td>
            </tr>
        `;
    }
}

// Form Submission
function addAnimal(e) {
    e.preventDefault();
    const animal = getFormData();

    if (!animal.id || !animal.name || !animal.species || !animal.breed || Number.isNaN(animal.age) || !animal.gender || !animal.health) {
        showMessage('Please fill in all fields correctly.', 'error');
        return;
    }

    if (editingId === null) {
        if (animals.some(item => item.id === animal.id)) {
            showMessage('Pet ID must be unique.', 'error');
            return;
        }
        animals.push(animal);
        showMessage(`Pet '${animal.name}' added successfully.`);
    } else {
        const index = animals.findIndex(item => item.id === editingId);
        if (index === -1) {
            showMessage('Pet not found for update.', 'error');
            return;
        }
        animals[index] = animal;
        showMessage(`Pet '${animal.name}' updated successfully.`);
    }

    saveAnimals();
    renderAllAnimals();
    renderFeaturedPets();
    updateStatistics();
    closeModal();
}

// CRUD Operations
function editAnimal(id) {
    const animal = animals.find(item => item.id === id);
    if (!animal) {
        showMessage('Pet not found.', 'error');
        return;
    }
    setFormData(animal);
    editingId = id;
    formTitle.textContent = 'Update Pet Details';
    document.getElementById('animalId').disabled = true;
    formModal.classList.add('active');
}

function deleteAnimal(id) {
    if (!confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
        return;
    }
    animals = animals.filter(animal => animal.id !== id);
    saveAnimals();
    renderAllAnimals();
    renderFeaturedPets();
    updateStatistics();
    showMessage('Pet deleted successfully.');
}

function adoptAnimal(id) {
    const animal = animals.find(item => item.id === id);
    if (!animal) {
        showMessage('Pet not found.', 'error');
        return;
    }
    if (animal.status === 'Adopted') {
        showMessage('This pet is already adopted.', 'error');
        return;
    }
    if (!confirm(`Adopt '${animal.name}'? This pet will be marked as adopted.`)) {
        return;
    }
    animal.status = 'Adopted';
    saveAnimals();
    renderAllAnimals();
    renderFeaturedPets();
    updateStatistics();
    renderAvailableAnimals();
    showMessage(`🎉 Congratulations! '${animal.name}' has been adopted!`);
}

// Search
function searchById() {
    const id = Number(searchId.value);
    searchResult.innerHTML = '';
    
    if (!id) {
        showMessage('Enter a valid Pet ID to search.', 'error');
        return;
    }
    
    const animal = animals.find(item => item.id === id);
    if (!animal) {
        searchResult.innerHTML = `
            <div class="search-result-card" style="background: #fee; border-left-color: #e44;">
                <p><i class="fas fa-times-circle"></i> Pet not found with ID ${id}</p>
            </div>
        `;
        return;
    }
    
    searchResult.innerHTML = `
        <div class="search-result-card">
            <h3><i class="fas fa-paw"></i> ${animal.name} (ID: ${animal.id})</h3>
            <p><strong>Species:</strong> ${animal.species}</p>
            <p><strong>Breed:</strong> ${animal.breed}</p>
            <p><strong>Age:</strong> ${animal.age} years</p>
            <p><strong>Gender:</strong> ${animal.gender}</p>
            <p><strong>Health Status:</strong> ${animal.health}</p>
            <p><strong>Adoption Status:</strong> <span class="status-badge status-${animal.status.toLowerCase()}">${animal.status}</span></p>
            <div class="action-buttons" style="margin-top: 15px;">
                <button class="btn-edit" onclick="editAnimal(${animal.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-delete" onclick="deleteAnimal(${animal.id})"><i class="fas fa-trash"></i> Delete</button>
                <button class="btn-adopt" onclick="adoptAnimal(${animal.id})"><i class="fas fa-heart"></i> Adopt</button>
            </div>
        </div>
    `;
}

// Tab Switching
function switchTab(tabId) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');

    if (tabId === 'available-tab') {
        renderAvailableAnimals();
    } else if (tabId === 'stats-tab') {
        renderSpeciesCount();
    }
}

// Statistics
function updateStatistics() {
    const heroTotal = document.getElementById('hero-stat-total');
    const heroAdopted = document.getElementById('hero-stat-adopted');
    const impactStats = document.querySelectorAll('.counter');

    if (heroTotal) {
        animateCounterValue(heroTotal, 0, PREMIUM_STATS.rescued, 1400);
    }

    if (heroAdopted) {
        animateCounterValue(heroAdopted, 0, PREMIUM_STATS.families, 1400);
    }

    impactStats.forEach(counter => {
        const target = parseInt(counter.dataset.target || '0', 10);
        if (!counter.dataset.animated) {
            animateCounterValue(counter, 0, target, 1800);
            counter.dataset.animated = 'true';
        }
    });
}

function renderSpeciesCount() {
    const counts = {};
    animals.forEach(animal => {
        const species = animal.species.trim();
        if (species) {
            counts[species] = (counts[species] || 0) + 1;
        }
    });

    if (Object.keys(counts).length === 0) {
        speciesCount.innerHTML = '<p style="text-align: center; color: #999;">No pets to count</p>';
        return;
    }

    speciesCount.innerHTML = Object.entries(counts)
        .map(([species, count]) => `
            <div class="species-item">
                <div class="species-name">${species}</div>
                <div class="species-count">${count}</div>
            </div>
        `)
        .join('');
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);
