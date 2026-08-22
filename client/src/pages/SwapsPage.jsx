import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function SwapsPage() {
  const { user } = useAuth(); const [swaps, setSwaps] = useState([]); const [error, setError] = useState('');
  const load = () => api('/swaps').then(setSwaps).catch((err) => setError(err.message)); useEffect(() => { load(); }, []);
  async function action(id, action) { try { await api(`/swaps/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) }); load(); } catch (err) { setError(err.message); } }
  return <section className="requests"><p className="eyebrow">Exchange activity</p><h1>Swap requests</h1>{error && <p className="error">{error}</p>}{swaps.length === 0 && <div className="empty">No swap requests yet.</div>}{swaps.map((swap) => { const incoming = swap.recipient._id === user.id; return <article className="request" key={swap._id}><div><p className="eyebrow">{incoming ? 'Incoming' : 'Outgoing'} · {swap.status}</p><h2>{swap.offeredItem.title} <span>for</span> {swap.requestedItem.title}</h2><p>{incoming ? `${swap.requester.name} is offering` : `You offered`} <b>{swap.offeredItem.title}</b> for <b>{swap.requestedItem.title}</b>.</p>{swap.initialMessage && <p className="request-message">“{swap.initialMessage}”</p>}</div><div className="actions">{swap.status === 'pending' && incoming && <><button onClick={() => action(swap._id, 'accept')}>Accept</button><button className="secondary" onClick={() => action(swap._id, 'reject')}>Reject</button></>}{swap.status === 'pending' && !incoming && <button className="secondary" onClick={() => action(swap._id, 'cancel')}>Cancel</button>}{swap.status === 'accepted' && <button onClick={() => action(swap._id, 'complete')}>Mark completed</button>}</div></article>; })}</section>;
}
