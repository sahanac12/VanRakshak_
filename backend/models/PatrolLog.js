const mongoose = require('mongoose');

const patrolLogSchema = new mongoose.Schema({
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coordinates: [{
    lat: Number,
    lng: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  patrolDate: {
    type: Date,
    default: Date.now
  },
  isSynced: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('PatrolLog', patrolLogSchema);
