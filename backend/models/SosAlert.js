const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  triggeredAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  },
  adminNote: {
    type: String
  }
});

module.exports = mongoose.model('SosAlert', sosAlertSchema);
