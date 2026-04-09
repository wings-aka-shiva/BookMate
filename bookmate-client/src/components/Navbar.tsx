import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.brand}>BookMate</Link>

        <div style={styles.links}>
          <Link to="/books" style={styles.link}>Books</Link>
          <Link to="/listings" style={styles.link}>Listings</Link>
          {user && (
            <Link to={`/profile/${user.userId}`} style={styles.link}>
              {user.displayName}
            </Link>
          )}
        </div>

        <div style={styles.actions}>
          {user ? (
            <>
              <Link to="/listings/create" style={styles.createBtn}>+ New Listing</Link>
              <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.createBtn}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav:       { background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 },
  inner:     { maxWidth: 960, margin: '0 auto', padding: '0 1rem', height: 56, display: 'flex', alignItems: 'center', gap: '1.5rem' },
  brand:     { fontWeight: 800, fontSize: '1.1rem', color: '#6366f1', textDecoration: 'none', marginRight: 'auto' },
  links:     { display: 'flex', gap: '1.25rem' },
  link:      { color: '#374151', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 },
  actions:   { display: 'flex', gap: '0.75rem', alignItems: 'center', marginLeft: 'auto' },
  createBtn: { background: '#6366f1', color: '#fff', borderRadius: 8, padding: '0.4rem 0.9rem', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' },
  logoutBtn: { background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.4rem 0.9rem', fontSize: '0.85rem', cursor: 'pointer', color: '#374151' },
};
