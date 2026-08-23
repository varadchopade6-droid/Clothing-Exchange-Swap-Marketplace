import mongoose from 'mongoose';
const categorySchema = new mongoose.Schema({ name: { type: String, required: true, trim: true, unique: true, maxlength: 80 }, kind: { type: String, enum: ['product', 'service', 'skill'], required: true } }, { timestamps: true });
export default mongoose.model('Category', categorySchema);
