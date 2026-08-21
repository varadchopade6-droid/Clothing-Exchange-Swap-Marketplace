import mongoose from 'mongoose';

const clothingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    type: { type: String, required: true, trim: true, maxlength: 60, index: true },
    brand: { type: String, required: true, trim: true, maxlength: 60 },
    size: { type: String, required: true, trim: true, maxlength: 30 },
    condition: { type: String, required: true, enum: ['new with tags', 'like new', 'good', 'fair'] },
    estimatedSwapValue: { type: Number, required: true, min: 1, max: 100000 },
    location: { type: String, required: true, trim: true, maxlength: 100, index: true },
    images: [{ type: String, trim: true }],
    status: { type: String, enum: ['available', 'pending', 'swapped', 'removed'], default: 'available', index: true }
  },
  { timestamps: true }
);

export default mongoose.model('Clothing', clothingSchema);
