const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: Date
  }
}, {
  timestamps: true
});

// Calculate total days and amount before saving
bookingSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    this.totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  next();
});

// Prevent overlapping bookings
bookingSchema.index({ 
  item: 1, 
  startDate: 1, 
  endDate: 1 
}, { 
  unique: true,
  partialFilterExpression: { 
    status: { $in: ['confirmed', 'active'] } 
  }
});

module.exports = mongoose.model('Booking', bookingSchema);