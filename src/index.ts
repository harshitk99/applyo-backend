import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for now, will lock down later
        methods: ["GET", "POST"]
    }
});

import { setupSocketHandlers } from './sockets/pollSocket';
setupSocketHandlers(io);

app.use(cors());
app.use(express.json());

import pollRoutes from './routes/pollRoutes';
app.use('/api/polls', pollRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Poll Server is running');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log('MongoDB connected');
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
