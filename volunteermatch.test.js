const request = require('supertest');
const express = require('express');
const matchRouter = require('../volunteermatch.js'); // Adjust this to the actual path of your router file

const app = express();
app.use(express.json());
app.use('/api', matchRouter);

describe('POST /api/match', () => {
    it('should return a matched volunteer and event', async () => {
        const response = await request(app)
            .post('/api/match')
            .send({
                volunteers: [
                    { name: "James Smith", skills: ["Cardiology", "General"] },
                    { name: "Maria Garcia", skills: ["Pediatrics", "General"] },
                    { name: "John Doe", skills: ["Surgery", "Cardiology"] },
                    { name: "Jane Doe", skills: ["Oncology", "Pediatrics"] },
                ],
                events: [
                    { name: "Cardiology Department", requiredSkills: ["Cardiology"] },
                    { name: "Pediatrics Department", requiredSkills: ["Pediatrics"] },
                    { name: "Surgery Unit", requiredSkills: ["Surgery"] },
                    { name: "Oncology Department", requiredSkills: ["Oncology"] },
                ],
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.volunteerName).toBeDefined();
        expect(response.body.matchedEvent).toBeDefined();
    });

    it('should return no match if no volunteers have the required skills', async () => {
        const response = await request(app)
            .post('/api/match')
            .send({
                volunteers: [
                    { name: "Alice", skills: ["General"] },
                    { name: "Bob", skills: ["General"] },
                ],
                events: [
                    { name: "Cardiology Department", requiredSkills: ["Cardiology"] },
                ],
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.volunteerName).toBe("No match found");
        expect(response.body.matchedEvent).toBe("");
    });

    it('should return validation errors for incorrect data format', async () => {
        const response = await request(app)
            .post('/api/match')
            .send({
                volunteers: "Not an array",
                events: "Not an array",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors).toHaveLength(2); // Assuming 2 errors for invalid formats
    });
});
