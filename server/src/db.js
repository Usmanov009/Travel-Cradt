const mongoose = require('mongoose');
const { connectMongo } = require('./mongodb');

async function connectDB() {
  await connectMongo();
}

module.exports = { connectDB };
