import mongoose from 'mongoose';
const serviceRequestSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  quotedPrice: { type: Number, min: 0 },
  details: { type: String, required: true, trim: true, maxlength: 2000 },
  requestedFor: { type: Date },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'], default: 'pending', index: true }
}, { timestamps: true });
export default mongoose.model('ServiceRequest', serviceRequestSchema);
