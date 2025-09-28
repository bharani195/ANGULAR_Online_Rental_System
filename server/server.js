const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from Angular app
app.use(express.static(path.join(__dirname, '../client/dist/client')));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rental-system';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/bookings', require('./routes/bookings'));

// Catch all handler: send back Angular's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/client/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});