import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, max: 1000 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  orderInfo: { name: { type: String, required: true, trim: true, maxlength: 120 }, contact: { type: String, required: true, trim: true, maxlength: 120 }, address: { type: String, required: true, trim: true, maxlength: 500 }, notes: { type: String, trim: true, maxlength: 1000 } },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending', index: true }
}, { timestamps: true });
export default mongoose.model('Order', orderSchema);
