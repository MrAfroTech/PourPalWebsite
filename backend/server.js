// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'https://www.ezdrink.us'],

    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Optional: needed if you’re using cookies or auth headers
  }));

app.use(bodyParser.json());

// Routes
app.use('/api', emailRoutes);

// Basic health check endpoint
app.get('/', (req, res) => {
  res.send('EzDrink Email API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});