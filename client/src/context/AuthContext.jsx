import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, signup as apiSignup, logout as apiLogout } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if we have a saved token and validate it
  useEffect(() => {
    const token = localStorage.getItem('campus_flow_token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(user => {
        setCurrentUser(user);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('campus_flow_token');
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const { token, user } = await apiLogin({ email, password });
    localStorage.setItem('campus_flow_token', token);
    setCurrentUser(user);
    return user;
  };

  const signup = async (data) => {
    const { token, user } = await apiSignup(data);
    localStorage.setItem('campus_flow_token', token);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    try { await apiLogout(); } catch {}
    localStorage.removeItem('campus_flow_token');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
