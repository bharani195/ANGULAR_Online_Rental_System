const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Item = require('../models/Item');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all bookings for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { renter: req.user._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('item', 'title category pricePerDay images location')
      .populate('renter', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('item', 'title category pricePerDay images location owner')
      .populate('renter', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the renter or the item owner
    if (booking.renter._id.toString() !== req.user._id.toString() && 
        booking.item.owner.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new booking
router.post('/', auth, [
  body('item').notEmpty().withMessage('Item ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { item: itemId, startDate, endDate, notes } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Check if item exists and is available
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (!item.availability) {
      return res.status(400).json({ message: 'Item is not available' });
    }

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      item: itemId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: 'Item is already booked for selected dates' });
    }

    // Calculate total amount
    const timeDiff = end.getTime() - start.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalAmount = totalDays * item.pricePerDay;

    // Create booking
    const booking = new Booking({
      item: itemId,
      renter: req.user._id,
      startDate: start,
      endDate: end,
      totalDays,
      totalAmount,
      notes
    });

    await booking.save();

    await booking.populate('item', 'title category pricePerDay images location');
    await booking.populate('renter', 'name email');

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (item owner or admin only)
router.put('/:id/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id).populate('item');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is item owner or admin
    if (booking.item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    booking.status = req.body.status;
    await booking.save();

    await booking.populate('renter', 'name email');

    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking (renter only)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the renter
    if (booking.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow cancellation for pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    await booking.populate('item', 'title category');
    await booking.populate('renter', 'name email');

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add rating and review
router.put('/:id/review', auth, [
  body('score').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the renter
    if (booking.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow rating for completed bookings
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed bookings' });
    }

    booking.rating = {
      score: req.body.score,
      review: req.body.review,
      date: new Date()
    };

    await booking.save();

    // Update item rating
    const item = await Item.findById(booking.item);
    const bookingsWithRatings = await Booking.find({
      item: booking.item,
      'rating.score': { $exists: true }
    });

    const totalRating = bookingsWithRatings.reduce((sum, b) => sum + b.rating.score, 0);
    const avgRating = totalRating / bookingsWithRatings.length;

    item.rating.average = Math.round(avgRating * 10) / 10;
    item.rating.count = bookingsWithRatings.length;
    await item.save();

    res.json({
      message: 'Review added successfully',
      booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bookings for items owned by user
router.get('/owner/items', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // First, get all items owned by the user
    const userItems = await Item.find({ owner: req.user._id }, '_id');
    const itemIds = userItems.map(item => item._id);

    const filter = { item: { $in: itemIds } };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('item', 'title category pricePerDay images location')
      .populate('renter', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;