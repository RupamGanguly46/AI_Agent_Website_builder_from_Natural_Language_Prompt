import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    framework: {
        type: String,
        default: 'react',
        enum: ['react'],
    },
    repoPath: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

export default mongoose.model('Project', projectSchema);
