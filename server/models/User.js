import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
    password: { type: String, required: true, minlength: 8, select: false },
    contact: { type: String, trim: true, maxlength: 120 },
    location: { type: String, required: true, trim: true, maxlength: 100 },
    // `user` is retained for accounts created in earlier stages; new marketplace
    // accounts use the clearer customer/entrepreneur roles.
    role: { type: String, enum: ['user', 'customer', 'entrepreneur', 'admin'], default: 'customer' },
    entrepreneurApproved: { type: Boolean, default: false, index: true },
    available: { type: Boolean, default: true },
    skills: [{ type: String, trim: true, maxlength: 80 }],
    bio: { type: String, trim: true, maxlength: 1200 }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchesPassword = function matchesPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
