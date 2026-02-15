import mongoose, { Schema, Document } from 'mongoose';

export interface IOption {
    text: string;
    votes: number;
}

export interface IPoll extends Document {
    question: string;
    options: IOption[];
    createdAt: Date;
    isPublic: boolean;
}

const OptionSchema: Schema = new Schema({
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
});

const PollSchema: Schema = new Schema({
    question: { type: String, required: true },
    options: [OptionSchema],
    createdAt: { type: Date, default: Date.now },
    isPublic: { type: Boolean, default: true }
});

export default mongoose.model<IPoll>('Poll', PollSchema);
