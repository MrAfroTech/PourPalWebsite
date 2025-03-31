// routes/reports.js
const express = require('express');
const router = express.Router();
const { sendEmailReport, sendSmsReport } = require('../controllers/reportController');

// Route to handle sending reports via email
router.post('/send-email', sendEmailReport);

// Route to handle sending reports via SMS
router.post('/send-sms', sendSmsReport);

module.exports = router;