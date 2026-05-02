# 📝 CollabDocs — Real-Time Collaboration Tool

> A full-stack real-time document collaboration tool built with the MERN stack and Socket.io — similar to Google Docs.

![App Screenshot](https://via.placeholder.com/800x400?text=CollabDocs+Preview)

## 🌐 Live Demo

🔗 **Frontend:** [https://collab-tool-two.vercel.app](https://collab-tool-two.vercel.app)  
🔗 **Backend API:** [https://collab-tool-backend-4fu1.onrender.com](https://collab-tool-backend-4fu1.onrender.com)  
📂 **GitHub:** [https://github.com/ahana-sarkar05/collab-tool](https://github.com/ahana-sarkar05/collab-tool)

---

## ✨ Features

- 🔐 **User Authentication** — Secure register and login with JWT tokens and bcrypt password encryption
- 📄 **Document Management** — Create, edit, and delete documents from a personal dashboard
- ⚡ **Real-Time Collaboration** — Multiple users can edit the same document simultaneously using WebSockets
- 💾 **Auto-Save** — Documents are automatically saved every 3 seconds after the last keystroke
- ✏️ **Rich Text Editor** — Bold, italic, underline, headings, lists, and text alignment
- 📱 **Responsive Design** — Works on desktop and mobile browsers
- 🌐 **Cloud Deployment** — Frontend on Vercel, Backend on Render, Database on MongoDB Atlas

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework and build tool |
| React Router DOM | Client-side routing |
| Socket.io Client | Real-time WebSocket connection |
| Axios | HTTP requests to backend API |
| CSS Modules | Component-scoped styling |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Socket.io | WebSocket server for real-time sync |
| MongoDB + Mongoose | Database and ODM |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| dotenv | Environment variable management |
| nodemon | Development auto-restart |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database |

---

## 🏗️ System Architecture

```
Browser (React)
     │
     ├── REST API (axios) ──────► Express Server ──► MongoDB Atlas
     │                                  │
     └── WebSocket (Socket.io) ◄────────┘
```

**How real-time works:**
1. User A opens a document → joins a Socket.io "room" for that document
2. User A types → change is emitted to the server
3. Server broadcasts the change to all other users in the same room
4. User B receives the change → editor updates instantly without refresh

---

## 📁 Project Structure

```
collab-tool/
├── client/                     # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js        # Axios instance with auth interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx       # Login page
│   │   │   ├── Register.jsx    # Register page
│   │   │   ├── Dashboard.jsx   # Document list page
│   │   │   └── Editor.jsx      # Real-time document editor
│   │   ├── App.jsx             # Routes and protected routes
│   │   └── main.jsx            # React entry point
│   ├── .env.development        # Local environment variables
│   └── .env.production         # Production environment variables
│
└── server/                     # Node.js backend
    ├── middleware/
    │   └── authMiddleware.js   # JWT verification middleware
    ├── models/
    │   ├── User.js             # User MongoDB schema
    │   └── Document.js         # Document MongoDB schema
    ├── routes/
    │   ├── auth.js             # /api/auth routes
    │   └── documents.js        # /api/documents routes
    ├── .env                    # Environment variables (not committed)
    └── index.js                # Server entry point + Socket.io logic
```

---

## 🚀 Getting Started (Run Locally)

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- Git
- MongoDB Atlas account (free)

### 1. Clone the repository
```bash
git clone https://github.com/ahana-sarkar05/collab-tool.git
cd collab-tool
```

### 2. Set up the Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 3. Set up the Frontend
Open a new terminal:
```bash
cd client
npm install
```

Create a `.env.development` file in the `client/` folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🔌 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |

### Document Routes (`/api/documents`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/documents` | Get all user documents | Yes |
| GET | `/api/documents/:id` | Get single document | Yes |
| POST | `/api/documents` | Create new document | Yes |
| PATCH | `/api/documents/:id` | Update document | Yes |
| DELETE | `/api/documents/:id` | Delete document | Yes |

### Socket.io Events
| Event | Direction | Description |
|---|---|---|
| `join-document` | Client → Server | Join a document room |
| `send-changes` | Client → Server | Send content changes |
| `receive-changes` | Server → Client | Receive content changes |
| `send-title` | Client → Server | Send title changes |
| `receive-title` | Server → Client | Receive title changes |

---

## 🔒 Authentication Flow

```
1. User registers → password hashed with bcrypt → saved to MongoDB
2. User logs in → password verified → JWT token generated (7 day expiry)
3. Token stored in localStorage
4. Every API request → token sent in Authorization header
5. Backend middleware verifies token → grants/denies access
```

---

## 💡 Key Technical Decisions

**Why Socket.io over plain WebSockets?**  
Socket.io provides automatic reconnection, room management, and fallback to HTTP long-polling — making it more reliable for production use.

**Why JWT over sessions?**  
JWTs are stateless — the server doesn't need to store session data, making the API easily scalable.

**Why ContentEditable over a library?**  
react-quill doesn't support React 19. ContentEditable with execCommand gives full control and works with all React versions.

**Why debounced save instead of save-on-every-keystroke?**  
Saving on every keystroke would flood the database with hundreds of requests per minute. Debouncing waits 3 seconds after the last keystroke — much more efficient.

---

## 🐛 Known Issues & Future Improvements

- [ ] Show live cursors of other users
- [ ] Document sharing via invite link
- [ ] User profile and avatar
- [ ] Download document as PDF
- [ ] Document version history
- [ ] Comments and suggestions mode

---

## 👩‍💻 Author

**Ahana Sarkar**  
- GitHub: [@ahana-sarkar05](https://github.com/ahana-sarkar05)  
- Email: 2305189@kiit.ac.in

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

⭐ If you found this project helpful, please give it a star on GitHub!
