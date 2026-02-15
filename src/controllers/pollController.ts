import { Request, Response } from 'express';
import Poll, { IPoll } from '../models/Poll';

export const createPoll = async (req: Request, res: Response) => {
    try {
        const { question, options } = req.body;

        if (!question || !options || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ message: 'Invalid poll data. Need question and at least 2 options.' });
        }

        const formattedOptions = options.map((opt: string) => ({ text: opt, votes: 0 }));

        const newPoll = new Poll({
            question,
            options: formattedOptions
        });

        await newPoll.save();
        res.status(201).json(newPoll);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getPoll = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const poll = await Poll.findById(id);

        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        res.status(200).json(poll);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
