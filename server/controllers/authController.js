import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function tokenFor(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
function response(user) {
  return { token: tokenFor(user), user: { id: user.id, name: user.name, email: user.email, location: user.location, role: user.role, entrepreneurApproved: user.entrepreneurApproved, available: user.available } };
}

export async function register(req, res, next) {
  try {
    const { name, email, password, location, contact, role = 'customer', skills = [], bio = '' } = req.body;
    if (!name || !email || !password || !location) return res.status(400).json({ message: 'Name, email, password, and location are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'An account with that email already exists.' });
    if (!['customer', 'entrepreneur'].includes(role)) return res.status(400).json({ message: 'Choose a valid account role.' });
    if (!Array.isArray(skills) || skills.some((skill) => typeof skill !== 'string')) return res.status(400).json({ message: 'Skills must be a list of names.' });
    const user = await User.create({ name, email, password, location, contact, role, skills, bio, entrepreneurApproved: role !== 'entrepreneur' });
    res.status(201).json(response(user));
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
    if (!user || !(await user.matchesPassword(password || ''))) return res.status(401).json({ message: 'Invalid email or password.' });
    res.json(response(user));
  } catch (error) { next(error); }
}
