import Clothing from '../models/Clothing.js';
import SwapRequest from '../models/SwapRequest.js';
import { compareValues } from '../services/valuation.js';

const populate = [{ path: 'requester', select: 'name location' }, { path: 'recipient', select: 'name location' }, { path: 'offeredItem', select: 'title brand size type condition estimatedSwapValue images status' }, { path: 'requestedItem', select: 'title brand size type condition estimatedSwapValue images status' }];
const populated = (query) => query.populate(populate);

export async function createSwap(req, res, next) {
  try {
    const { offeredItem, requestedItem, initialMessage = '' } = req.body;
    if (!offeredItem || !requestedItem) return res.status(400).json({ message: 'Choose an offered item and requested item.' });
    if (offeredItem === requestedItem) return res.status(400).json({ message: 'You cannot swap an item for itself.' });
    const [offered, requested] = await Promise.all([Clothing.findById(offeredItem), Clothing.findById(requestedItem)]);
    if (!offered || !requested || offered.status === 'removed' || requested.status !== 'available') return res.status(400).json({ message: 'One or both selected listings are unavailable.' });
    if (offered.owner.toString() !== req.user.id) return res.status(403).json({ message: 'You may only offer your own listing.' });
    if (requested.owner.toString() === req.user.id) return res.status(400).json({ message: 'Choose another member’s item to request.' });
    const duplicate = await SwapRequest.exists({ requester: req.user.id, offeredItem, requestedItem, status: 'pending' });
    if (duplicate) return res.status(409).json({ message: 'This swap request is already pending.' });
    const swap = await SwapRequest.create({ requester: req.user.id, recipient: requested.owner, offeredItem, requestedItem, initialMessage });
    const result = await populated(SwapRequest.findById(swap.id));
    res.status(201).json({ ...result.toObject(), valueComparison: compareValues(offered.estimatedSwapValue, requested.estimatedSwapValue) });
  } catch (error) { next(error); }
}

export async function listSwaps(req, res, next) {
  try {
    const query = req.query.direction === 'incoming' ? { recipient: req.user.id } : req.query.direction === 'outgoing' ? { requester: req.user.id } : { $or: [{ requester: req.user.id }, { recipient: req.user.id }] };
    if (req.query.status) query.status = req.query.status;
    res.json(await populated(SwapRequest.find(query).sort({ createdAt: -1 })));
  } catch (error) { next(error); }
}

export async function transitionSwap(req, res, next) {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found.' });
    const action = req.body.action;
    const participant = swap.requester.toString() === req.user.id || swap.recipient.toString() === req.user.id;
    const can = { accept: swap.recipient.toString() === req.user.id && swap.status === 'pending', reject: swap.recipient.toString() === req.user.id && swap.status === 'pending', cancel: swap.requester.toString() === req.user.id && swap.status === 'pending', agree: participant && swap.status === 'accepted', start: participant && swap.status === 'agreed', complete: participant && ['accepted', 'agreed', 'in_progress'].includes(swap.status) };
    if (!can[action]) return res.status(400).json({ message: 'This status transition is not allowed.' });
    if (action === 'accept') {
      const items = await Clothing.find({ _id: { $in: [swap.offeredItem, swap.requestedItem] } });
      if (items.length !== 2 || items.some((item) => item.status !== 'available')) return res.status(409).json({ message: 'One or both items are no longer available.' });
    }
    if (action === 'agree') {
      if (!swap.agreementConfirmedBy.some((id) => id.toString() === req.user.id)) swap.agreementConfirmedBy.push(req.user.id);
      if (swap.agreementConfirmedBy.length < 2) { await swap.save(); return res.json(await populated(SwapRequest.findById(swap.id))); }
    }
    swap.status = { accept: 'accepted', reject: 'rejected', cancel: 'cancelled', agree: 'agreed', start: 'in_progress', complete: 'completed' }[action];
    await swap.save();
    if (action === 'accept') await Clothing.updateMany({ _id: { $in: [swap.offeredItem, swap.requestedItem] } }, { status: 'pending' });
    if (action === 'complete') await Clothing.updateMany({ _id: { $in: [swap.offeredItem, swap.requestedItem] } }, { status: 'swapped' });
    res.json(await populated(SwapRequest.findById(swap.id)));
  } catch (error) { next(error); }
}
