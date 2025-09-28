import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  quantity: { type: Number, required: true, default: 1 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending','confirmed','cancelled'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
