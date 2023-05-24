import mongoose from 'mongoose';

const DEFAULT_CONNECTION_STRING: string = 'mongosh "mongodb://mongo:tj7zOHSlHTJFYRPUaRti@containers-us-west-15.railway.app:6765"';

// Connect to mongoDB with the connection string given as argument
export default function connectToDatabase(connectionString: string = DEFAULT_CONNECTION_STRING) {
    return mongoose.connect(connectionString);
}