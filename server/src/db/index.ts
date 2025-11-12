import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL;
        
        if (!mongoUrl) {
            console.error("❌ MONGODB_URL environment variable is not set!");
            console.error("Please set MONGODB_URL in your environment variables.");
            process.exit(1);
        }

        if (!mongoUrl.startsWith("mongodb://") && !mongoUrl.startsWith("mongodb+srv://")) {
            console.error("❌ Invalid MONGODB_URL format!");
            console.error(`Current value: ${mongoUrl}`);
            console.error("MONGODB_URL must start with 'mongodb://' or 'mongodb+srv://'");
            process.exit(1);
        }

        // Remove trailing slash if present
        const cleanUrl = mongoUrl.replace(/\/$/, '');
        const connectionString = `${cleanUrl}/${DB_NAME}?retryWrites=true&w=majority`;
        
        console.log(`🔗 Connecting to MongoDB...`);
        const connectionInstance = await mongoose.connect(connectionString);
        console.log(`✅ MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("❌ MONGODB connection FAILED:", error);
        process.exit(1);
    }
};

export default connectDB;