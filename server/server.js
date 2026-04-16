const express = require('express');
const http = require('http');
const WebSocket = require('ws'); 
const { setupWSConnection } = require('y-websocket/bin/utils');
const { setPersistence } = require('y-websocket/bin/utils');
const { LeveldbPersistence } = require('y-leveldb');
const Y = require('yjs');

const corsOptions = require('./config/corsOptions');

const app = express();
const cors = require('cors');
app.use(cors(corsOptions));

const server = http.createServer(app);

// 1. Initialize the LevelDB persistence layer
const ldb = new LeveldbPersistence('./storage');

// 2. Bind the database to y-websocket's internal lifecycle
setPersistence({
  bindState: async (documentName, ydoc) => {
    const persistedYdoc = await ldb.getYDoc(documentName);
    const newUpdates = Y.encodeStateAsUpdate(ydoc);
    ldb.storeUpdate(documentName, newUpdates);
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
    
    ydoc.on('update', update => {
        ldb.storeUpdate(documentName, update);
    });
  },
  writeState: async (documentName, ydoc) => {
    return ldb.writeState(documentName, ydoc);
  }
});

const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ message: "SyncSpace Server is running with LevelDB Persistence" });
});

wss.on('connection', (conn, req) => {
    console.log('Incoming WebSocket connection established.');
    setupWSConnection(conn, req, { gc: true });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
