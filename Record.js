const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  location: {
    name: String,
    lat: Number,
    lon: Number,
    country: String
  },
  weather: { type: Object },
  airQuality: { type: Object },
  alerts: { type: Object }, // store OpenWeatherMap alerts or aggregated alerts
  aggregatedAt: { type: Date, default: Date.now },
  sourceApis: [String], // e.g., ["openweathermap", "openaq"]
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }
});

module.exports = mongoose.model('Record', RecordSchema);
