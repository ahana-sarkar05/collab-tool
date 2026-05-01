import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axios.get('/documents');
        setDocuments(res.data);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleNewDocument = async () => {
    try {
      const res = await axios.post('/documents', {
        title: 'Untitled Document',
      });
      navigate(`/editor/${res.data._id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleDeleteDocument = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document?')) return;
    try {
      await axios.delete(`/documents/${id}`);
      setDocuments(documents.filter((doc) => doc._id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
          <button onClick={handleNewDocument} className={styles.newDocBtn}>
            + New Document
          </button>
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            <p>Loading...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className={styles.emptyState}>
            <p>📄</p>
            <p>No documents yet</p>
            <p>Click "New Document" to get started!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {documents.map((doc) => (
              <div
                key={doc._id}
                className={styles.docCard}
                onClick={() => navigate(`/editor/${doc._id}`)}
              >
                <div className={styles.docIcon}>📄</div>
                <div className={styles.docInfo}>
                  <h3>{doc.title}</h3>
                  <p>Edited {formatDate(doc.updatedAt)}</p>
                </div>
                <button
                  onClick={(e) => handleDeleteDocument(e, doc._id)}
                  className={styles.deleteBtn}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;