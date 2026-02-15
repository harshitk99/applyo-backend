import { Server, Socket } from 'socket.io';
import Poll from '../models/Poll';
import Vote from '../models/Vote';

export const setupSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('New client connected:', socket.id);

        // Join a specific poll room
        socket.on('join_poll', (pollId: string) => {
            const ip = socket.handshake.address;
            socket.join(pollId);
            console.log(`Socket ${socket.id} (IP: ${ip}) joined poll ${pollId}`);
        });

        // Handle incoming vote
        socket.on('vote', async ({ pollId, optionId, email }: { pollId: string; optionId: string; email: string }) => {
            console.log(`[SOCKET] Vote received for Poll: ${pollId}, Option: ${optionId}, Email: ${email}`);
            try {
                if (!email) {
                    console.log('[SOCKET] Vote failed: Email is missing');
                    socket.emit('error', { message: 'Email is required to vote.' });
                    return;
                }

                const ip = socket.handshake.address; // Simple IP check. In prod, check x-forwarded-for if behind proxy.
                console.log(`[SOCKET] User IP: ${ip}`);
                console.log(`this is socket-' ${socket}`)
                // Check if already voted by Email
                const existingVoteEmail = await Vote.findOne({ pollId, email });
                console.log("checking email ", existingVoteEmail)
                if (existingVoteEmail) {
                    console.log(`[SOCKET] Duplicate vote attempt by Email: ${email}`);
                    socket.emit('error', { message: 'You have already voted with this email.' });
                    return;
                }

                // IP Check removed to allow multiple users on same network (e.g. WiFi) to vote.
                // We rely on Email uniqueness for vote limiting.

                // Update Poll
                const poll = await Poll.findById(pollId);
                console.log("poll - ", poll)
                if (!poll) {
                    console.error('[SOCKET] Vote failed: Poll not found');
                    socket.emit('error', { message: 'Poll not found.' });
                    return;
                }

                const option = poll.options.find(opt => (opt as any)._id.toString() === optionId);
                console.log("option - ", option)
                if (!option) {
                    console.error('[SOCKET] Vote failed: Option not found');
                    socket.emit('error', { message: 'Option not found.' });
                    return;
                }

                option.votes += 1;
                await poll.save();

                // Record Vote
                await Vote.create({ pollId, ipAddress: ip, email });
                console.log('[SOCKET] Vote successfully recorded');

                // Broadcast update to room
                io.to(pollId).emit('update_poll', poll);

            } catch (error) {
                console.error('[SOCKET] Vote error:', error);
                socket.emit('error', { message: 'Internal server error processing vote.' });
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
