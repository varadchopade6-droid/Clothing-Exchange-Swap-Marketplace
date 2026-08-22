import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  offeredItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Clothing', required: true },
  requestedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Clothing', required: true },
  initialMessage: { type: String, trim: true, maxlength: 500 },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'], default: 'pending', index: true }
}, { timestamps: true });

swapRequestSchema.index({ requester: 1, requestedItem: 1, status: 1 });
export default mongoose.model('SwapRequest', swapRequestSchema);
