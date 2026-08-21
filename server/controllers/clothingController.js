import Clothing from '../models/Clothing.js';

const fields = ['title', 'type', 'brand', 'size', 'condition', 'estimatedSwapValue', 'location', 'images'];

export async function listClothing(req, res, next) {
  try {
    const query = { status: 'available' };
    if (req.query.location) query.location = new RegExp(`^${req.query.location}`, 'i');
    if (req.query.type) query.type = new RegExp(`^${req.query.type}`, 'i');
    const listings = await Clothing.find(query).populate('owner', 'name location').sort({ createdAt: -1 }).limit(100);
    res.json(listings);
  } catch (error) { next(error); }
}

export async function createClothing(req, res, next) {
  try {
    const data = Object.fromEntries(fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    if (!data.title || !data.type || !data.brand || !data.size || !data.condition || !data.estimatedSwapValue) {
      return res.status(400).json({ message: 'Title, type, brand, size, condition, and estimated swap value are required.' });
    }
    data.location = data.location || req.user.location;
    const listing = await Clothing.create({ ...data, owner: req.user.id });
    res.status(201).json(listing);
  } catch (error) { next(error); }
}
