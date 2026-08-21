import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage({ mode }) {
  const login = mode === 'login'; const [form, setForm] = useState({ name: '', email: '', password: '', location: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const { signIn } = useAuth(); const navigate = useNavigate();
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) { event.preventDefault(); setError(''); setBusy(true); try { const payload = await api(`/auth/${login ? 'login' : 'register'}`, { method: 'POST', body: JSON.stringify(form) }); signIn(payload); navigate('/dashboard'); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <section className="auth-card"><p className="eyebrow">{login ? 'Welcome back' : 'Swap better, wear longer'}</p><h1>{login ? 'Log in to ReWear' : 'Create your account'}</h1><form onSubmit={submit}>{!login && <><label>Name<input required minLength="2" name="name" value={form.name} onChange={update} /></label><label>City / location<input required name="location" value={form.location} onChange={update} placeholder="e.g. Pune" /></label></>}<label>Email<input required type="email" name="email" value={form.email} onChange={update} /></label><label>Password<input required minLength="8" type="password" name="password" value={form.password} onChange={update} /></label>{error && <p className="error">{error}</p>}<button disabled={busy}>{busy ? 'Please wait…' : login ? 'Log in' : 'Create account'}</button></form><p>{login ? 'New to ReWear?' : 'Already a member?'} <Link to={login ? '/register' : '/login'}>{login ? 'Create an account' : 'Log in'}</Link></p></section>;
}
