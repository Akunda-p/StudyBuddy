import mongoose from 'mongoose';

const DEFAULT_CONNECTION_STRING: string = 'mongodb://mongo:-6b23fd1-FeB5eebG-G3cH5hEAHg543D@monorail.proxy.rlwy.net:17321/studyBuddy';

// Connect to mongoDB with the connection string given as argument
export default function connectToDatabase(connectionString: string = DEFAULT_CONNECTION_STRING) {
    return mongoose.connect(connectionString);
}