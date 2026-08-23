import mongoose from 'mongoose';
const complaintSchema = new mongoose.Schema({
  openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' },
  reason: { type: String, required: true, trim: true, maxlength: 1500 }, status: { type: String, enum: ['open', 'reviewing', 'resolved'], default: 'open', index: true }, resolution: { type: String, trim: true, maxlength: 1500 }
}, { timestamps: true });
export default mongoose.model('Complaint', complaintSchema);
