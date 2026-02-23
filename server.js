import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')));

// Store latest data
let latestData = null;

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send latest data to new clients
    if (latestData) {
        socket.emit('sensor_data', latestData);
    }

    // Broadcaster sends new data
    socket.on('sensor_data', (data) => {
        latestData = data; // Cache
        socket.broadcast.emit('sensor_data', data); // Broadcast to all OTHER clients
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Fallback for SPA routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
