import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId;
    email: string;
    ipAddress: string;
    votedAt: Date;
}

const VoteSchema: Schema = new Schema({
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    email: { type: String, required: true },
    ipAddress: { type: String, required: true },
    votedAt: { type: Date, default: Date.now }
});

// Compound indexes to ensure one vote per Email per Poll AND one vote per IP per Poll
VoteSchema.index({ pollId: 1, email: 1 }, { unique: true });
VoteSchema.index({ pollId: 1, ipAddress: 1 }); // Index for performance, but allow multiple votes per IP (e.g. shared wifi)

export default mongoose.model<IVote>('Vote', VoteSchema);
