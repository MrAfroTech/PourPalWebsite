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
    // Allow requests from any Vercel deployment of your project and your custom domain
    origin: [
      /.*-maurice-sanders-projects\.vercel\.app$/,  // This matches any Vercel preview URL
      'https://yourdomain.com',                     // Your production domain
      'http://localhost:3000'                       // Local development
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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