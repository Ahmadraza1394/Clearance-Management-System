const express = require('express');
const router = express.Router();
const { processQuery } = require('../controllers/chatbotController');

// Process a chatbot query
router.post('/query', processQuery);

module.exports = router;
