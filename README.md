# SyncSpace 🚀

![SyncSpace Hero](https://via.placeholder.com/1200x400/1e1e1e/ffffff?text=SyncSpace+Collaborative+IDE)

SyncSpace is a **real-time collaborative coding environment and Cloud IDE**. Built with a high-performance distributed architecture, it allows multiple developers to edit, switch languages, and execute code simultaneously in the same virtual room without collisions or latency bottlenecks.

Designed to mirror the core collaborative logic behind tools like *VS Code Live Share* and *Google Docs*, SyncSpace pushes beyond basic text broadcasting by implementing a deterministic **Conflict-Free Replicated Data Type (CRDT)** architecture backed by resilient on-disk persistence.

---

## 🛠️ System Architecture

### Why WebSockets + Yjs (CRDTs)?
Traditional collaborative editors rely on standard database polling or Operational Transformation (OT), which requires a complex, central "source of truth" server to sequence edits and resolve locking conflicts. If two users type at the exact same millisecond, OT architectures often struggle or require heavy locking.

**SyncSpace fundamentally bypasses this using CRDTs via Yjs:**
* **Mathematical Conflict Resolution:** Every character and state map is locally appended as a mathematical graph node. Concurrent edits are deterministically merged without central mediation.
* **WebSocket Relaying:** The Express/Node.js backend does not process logic; it acts purely as a low-latency sub/pub relay, forwarding binary buffers via native `ws` WebSockets.
* **Decoupled State Trees:** We utilize isolated Yjs structures (`Y.Text` for the Monaco Editor and `Y.Map` for the active language state) to prevent cascading re-renders when modifying IDE settings.

### LevelDB Fault Tolerance & Persistence
CRDT memory arrays are incredibly fast but volatile. We integrated the `y-leveldb` adapter directly into the `y-websocket` binary stream.
* **Incremental Disk Flushes:** Rather than uploading massive text blobs, the active Yjs Document incrementally flushes compressed differential updates to a local `./storage` LevelDB instance.
* **Server Resilience:** If the Node.js relay server unexpectedly restarts or crashes, the master document is dynamically recovered from LevelDB before accepting new WebSocket topologies, ensuring zero data loss.

### Code Execution via Piston API
To convert SyncSpace from a text-sync engine into a functional IDE, we implemented a secure frontend gateway to the **Piston API Engine**.
* When a user selects *JavaScript, Python, or C++*, the room's overarching `Y.Map` syncs the layout identically to all clients.
* When the user hits "Run Code", the raw `Y.Text` is parsed and executed inside an isolated, remote Dockerized sandbox container, streaming `stdout` and `stderr` back into our custom terminal UI dynamically.

---

## 🚀 Getting Started

The application uses an explicit client-server decoupled architecture. You will need to start both environments.

### 1. Start the Relay API (Backend)
```bash
cd server
npm install
npm start
```
*The server automatically detects if the `FRONTEND_URL` environment variable is present for dynamic CORS or binds to `http://localhost:5173` strictly during local dev.*

### 2. Start the Collaborative IDE (Frontend)
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```

### 3. Open your Rooms
- Navigate your browser to `http://localhost:5173`.
- Open an incognito window and navigate to the same address.
- Begin typing in one window and watch the real-time CRDT propagation and cursor awareness stream flawlessly!

---

*Architected and developed by Suraj Pandavula.*