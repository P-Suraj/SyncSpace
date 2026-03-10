# SyncSpace 🖥️

A real-time collaborative code editor I'm actively building to understand how tools like 
VS Code Live Share actually work under the hood. The core challenge I'm exploring: how do 
you let multiple people edit the same file simultaneously without their changes conflicting or overwriting each other?

> ⚠️ Active Development — core WebSocket sync is working, CRDT integration in progress.

## Why I built this

After using VS Code Live Share during a group project, I got curious about the engineering behind it. 
How does it handle two people typing in the same line at the same time? 
What prevents one person's edit from destroying another's? 
That rabbit hole led me to distributed systems, CRDTs, and operational transforms — 
and I decided the best way to actually understand it was to build it myself.

## What it does (so far)

- Real-time bidirectional communication between multiple clients via WebSockets
- Decoupled client/server architecture with Node.js and Express backend
- VS Code-like code editing experience using Monaco Editor
- React frontend with live state synchronization across sessions

## What's being built next

- **CRDT sync via Yjs** — resolving concurrent edits mathematically so no conflict resolution logic is needed
- **Redis pub/sub** — scaling the backend across multiple server instances
- **Docker** — containerizing the full stack for consistent deployment

## Tech Stack

- **Backend:** Node.js, Express.js, Socket.io
- **Frontend:** React, Monaco Editor
- **Sync Engine:** Yjs (CRDTs) — in progress
- **Scalability:** Redis pub/sub, Docker — planned
- **Architecture:** Decoupled client/server, event-driven WebSocket communication

## How it works

1. Client connects to the server via a persistent WebSocket (Socket.io handshake)
2. Any keystroke or edit event is emitted to the server instantly
3. Server broadcasts the change to all other connected clients in the same session
4. *(In progress)* Yjs CRDT layer will intercept concurrent edits and merge them 
   mathematically before broadcasting — eliminating conflicts without locking

## The hard problem I'm solving

Standard WebSocket broadcasting works fine when edits don't overlap. 
But what happens when User A and User B type in the exact same position at the exact same millisecond? 
One edit will overwrite the other. CRDTs (Conflict-free Replicated Data Types) solve this by 
representing every character as a unique node in a directed graph — so two simultaneous edits 
can always be merged deterministically, regardless of order.

This is the core problem I'm currently implementing with Yjs.

## What I'm learning

- How WebSocket lifecycle management works (handshake, heartbeat, disconnection handling)
- Why CRDTs are preferred over Operational Transforms for modern collaborative editors
- How Redis pub/sub enables a single logical "room" to span multiple server instances
- The difference between eventual consistency and strong consistency in distributed systems

## Setup
```bash
git clone https://github.com/P-Suraj/syncspace.git
cd syncspace
npm install
node index.js
# Open http://localhost:3000 in two browser tabs to test real-time sync
```

---

Built by Suraj — 2nd year CSE @ Amrita Vishwa Vidyapeetham  
*Actively in development — follow the repo to see it evolve.*