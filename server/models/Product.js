import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 2000 },
  category: { type: String, required: true, trim: true, maxlength: 80, index: true },
  price: { type: Number, required: true, min: 1, max: 10000000 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String, trim: true }],
  active: { type: Boolean, default: true, index: true }
}, { timestamps: true });
export default mongoose.model('Product', productSchema);
