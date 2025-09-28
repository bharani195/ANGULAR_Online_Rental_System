import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['bike','car','book','room'], required: true },
  image: { type: String },
  description: { type: String },
  pricePerDay: { type: Number, required: true },
  available: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);
