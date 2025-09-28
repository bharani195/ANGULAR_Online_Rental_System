const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['bike', 'car', 'book', 'room']
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  features: [{
    type: String
  }],
  availability: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specifications: {
    // For vehicles
    make: String,
    model: String,
    year: Number,
    color: String,
    fuelType: String,
    transmission: String,
    
    // For books
    author: String,
    isbn: String,
    publisher: String,
    publicationYear: Number,
    
    // For rooms
    bedrooms: Number,
    bathrooms: Number,
    area: Number,
    furnishing: String,
    amenities: [String]
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for search functionality
itemSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Item', itemSchema);