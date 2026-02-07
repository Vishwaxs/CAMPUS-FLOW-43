import { createContext, useContext, useState, useEffect } from 'react';
import { getUsers } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers().then(data => {
      setUsers(data);
      // Restore saved user or default to first student
      const savedId = localStorage.getItem('campus_flow_user_id');
      const saved = data.find(u => u.id === savedId);
      const defaultUser = saved || data.find(u => u.role === 'student') || data[0];
      if (defaultUser) {
        setCurrentUser(defaultUser);
        localStorage.setItem('campus_flow_user_id', defaultUser.id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const switchUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('campus_flow_user_id', user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ users, currentUser, switchUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
