const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://imronbekusmonov392_db_user:XAbOfCHguDfUFVAI@cluster0.ladtwvl.mongodb.net/travelcraft?retryWrites=true&w=majority&appName=Cluster0';

async function connectMongo(retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (mongoose.connection.readyState === 1) return; // allaqachon ulangan
      await mongoose.connect(MONGODB_URI, {
        dbName: 'travelcraft',
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });
      console.log('MongoDB connected');
      return;
    } catch (err) {
      console.error(`MongoDB connection error (urinish ${attempt}/${retries}):`, err.message);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
  throw new Error("MongoDB ga ulanib bo'lmadi (" + retries + " urinishdan keyin)");
}

module.exports = { connectMongo, mongoose };