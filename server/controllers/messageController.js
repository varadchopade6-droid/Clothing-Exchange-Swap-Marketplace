import Message from '../models/Message.js';
import SwapRequest from '../models/SwapRequest.js';

async function participantSwap(id, userId) {
  const swap = await SwapRequest.findById(id).populate('offeredItem requestedItem', 'title');
  if (!swap) return null;
  if (swap.requester.toString() !== userId && swap.recipient.toString() !== userId) return false;
  return swap;
}
export async function conversations(req, res, next) {
  try { const swaps = await SwapRequest.find({ $or: [{ requester: req.user.id }, { recipient: req.user.id }] }).populate('requester recipient', 'name').populate('offeredItem requestedItem', 'title').sort({ updatedAt: -1 }); res.json(swaps); } catch (error) { next(error); }
}
export async function messages(req, res, next) {
  try { const swap = await participantSwap(req.params.swapId, req.user.id); if (swap === false) return res.status(403).json({ message: 'You are not a participant in this conversation.' }); if (swap === null) return res.status(404).json({ message: 'Conversation not found.' }); res.json(await Message.find({ swap: swap.id }).populate('sender', 'name').sort({ createdAt: 1 })); } catch (error) { next(error); }
}
export async function sendMessage(req, res, next) {
  try { const swap = await participantSwap(req.params.swapId, req.user.id); if (swap === false) return res.status(403).json({ message: 'You are not a participant in this conversation.' }); if (swap === null) return res.status(404).json({ message: 'Conversation not found.' }); if (!req.body.text?.trim()) return res.status(400).json({ message: 'Message text cannot be empty.' }); const message = await Message.create({ swap: swap.id, sender: req.user.id, text: req.body.text }); res.status(201).json(await message.populate('sender', 'name')); } catch (error) { next(error); }
}
