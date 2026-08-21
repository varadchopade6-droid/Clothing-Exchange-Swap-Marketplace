import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export default function ListingsPage() {
  const [listings, setListings] = useState([]); const [error, setError] = useState('');
  useEffect(() => { api('/clothing').then(setListings).catch((err) => setError(err.message)); }, []);
  return <><section className="hero"><p className="eyebrow">A kinder wardrobe</p><h1>Give great clothes their next chapter.</h1><p>Discover thoughtfully listed pieces nearby and swap what you no longer wear.</p></section><section><div className="section-heading"><div><p className="eyebrow">Fresh listings</p><h2>Available to swap</h2></div></div>{error && <p className="error">{error}</p>}{!error && listings.length === 0 && <div className="empty">No listings yet. Be the first member to add a piece from your wardrobe.</div>}<div className="grid">{listings.map((item) => <article className="listing" key={item._id}><div className="photo">{item.images?.[0] ? <img src={item.images[0]} alt={item.title} /> : <span>{item.type}</span>}</div><div className="listing-content"><div><h3>{item.title}</h3><p>{item.brand} · {item.size}</p></div><strong>₹{item.estimatedSwapValue.toLocaleString('en-IN')}</strong><footer>{item.condition} · {item.location}</footer></div></article>)}</div></section></>;
}
