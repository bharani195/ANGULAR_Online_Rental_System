import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully to:', conn.connection.host);
    
    // Test the connection by trying to list collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // More detailed error logging
    if (error.code === 'ECONNREFUSED') {
      console.error('Make sure MongoDB is running and accessible');
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error connecting to MongoDB. Check your connection and MONGO_URI');
    }
    
    process.exit(1);
  }
};

export default connectDB;
