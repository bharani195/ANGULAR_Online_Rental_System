import Booking from '../models/Booking.js';
import Item from '../models/Item.js';
import { getIO } from '../socket.js';

export const createBooking = async (req, res) => {
  try {
    console.log('Attempting to create booking...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Authenticated user:', JSON.stringify(req.user, null, 2));
    
    const { user, item, startDate, endDate, quantity, totalAmount } = req.body;
    
    // Validate required fields
    if (!user || !item || !startDate || !endDate || !quantity || !totalAmount) {
      console.error('Missing required fields:', {
        hasUser: !!user,
        hasItem: !!item,
        hasStartDate: !!startDate,
        hasEndDate: !!endDate,
        hasQuantity: !!quantity,
        hasTotalAmount: !!totalAmount
      });
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Verify user ID matches authenticated user
    if (!req.user || !req.user._id) {
      console.error('No authenticated user found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (user !== req.user._id.toString()) {
      console.error('User ID mismatch:', {
        providedUserId: user,
        authenticatedUserId: req.user._id.toString()
      });
      return res.status(403).json({ message: 'Unauthorized: User ID mismatch' });
    }

    const existingItem = await Item.findById(item);
    if (!existingItem) {
      console.error('Item not found:', item);
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if item is available
    if (!existingItem.available) {
      return res.status(400).json({ message: 'Item is not available' });
    }

    console.log('Creating new booking document...');
    const newBooking = new Booking({
      user,
      item,
      startDate,
      endDate,
      quantity,
      totalAmount,
      status: 'confirmed'
    });

    console.log('Booking document created:', newBooking);
    
    try {
      await newBooking.validate();
      console.log('Booking validation passed');
    } catch (validationError) {
      console.error('Booking validation failed:', validationError);
      return res.status(400).json({ 
        message: 'Invalid booking data', 
        errors: validationError.errors 
      });
    }

    console.log('Saving booking to database...');
    await newBooking.save();
    console.log('Booking saved successfully with ID:', newBooking._id);

    // Update item availability
    console.log('Updating item availability...');
    existingItem.available = false;
    await existingItem.save();
    console.log('Item availability updated');

    // emit socket event
    try { getIO().emit('bookingCreated', newBooking); } catch(e) { /* no-op */ }

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    console.log('Fetching bookings for userId:', req.params.userId);
    console.log('Authenticated user:', req.user);

    // Verify user ID matches authenticated user or user is admin
    if (!req.user || !req.user._id) {
      console.error('No authenticated user found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.params.userId !== req.user._id.toString() && !req.user.isAdmin) {
      console.error('User ID mismatch:', {
        requestedUser: req.params.userId,
        authenticatedUser: req.user._id,
        isAdmin: req.user.isAdmin
      });
      return res.status(403).json({ message: 'Unauthorized: Cannot view other users bookings' });
    }

    // Add more detailed logging
    console.log('Executing booking query with criteria:', { user: req.params.userId });
    
    const bookings = await Booking.find({ user: req.params.userId })
      .populate('item')
      .sort({ createdAt: -1 });

    if (bookings.length === 0) {
      console.log('No bookings found. Verifying user exists in bookings collection...');
      const allBookings = await Booking.find({});
      console.log('Total bookings in system:', allBookings.length);
      console.log('Available user IDs in bookings:', allBookings.map(b => b.user));
    }

    console.log(`Found ${bookings.length} bookings for user:`, req.params.userId);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: fetch bookings with pagination and optional status/search filters
export const getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const status = req.query.status; // Pending/Confirmed/Cancelled
    const search = req.query.search ? req.query.search.toString().toLowerCase() : null;

    const filter = {};
    if (status && status !== 'All') filter.status = new RegExp('^' + status + '$', 'i');
    if (search) {
      filter.$or = [
        { 'item.name': { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    // populate item and user for search/display
    const query = Booking.find(filter).populate('item user');
    const total = await Booking.countDocuments(filter);
    const bookings = await query.sort({ createdAt: -1 }).skip(skip).limit(limit).exec();

    res.json({ data: bookings, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'cancelled';
    await booking.save();

    // Make associated item available again
    const item = await Item.findById(booking.item);
    if (item) {
      item.available = true;
      await item.save();
    }

    // emit update
    try { getIO().emit('bookingUpdated', booking); } catch(e) { /* no-op */ }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('item user');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'confirmed';
    await booking.save();

    try { getIO().emit('bookingUpdated', booking); } catch(e) { /* no-op */ }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
