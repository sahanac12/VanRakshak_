const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['fire', 'poaching', 'logging', 'wildlife', 'unauthorized_entry', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  zone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['reported', 'assigned', 'in_progress', 'resolved'],
    default: 'reported'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  evidence: [{
    type: String // URLs to images/videos
  }],
  voiceNote: {
    type: String // URL to audio file
  },
  language: {
    type: String,
    default: 'en'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'critical'],
    default: 'medium'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Incident', incidentSchema);
