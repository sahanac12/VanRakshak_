const express = require('express');
const router = express.Router();
const { getAllOfficers, assignZone } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes here require authentication and Admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/officers', getAllOfficers);
router.put('/:id/zone', assignZone);

module.exports = router;
