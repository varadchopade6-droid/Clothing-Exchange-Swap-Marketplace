import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('rewear_user') || 'null'));
  function signIn(payload) { localStorage.setItem('rewear_token', payload.token); localStorage.setItem('rewear_user', JSON.stringify(payload.user)); setUser(payload.user); }
  function signOut() { localStorage.removeItem('rewear_token'); localStorage.removeItem('rewear_user'); setUser(null); }
  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
