const STORAGE_KEY = 'animalAdoptionData';
let animals = [];
let editingId = null;

const messagePanel = document.getElementById('messagePanel');
const formPanel = document.getElementById('formPanel');
const searchPanel = document.getElementById('searchPanel');
const tablePanel = document.getElementById('tablePanel');
const statsPanel = document.getElementById('statsPanel');
const animalForm = document.getElementById('animalForm');
const formTitle = document.getElementById('formTitle');
const searchResult = document.getElementById('searchResult');
const speciesCount = document.getElementById('speciesCount');
const animalTableBody = document.querySelector('#animalTable tbody');
const filterName = document.getElementById('filterName');

function loadAnimals() {
    const saved = localStorage.getItem(STORAGE_KEY);
    animals = saved ? JSON.parse(saved) : [];
}

function saveAnimals() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(animals));
}

function showMessage(text, type = 'success') {
    messagePanel.innerHTML = `<div class="message ${type}">${text}</div>`;
    setTimeout(() => {
        messagePanel.innerHTML = '';
    }, 4000);
}

function clearForm() {
    animalForm.reset();
    document.getElementById('animalStatus').value = 'Available';
    editingId = null;
    formTitle.textContent = 'Add New Animal';
    document.getElementById('animalId').disabled = false;
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

function renderTable(filter = '') {
    const normalized = filter.trim().toLowerCase();
    animalTableBody.innerHTML = '';
    const rows = animals
        .filter(animal => animal.name.toLowerCase().includes(normalized))
        .map(animal => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${animal.id}</td>
                <td>${animal.name}</td>
                <td>${animal.species}</td>
                <td>${animal.breed}</td>
                <td>${animal.age}</td>
                <td>${animal.gender}</td>
                <td>${animal.health}</td>
                <td>${animal.status}</td>
                <td class="action-buttons">
                    <button onclick="editAnimal(${animal.id})">Edit</button>
                    <button onclick="deleteAnimal(${animal.id})">Delete</button>
                    <button onclick="adoptAnimal(${animal.id})">Adopt</button>
                </td>
            `;
            return row;
        });
    rows.forEach(row => animalTableBody.appendChild(row));
}

function addAnimal(event) {
    event.preventDefault();
    const animal = getFormData();

    if (!animal.id || !animal.name || !animal.species || !animal.breed || Number.isNaN(animal.age) || animal.age < 0 || !animal.gender || !animal.health) {
        showMessage('Please fill in all fields correctly.', 'error');
        return;
    }

    if (editingId === null) {
        if (animals.some(item => item.id === animal.id)) {
            showMessage('Animal ID must be unique.', 'error');
            return;
        }
        animals.push(animal);
        showMessage(`Animal '${animal.name}' added successfully.`);
    } else {
        const index = animals.findIndex(item => item.id === editingId);
        if (index === -1) {
            showMessage('Animal not found for update.', 'error');
            return;
        }
        animals[index] = animal;
        showMessage(`Animal '${animal.name}' updated successfully.`);
    }

    saveAnimals();
    renderTable(filterName.value);
    clearForm();
}

function editAnimal(id) {
    const animal = animals.find(item => item.id === id);
    if (!animal) {
        showMessage('Animal not found.', 'error');
        return;
    }
    setFormData(animal);
    editingId = id;
    formTitle.textContent = 'Update Animal Details';
    document.getElementById('animalId').disabled = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteAnimal(id) {
    if (!confirm('Are you sure you want to delete this animal?')) {
        return;
    }
    animals = animals.filter(animal => animal.id !== id);
    saveAnimals();
    renderTable(filterName.value);
    showMessage('Animal deleted successfully.');
}

function adoptAnimal(id) {
    const animal = animals.find(item => item.id === id);
    if (!animal) {
        showMessage('Animal not found.', 'error');
        return;
    }
    if (animal.status === 'Adopted') {
        showMessage('This animal is already adopted.', 'error');
        return;
    }
    if (!confirm(`Adopt '${animal.name}'?`)) {
        return;
    }
    animal.status = 'Adopted';
    saveAnimals();
    renderTable(filterName.value);
    showMessage(`'${animal.name}' has been adopted.`);
}

function showAvailableAnimals() {
    tablePanel.scrollIntoView({ behavior: 'smooth' });
    renderTable('');
    animalTableBody.innerHTML = '';
    const available = animals.filter(animal => animal.status === 'Available');
    available.forEach(animal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${animal.id}</td>
            <td>${animal.name}</td>
            <td>${animal.species}</td>
            <td>${animal.breed}</td>
            <td>${animal.age}</td>
            <td>${animal.gender}</td>
            <td>${animal.health}</td>
            <td>${animal.status}</td>
            <td class="action-buttons">
                <button onclick="editAnimal(${animal.id})">Edit</button>
                <button onclick="deleteAnimal(${animal.id})">Delete</button>
                <button onclick="adoptAnimal(${animal.id})">Adopt</button>
            </td>
        `;
        animalTableBody.appendChild(row);
    });
    if (available.length === 0) {
        animalTableBody.innerHTML = '<tr><td colspan="9">No available animals.</td></tr>';
    }
}

function countBySpecies() {
    const counts = {};
    animals.forEach(animal => {
        const species = animal.species.trim().toLowerCase();
        if (species) {
            counts[species] = (counts[species] || 0) + 1;
        }
    });
    speciesCount.innerHTML = '';
    if (Object.keys(counts).length === 0) {
        speciesCount.textContent = 'No records to count.';
        return;
    }
    const list = document.createElement('ul');
    Object.entries(counts).forEach(([species, total]) => {
        const item = document.createElement('li');
        item.textContent = `${species.charAt(0).toUpperCase() + species.slice(1)}: ${total}`;
        list.appendChild(item);
    });
    speciesCount.appendChild(list);
}

function searchById() {
    const searchId = Number(document.getElementById('searchId').value);
    searchResult.innerHTML = '';
    if (!searchId) {
        searchResult.textContent = 'Enter a valid Animal ID to search.';
        return;
    }
    const animal = animals.find(item => item.id === searchId);
    if (!animal) {
        searchResult.textContent = 'Animal not found.';
        return;
    }
    searchResult.innerHTML = `
        <div class="panel">
            <h3>${animal.name} (ID: ${animal.id})</h3>
            <p><strong>Species:</strong> ${animal.species}</p>
            <p><strong>Breed:</strong> ${animal.breed}</p>
            <p><strong>Age:</strong> ${animal.age}</p>
            <p><strong>Gender:</strong> ${animal.gender}</p>
            <p><strong>Health:</strong> ${animal.health}</p>
            <p><strong>Status:</strong> ${animal.status}</p>
        </div>
    `;
}

function showSection(sectionId) {
    [formPanel, searchPanel, tablePanel, statsPanel].forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
}

function init() {
    loadAnimals();
    renderTable();
    countBySpecies();
    showSection('formPanel');

    document.getElementById('showAddForm').addEventListener('click', () => {
        showSection('formPanel');
    });

    document.getElementById('showAllAnimals').addEventListener('click', () => {
        showSection('tablePanel');
        renderTable(filterName.value);
    });

    document.getElementById('showAvailableAnimals').addEventListener('click', () => {
        showSection('tablePanel');
        showAvailableAnimals();
    });

    document.getElementById('showSpeciesCount').addEventListener('click', () => {
        showSection('statsPanel');
        countBySpecies();
    });

    animalForm.addEventListener('submit', addAnimal);
    document.getElementById('cancelEdit').addEventListener('click', clearForm);
    document.getElementById('searchButton').addEventListener('click', searchById);
    document.getElementById('resetFilter').addEventListener('click', () => {
        filterName.value = '';
        renderTable();
    });
    filterName.addEventListener('input', () => renderTable(filterName.value));
}

window.addEventListener('DOMContentLoaded', init);
