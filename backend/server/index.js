const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const contactRoutes = require('./routes/contact');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api/contact', contactRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});