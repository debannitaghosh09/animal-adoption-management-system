const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'animals.json');
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function loadAnimals() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveAnimals(animals) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(animals, null, 2));
}

function validateAnimal(animal) {
    if (!animal || typeof animal !== 'object') {
        return 'Invalid animal data.';
    }
    if (!Number.isInteger(animal.id) || animal.id <= 0) {
        return 'Animal ID must be a positive integer.';
    }
    if (!animal.name || typeof animal.name !== 'string') {
        return 'Name is required.';
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return 'Species is required.';
    }
    if (!animal.breed || typeof animal.breed !== 'string') {
        return 'Breed is required.';
    }
    if (!Number.isInteger(animal.age) || animal.age < 0) {
        return 'Age must be a non-negative integer.';
    }
    if (!animal.gender || !['M', 'F'].includes(animal.gender)) {
        return 'Gender must be M or F.';
    }
    if (!animal.health || typeof animal.health !== 'string') {
        return 'Health status is required.';
    }
    if (!animal.status || !['Available', 'Adopted'].includes(animal.status)) {
        return 'Status must be Available or Adopted.';
    }
    return null;
}

app.get('/api/animals', (req, res) => {
    const animals = loadAnimals();
    res.json(animals);
});

app.get('/api/animals/:id', (req, res) => {
    const id = Number(req.params.id);
    const animals = loadAnimals();
    const animal = animals.find(item => item.id === id);
    if (!animal) {
        return res.status(404).json({ error: 'Animal not found.' });
    }
    res.json(animal);
});

app.post('/api/animals', (req, res) => {
    const animals = loadAnimals();
    const animal = req.body;
    const error = validateAnimal(animal);
    if (error) {
        return res.status(400).json({ error });
    }
    if (animals.some(item => item.id === animal.id)) {
        return res.status(400).json({ error: 'Animal ID already exists.' });
    }
    animals.push(animal);
    saveAnimals(animals);
    res.status(201).json(animal);
});

app.put('/api/animals/:id', (req, res) => {
    const id = Number(req.params.id);
    const animals = loadAnimals();
    const index = animals.findIndex(item => item.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Animal not found.' });
    }
    const animal = req.body;
    animal.id = id;
    const error = validateAnimal(animal);
    if (error) {
        return res.status(400).json({ error });
    }
    animals[index] = animal;
    saveAnimals(animals);
    res.json(animal);
});

app.delete('/api/animals/:id', (req, res) => {
    const id = Number(req.params.id);
    const animals = loadAnimals();
    const index = animals.findIndex(item => item.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Animal not found.' });
    }
    animals.splice(index, 1);
    saveAnimals(animals);
    res.json({ message: 'Animal deleted successfully.' });
});

app.post('/api/animals/:id/adopt', (req, res) => {
    const id = Number(req.params.id);
    const animals = loadAnimals();
    const animal = animals.find(item => item.id === id);
    if (!animal) {
        return res.status(404).json({ error: 'Animal not found.' });
    }
    if (animal.status === 'Adopted') {
        return res.status(400).json({ error: 'Animal is already adopted.' });
    }
    animal.status = 'Adopted';
    saveAnimals(animals);
    res.json(animal);
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
