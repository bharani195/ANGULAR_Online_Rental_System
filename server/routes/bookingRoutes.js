import express from 'express';
import { createBooking, getUserBookings, cancelBooking, confirmBooking, getAllBookings } from '../controllers/bookingController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
// admin: get all bookings (paginated)
router.get('/', protect, isAdmin, getAllBookings);
router.get('/:userId', protect, getUserBookings);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/confirm', protect, confirmBooking);

export default router;
