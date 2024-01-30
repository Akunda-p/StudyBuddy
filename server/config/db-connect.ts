import mongoose from 'mongoose';

const DEFAULT_CONNECTION_STRING: string = 'mongodb://mongo:b26D6gDb5CgC1dhdE-ceEbbbG-24b262@monorail.proxy.rlwy.net:20770';

// Connect to mongoDB with the connection string given as argument
export default function connectToDatabase(connectionString: string = DEFAULT_CONNECTION_STRING) {
    return mongoose.connect(connectionString);
}
