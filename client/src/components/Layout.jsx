import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout({ children }) {
  const { user, signOut } = useAuth(); const navigate = useNavigate();
  function logout() { signOut(); navigate('/login'); }
  return <><header><Link className="brand" to="/">ReWear</Link><nav><NavLink to="/">Listings</NavLink>{user && <NavLink to="/dashboard">Dashboard</NavLink>}{user ? <button className="link-button" onClick={logout}>Log out</button> : <><NavLink to="/login">Log in</NavLink><NavLink className="button small" to="/register">Join ReWear</NavLink></>}</nav></header><main>{children}</main></>;
}
