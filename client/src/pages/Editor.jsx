import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from '../api/axios';
import styles from './Editor.module.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [docLoaded, setDocLoaded] = useState(false);
  const [title, setTitle] = useState('Untitled Document');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const titleRef = useRef('Untitled Document');
  const saveTimerRef = useRef(null);
  const initialContentRef = useRef('');

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  // Step 1: fetch document data
  useEffect(() => {
    const loadDoc = async () => {
      try {
        const res = await axios.get(`/documents/${id}`);
        const { content, title: docTitle } = res.data;
        setTitle(docTitle || 'Untitled Document');
        titleRef.current = docTitle || 'Untitled Document';
        initialContentRef.current = content || '';
        setDocLoaded(true);
      } catch (err) {
        console.error('Failed to load:', err);
        navigate('/dashboard');
      }
    };
    loadDoc();
  }, [id]);

  // Step 2: set content AFTER editor div is rendered
  useEffect(() => {
    if (docLoaded && editorRef.current) {
      editorRef.current.innerHTML = initialContentRef.current;
    }
  }, [docLoaded]);

  // Step 3: connect socket after doc loaded
  useEffect(() => {
    if (!docLoaded) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join-document', id);

    socket.on('receive-changes', (content) => {
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
    });

    socket.on('receive-title', (newTitle) => {
      setTitle(newTitle);
      titleRef.current = newTitle;
    });

    return () => socket.disconnect();
  }, [docLoaded, id]);

  // Save function
  const saveDocument = useCallback(async () => {
    const content = editorRef.current?.innerHTML || '';
    const currentTitle = titleRef.current;
    try {
      setSaving(true);
      await axios.patch(`/documents/${id}`, { content, title: currentTitle });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaving(false);
    }
  }, [id]);

  // Handle typing
  const handleInput = useCallback(() => {
    const content = editorRef.current?.innerHTML || '';
    socketRef.current?.emit('send-changes', { documentId: id, content });

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveDocument, 3000);
  }, [id, saveDocument]);

  // Handle title change
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    titleRef.current = newTitle;
    socketRef.current?.emit('send-title', { documentId: id, title: newTitle });
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveDocument, 3000);
  };

  // Back button saves first
  const handleBack = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await saveDocument();
    navigate('/dashboard');
  };

  const execCommand = (command, value = null) => {
    editorRef.current.focus();
    window.document.execCommand(command, false, value);
  };

  // Show loading until doc is fetched
  if (!docLoaded) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading document...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <button onClick={handleBack} className={styles.backBtn}>
          ← Back
        </button>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className={styles.titleInput}
          placeholder="Untitled Document"
        />
        <div className={styles.navRight}>
          <span className={styles.saveStatus}>
            {saving ? '💾 Saving...' : saved ? '✅ Saved!' : ''}
          </span>
          <button onClick={saveDocument} className={styles.saveBtn}>
            Save
          </button>
        </div>
      </nav>

      <div className={styles.toolbar}>
        <button onClick={() => execCommand('bold')} className={styles.toolBtn}><b>B</b></button>
        <button onClick={() => execCommand('italic')} className={styles.toolBtn}><i>I</i></button>
        <button onClick={() => execCommand('underline')} className={styles.toolBtn}><u>U</u></button>
        <div className={styles.divider} />
        <button onClick={() => execCommand('formatBlock', 'H1')} className={styles.toolBtn}>H1</button>
        <button onClick={() => execCommand('formatBlock', 'H2')} className={styles.toolBtn}>H2</button>
        <button onClick={() => execCommand('formatBlock', 'p')} className={styles.toolBtn}>P</button>
        <div className={styles.divider} />
        <button onClick={() => execCommand('insertUnorderedList')} className={styles.toolBtn}>• List</button>
        <button onClick={() => execCommand('insertOrderedList')} className={styles.toolBtn}>1. List</button>
        <div className={styles.divider} />
        <button onClick={() => execCommand('justifyLeft')} className={styles.toolBtn}>Left</button>
        <button onClick={() => execCommand('justifyCenter')} className={styles.toolBtn}>Center</button>
        <button onClick={() => execCommand('justifyRight')} className={styles.toolBtn}>Right</button>
      </div>

      <div className={styles.editorWrapper}>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className={styles.editor}
          onInput={handleInput}
          data-placeholder="Start typing your document..."
        />
      </div>
    </div>
  );
}

export default Editor;