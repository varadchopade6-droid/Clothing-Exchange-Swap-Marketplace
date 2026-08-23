import { useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
export default function ProfilePage() {
  const { user, signIn } = useAuth(); const [form, setForm] = useState({ name: user.name, location: user.location, contact: user.contact || '' }); const [notice, setNotice] = useState(''); const [error, setError] = useState('');
  async function save(event) { event.preventDefault(); try { const updated = await api('/users/me', { method: 'PATCH', body: JSON.stringify(form) }); signIn({ token: localStorage.getItem('rewear_token'), user: updated }); setNotice('Profile saved.'); } catch (err) { setError(err.message); } }
  return <section className="profile"><p className="eyebrow">Account</p><h1>Your profile</h1><form className="listing-form" onSubmit={save}><label>Name<input required minLength="2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email<input disabled value={user.email} /></label><label>City / location<input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label><label>Contact (shared only once you agree to a swap)<input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} /></label>{notice && <p className="success">{notice}</p>}{error && <p className="error">{error}</p>}<button>Save profile</button></form></section>;
}
