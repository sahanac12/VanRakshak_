const User = require('../models/User');

/**
 * @desc    Get all forest officers
 * @route   GET /api/users/officers
 * @access  Private (Admin only)
 */
exports.getAllOfficers = async (req, res, next) => {
  try {
    const officers = await User.find({ role: 'officer' }).select('-passwordHash');

    res.status(200).json({
      success: true,
      count: officers.length,
      data: officers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign a zone to an officer
 * @route   PUT /api/users/:id/zone
 * @access  Private (Admin only)
 */
exports.assignZone = async (req, res, next) => {
  try {
    const { assignedZone } = req.body;

    if (!assignedZone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an assigned zone',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Ensure we are only assigning zones to officers (optional but good practice)
    if (user.role !== 'officer') {
      return res.status(400).json({
        success: false,
        message: 'Zones can only be assigned to officers',
      });
    }

    user.assignedZone = assignedZone;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: `Zone '${assignedZone}' assigned to officer ${user.name}`,
    });
  } catch (error) {
    next(error);
  }
};
