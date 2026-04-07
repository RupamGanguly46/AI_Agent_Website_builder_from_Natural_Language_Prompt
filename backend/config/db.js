import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-builder';
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.warn(`⚠️ Primary MongoDB connection failed: ${error.message}`);
        console.warn(`🔄 Attempting to fallback to localhost...`);
        try {
            const fallbackUri = 'mongodb://127.0.0.1:27017/ai-builder';
            const conn = await mongoose.connect(fallbackUri);
            console.log(`✅ Fallback MongoDB connected: ${conn.connection.host}`);
        } catch (fallbackError) {
            console.error(`❌ Fallback MongoDB connection error: ${fallbackError.message}`);
            process.exit(1);
        }
    }
};

export default connectDB;

