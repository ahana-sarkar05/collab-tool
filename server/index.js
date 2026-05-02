const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Collab Tool API is running!' });
});

// ─── SOCKET.IO ───────────────────────────────────────────
const Document = require('./models/Document');

io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  // Join document room
  socket.on('join-document', (documentId) => {
    socket.join(documentId);
    console.log(`✅ User ${socket.id} joined document: ${documentId}`);
  });

  // Broadcast content changes to everyone else in room
  socket.on('send-changes', ({ documentId, content }) => {
    socket.to(documentId).emit('receive-changes', content);
  });

  // Broadcast title changes to everyone else in room
  socket.on('send-title', ({ documentId, title }) => {
    socket.to(documentId).emit('receive-title', title);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// ─── MONGODB + START SERVER ──────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    httpServer.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB error:', err));