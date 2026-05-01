import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <h1 className={styles.logo}>📝 CollabDocs</h1>
        <div className={styles.navRight}>
          <span className={styles.welcome}>Hello, {user?.name}!</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h2>My Documents</h2>
          <button className={styles.newDocBtn}>+ New Document</button>
        </div>

        <div className={styles.emptyState}>
          <p>📄</p>
          <p>No documents yet</p>
          <p>Click "New Document" to get started!</p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;