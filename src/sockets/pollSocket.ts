import { Server, Socket } from 'socket.io';
import Poll from '../models/Poll';
import Vote from '../models/Vote';

export const setupSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('New client connected:', socket.id);

        // Join a specific poll room
        socket.on('join_poll', (pollId: string) => {
            socket.join(pollId);
            console.log(`Socket ${socket.id} joined poll ${pollId}`);
        });

        // Handle incoming vote
        socket.on('vote', async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
            try {
                const ip = socket.handshake.address; // Simple IP check. In prod, check x-forwarded-for if behind proxy.

                // Check if already voted
                const existingVote = await Vote.findOne({ pollId, ipAddress: ip });
                if (existingVote) {
                    socket.emit('error', { message: 'You have already voted in this poll.' });
                    return;
                }

                // Update Poll
                const poll = await Poll.findById(pollId);
                if (!poll) {
                    socket.emit('error', { message: 'Poll not found.' });
                    return;
                }

                const option = poll.options.find(opt => (opt as any)._id.toString() === optionId);
                if (!option) {
                    socket.emit('error', { message: 'Option not found.' });
                    return;
                }

                option.votes += 1;
                await poll.save();

                // Record Vote
                await Vote.create({ pollId, ipAddress: ip });

                // Broadcast update to room
                io.to(pollId).emit('update_poll', poll);

            } catch (error) {
                console.error('Vote error:', error);
                socket.emit('error', { message: 'Internal server error processing vote.' });
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
