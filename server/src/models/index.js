const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

async function getNextSequence(name) {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

async function assignId(doc) {
  if (!doc.id) {
    doc.id = await getNextSequence(doc.constructor.modelName);
  }
}

const userSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  name: String,
  email: { type: String, unique: true, required: true, index: true },
  password_hash: { type: String, required: true },
  role: { type: String, default: 'user', index: true },
  blocked: { type: Boolean, default: false },
  company_id: { type: Number, index: true, ref: 'TourCompany' },
  telegram_id: { type: String, unique: true, sparse: true, index: true },
  created_at: { type: Date, default: Date.now },
});

const tourCompanySchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, index: true },
  password_hash: { type: String, required: true },
  phone: String,
  address: String,
  website: String,
  description: String,
  status: { type: String, default: 'pending', index: true },
  logo: String,
  founded_year: Number,
  certificates: [String],
  achievements: [String],
  countries: [String],
  created_at: { type: Date, default: Date.now },
});

const packageSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  local_id: Number,
  type: { type: String, default: 'custom', index: true },
  category: String,
  title: { type: String, required: true, index: true },
  description: String,
  image: String,
  duration: String,
  price: { type: Number, default: 0 },
  price_currency: { type: String, default: 'USD' },
  rating: { type: Number, default: 0 },
  included: [String],
  country: String,
  hotel: String,
  flight_included: { type: Boolean, default: false },
  vibe: String,
  video: String,
  interests: [String],
  partners: [String],
  translations: { type: Map, of: mongoose.Schema.Types.Mixed },
  company_id: { type: Number, index: true, ref: 'TourCompany' },
  pdf: String,
  created_at: { type: Date, default: Date.now },
});

const bookingSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  title: String,
  type: String,
  price: Number,
  price_currency: { type: String, default: 'USD' },
  name: String,
  phone: String,
  guests: { type: Number, default: 1 },
  days: { type: Number, default: 1 },
  status: { type: String, default: 'pending', index: true },
  booked_at: { type: Date, default: Date.now },
  telegram_id: String,
  travel_date: Date,
  company_id: { type: Number, index: true, ref: 'TourCompany' },
  package_id: { type: Number, index: true },
  created_at: { type: Date, default: Date.now },
});

const travelOfferSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  type: { type: String, default: 'flight', index: true },
  title: { type: String, required: true },
  image: String,
  description: String,
  phone: String,
  location: String,
  created_at: { type: Date, default: Date.now },
});

const telegramUserSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  telegram_id: { type: String, unique: true, required: true, index: true },
  name: String,
  phone: String,
  username: String,
  first_name: String,
  created_at: { type: Date, default: Date.now },
});

[userSchema, tourCompanySchema, packageSchema, bookingSchema, travelOfferSchema, telegramUserSchema].forEach((schema) => {
  schema.pre('save', async function () {
    await assignId(this);
  });
});

const User = mongoose.model('User', userSchema);
const TourCompany = mongoose.model('TourCompany', tourCompanySchema);
const Package = mongoose.model('Package', packageSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const TravelOffer = mongoose.model('TravelOffer', travelOfferSchema);
const TelegramUser = mongoose.model('TelegramUser', telegramUserSchema);

module.exports = {
  User,
  TourCompany,
  Package,
  Booking,
  TravelOffer,
  TelegramUser,
  getNextSequence,
};
