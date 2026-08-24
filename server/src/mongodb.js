const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://imronbekusmonov392_db_user:XAbOfCHguDfUFVAI@cluster0.ladtwvl.mongodb.net/travelcraft?retryWrites=true&w=majority&appName=Cluster0';

async function connectMongo() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'travelcraft',
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

module.exports = { connectMongo, mongoose };
