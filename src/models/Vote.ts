import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId;
    ipAddress: string;
    votedAt: Date;
}

const VoteSchema: Schema = new Schema({
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    ipAddress: { type: String, required: true },
    votedAt: { type: Date, default: Date.now }
});

// Compound index to ensure one vote per IP per poll (optional, but good for enforcement)
// We will enforce this in logic too, but DB constraint is safer.
VoteSchema.index({ pollId: 1, ipAddress: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', VoteSchema);
