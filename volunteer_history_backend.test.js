// volunteer_history.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const volunteerHistoryRouter = require('../volunteer_history_backend.js'); // Ensure this path is correct

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(volunteerHistoryRouter);

let mongoServer;

// Utility function to add a volunteer history entry
const addVolunteerHistory = async (historyData) => {
    return await request(app).post('/triggerVolunteerHistory').send(historyData);
};

// Utility function to fetch volunteer history
const fetchVolunteerHistory = async () => {
    return await request(app).get('/volunteer-history');
};

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Volunteer History API', () => {
    afterEach(async () => {
        // Clear the VolunteerHistory collection after each test
        await mongoose.connection.collections.volunteerhistories.deleteMany({});
    });

    it('should fetch an empty volunteer history initially', async () => {
        const response = await fetchVolunteerHistory();
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]); // Expecting an empty array
    });

    it('should successfully add a new volunteer history entry', async () => {
        const newEntry = {
            eventName: 'Beach Cleanup',
            eventDate: '2024-11-01',
            location: 'Houston Beach',
            department: 'Community Service',
            skill: 'Environmental Awareness',
            status: 'Completed'
        };

        const response = await addVolunteerHistory(newEntry);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(newEntry); // Ensure the response matches the input
    });

    it('should fetch volunteer history after adding an entry', async () => {
        const newEntry = {
            eventName: 'Beach Cleanup',
            eventDate: '2024-11-01',
            location: 'Houston Beach',
            department: 'Community Service',
            skill: 'Environmental Awareness',
            status: 'Completed'
        };

        await addVolunteerHistory(newEntry); // Add the entry

        const response = await fetchVolunteerHistory(); // Fetch volunteer history
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1); // Expecting one entry
        expect(response.body[0]).toMatchObject(newEntry); // Ensure it matches the added entry
    });

    it('should return an error when adding an invalid volunteer history entry', async () => {
        const invalidEntry = {
            eventName: '', // Missing eventName
            eventDate: 'invalid-date', // Invalid date
            location: '',
            department: '',
            skill: '',
            status: ''
        };

        const response = await addVolunteerHistory(invalidEntry);
        expect(response.status).toBe(500); // Expecting a server error for invalid entry
        expect(response.body.message).toBe('Error adding volunteer history'); // Check error message
    });
});
