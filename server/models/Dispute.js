import mongoose from 'mongoose';
const disputeSchema = new mongoose.Schema({
  swap: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true, unique: true },
  openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  reason: { type: String, required: true, trim: true, maxlength: 1000 },
  status: { type: String, enum: ['open', 'reviewing', 'resolved'], default: 'open' },
  resolution: { type: String, trim: true, maxlength: 1000 }
}, { timestamps: true });
export default mongoose.model('Dispute', disputeSchema);
