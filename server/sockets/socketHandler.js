// Modular socket event handler
module.exports = (io, socket) => {
    console.log(`User connected: ${socket.id}`);

    // Allow multiple users to join a specific document/room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
        // Log to other clients that a new user connected
        socket.to(roomId).emit('user-joined', socket.id);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
};
