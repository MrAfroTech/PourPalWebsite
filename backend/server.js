// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware - allow ALL origins for now to fix the immediate issue
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '10mb'}));

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