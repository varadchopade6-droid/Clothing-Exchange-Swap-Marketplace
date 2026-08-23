import Clothing from '../models/Clothing.js';
import { calculateValue, compareValues } from '../services/valuation.js';

const fields = ['title', 'type', 'brand', 'size', 'condition', 'estimatedSwapValue', 'location', 'images'];

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function isOwner(listing, user) { return listing.owner.toString() === user.id; }

export async function listClothing(req, res, next) {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    else query.status = 'available';
    for (const field of ['location', 'type', 'size', 'condition', 'brand']) if (req.query[field]) query[field] = new RegExp(escapeRegex(req.query[field]), 'i');
    if (req.query.search) { const expression = new RegExp(escapeRegex(req.query.search), 'i'); query.$or = [{ title: expression }, { brand: expression }, { type: expression }]; }
    const listings = await Clothing.find(query).populate('owner', 'name location').sort({ createdAt: -1 }).limit(100);
    res.json(listings);
  } catch (error) { next(error); }
}

export async function getClothing(req, res, next) {
  try {
    const listing = await Clothing.findById(req.params.id).populate('owner', 'name location');
    if (!listing || listing.status === 'removed') return res.status(404).json({ message: 'Listing not found.' });
    res.json(listing);
  } catch (error) { next(error); }
}

export async function calculateListingValue(req, res, next) { try { res.json(calculateValue(req.body)); } catch (error) { error.status = 400; next(error); } }
export async function suggestions(req, res, next) {
  try {
    const source = await Clothing.findById(req.params.id);
    if (!source || source.status !== 'available') return res.status(404).json({ message: 'Available listing not found.' });
    const listings = await Clothing.find({ _id: { $ne: source.id }, status: 'available', owner: { $ne: source.owner } }).populate('owner', 'name location').limit(100);
    const matches = listings.map((listing) => { const value = compareValues(source.estimatedSwapValue, listing.estimatedSwapValue); const sameLocation = listing.location.toLowerCase() === source.location.toLowerCase(); const categoryMatch = listing.type.toLowerCase() === source.type.toLowerCase(); return { listing, score: (value.balance === 'close match' ? 3 : 0) + (sameLocation ? 2 : 0) + (categoryMatch ? 1 : 0), sameLocation, categoryMatch, comparison: value }; }).filter((entry) => entry.score >= 2).sort((a, b) => b.score - a.score).slice(0, 6);
    res.json(matches);
  } catch (error) { next(error); }
}

export async function myClothing(req, res, next) {
  try { res.json(await Clothing.find({ owner: req.user.id }).sort({ createdAt: -1 })); } catch (error) { next(error); }
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

export async function updateClothing(req, res, next) {
  try {
    const listing = await Clothing.findById(req.params.id);
    if (!listing || listing.status === 'removed') return res.status(404).json({ message: 'Listing not found.' });
    if (!isOwner(listing, req.user)) return res.status(403).json({ message: 'You can only update your own listings.' });
    for (const field of fields) if (req.body[field] !== undefined) listing[field] = req.body[field];
    if (req.body.status !== undefined && ['available', 'removed'].includes(req.body.status)) listing.status = req.body.status;
    await listing.save();
    res.json(listing);
  } catch (error) { next(error); }
}

export async function removeClothing(req, res, next) {
  try {
    const listing = await Clothing.findById(req.params.id);
    if (!listing || listing.status === 'removed') return res.status(404).json({ message: 'Listing not found.' });
    if (!isOwner(listing, req.user)) return res.status(403).json({ message: 'You can only remove your own listings.' });
    listing.status = 'removed'; await listing.save();
    res.status(204).end();
  } catch (error) { next(error); }
}
