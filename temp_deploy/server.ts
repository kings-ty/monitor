import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Frontend (src/types.ts) 와 완전히 동일한 타입 선언
export interface GliderData {
    voltage: number;
    depth: number;
    o2: number;
    status: number;
    timestamp: number;
}

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
let latestData: GliderData | null = null;

io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Send latest data to new clients
    if (latestData) {
        socket.emit('sensor_data', latestData);
    }

    // Broadcaster sends new data
    socket.on('sensor_data', (data: GliderData) => {
        latestData = data; // Cache
        socket.broadcast.emit('sensor_data', data); // Broadcast to all OTHER clients
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Fallback for SPA routing
app.use((req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT: number = Number(process.env.PORT) || 8080;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
