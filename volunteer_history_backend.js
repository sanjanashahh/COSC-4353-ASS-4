// volunteer_history.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
require('dotenv').config();



// Define a Mongoose schema for volunteer history
const volunteerHistorySchema = new mongoose.Schema({
    eventName: String,
    eventDate: String,
    location: String,
    department: String,
    skill: String,
    status: String
});

// Model for volunteer history
const VolunteerHistory = mongoose.model('VolunteerHistory', volunteerHistorySchema);

// Get volunteer history
router.get('/volunteer-history', async (req, res) => {
    try {
        const history = await VolunteerHistory.find();
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching volunteer history', error });
    }
});

// Add new volunteer history
router.post('/triggerVolunteerHistory', async (req, res) => {
    try {
        const newVolunteerHistory = new VolunteerHistory(req.body);
        await newVolunteerHistory.save();
        res.json(newVolunteerHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error adding volunteer history', error });
    }
});

module.exports = router;
