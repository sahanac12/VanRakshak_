const express = require('express');
const router = express.Router();
const { 
  createIncident, 
  getIncidents, 
  getIncidentById, 
  updateIncident 
} = require('../controllers/incidentController');
const { protect } = require('../middleware/authMiddleware');

// All incident routes require authentication
router.use(protect);

router.route('/')
  .post(createIncident)
  .get(getIncidents);

router.route('/:id')
  .get(getIncidentById)
  .patch(updateIncident);

module.exports = router;
