import mongoose from 'mongoose';
const serviceSchema = new mongoose.Schema({
  entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: { type: String, required: true, trim: true, maxlength: 80, index: true },
  price: { type: Number, min: 0, max: 10000000 },
  active: { type: Boolean, default: true, index: true }
}, { timestamps: true });
export default mongoose.model('Service', serviceSchema);
