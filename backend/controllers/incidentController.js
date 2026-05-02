const Incident = require('../models/Incident');
const { sendNotification } = require('../utils/notificationService');

/**
 * @desc    Report a new incident
 * @route   POST /api/incidents
 * @access  Private
 */
exports.createIncident = async (req, res, next) => {
  try {
    const { type, description, location, zone, evidence, voiceNote, language, priority } = req.body;

    // Enforce zone
    if (!zone) {
      return res.status(400).json({
        success: false,
        message: 'Incident zone is mandatory',
      });
    }

    const incident = await Incident.create({
      reportedBy: req.user.id,
      type,
      description,
      location,
      zone,
      evidence: evidence || [],
      voiceNote,
      language,
      priority: priority || 'medium',
      status: 'reported'
    });

    // Notify Admins
    await sendNotification({
      role: 'admin',
      title: 'New Incident Reported',
      body: `A new ${type} incident has been reported in ${zone} zone.`,
      type: 'INCIDENT_REPORTED',
      incidentId: incident._id
    });

    res.status(201).json({
      success: true,
      data: incident,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List incidents with intentional filtering
 * @route   GET /api/incidents
 * @access  Private
 */
exports.getIncidents = async (req, res, next) => {
  try {
    let filter = {};

    // Intentional Filtering by Role
    if (req.user.role === 'admin') {
      // Admin sees everything, supports query filters
      if (req.query.status) filter.status = req.query.status;
      if (req.query.zone) filter.zone = req.query.zone;
      if (req.query.priority) filter.priority = req.query.priority;
    } else if (req.user.role === 'officer') {
      // Officer sees incidents in their zone OR assigned to them
      filter.$or = [
        { zone: req.user.assignedZone },
        { assignedTo: req.user.id }
      ];
      // Still support optional status/priority filters within their scope
      if (req.query.status) filter.status = req.query.status;
    } else if (req.user.role === 'community') {
      // Community sees only their own reports
      filter.reportedBy = req.user.id;
    }

    const incidents = await Incident.find(filter)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get incident details
 * @route   GET /api/incidents/:id
 * @access  Private
 */
exports.getIncidentById = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found',
      });
    }

    // Role-based access check for single view
    if (req.user.role === 'community' && incident.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this incident',
      });
    }

    res.status(200).json({
      success: true,
      data: incident,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update incident (Status, Assignment, Priority)
 * @route   PATCH /api/incidents/:id
 * @access  Private (Admin/Officer)
 */
exports.updateIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found',
      });
    }

    const { status, assignedTo, priority, evidence } = req.body;
    const isOfficer = req.user.role === 'officer';
    const isAdmin = req.user.role === 'admin';

    // --- RBAC & Logic Enforcement ---

    // 1. If Officer, check if they are the assigned user
    if (isOfficer) {
      if (incident.assignedTo && incident.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Officers can only update incidents assigned to them',
        });
      }
      
      // Officers can ONLY update status
      if (assignedTo || priority) {
        return res.status(403).json({
          success: false,
          message: 'Officers cannot change assignment or priority',
        });
      }

      // Officers can only move to in_progress or resolved
      const allowedStatus = ['in_progress', 'resolved'];
      if (status && !allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Officers can only move status to in_progress or resolved',
        });
      }
    }

    // 2. If Community, they can't update anything here
    if (req.user.role === 'community') {
      return res.status(403).json({
        success: false,
        message: 'Community users cannot update incidents',
      });
    }

    // --- Apply Updates ---

    // Admin can update priority
    if (isAdmin && priority) {
      incident.priority = priority;
    }

    // Admin can update assignment
    if (isAdmin && assignedTo) {
      incident.assignedTo = assignedTo;
      incident.assignedAt = Date.now();
      // Auto-transition to 'assigned' if currently 'reported'
      if (incident.status === 'reported') {
        incident.status = 'assigned';
      }

      // Notify Officer
      await sendNotification({
        userId: assignedTo,
        title: 'New Task Assigned',
        body: `You have been assigned a new ${incident.type} incident.`,
        type: 'INCIDENT_ASSIGNED',
        incidentId: incident._id
      });
    }

    // Admin/Officer can update status
    if (status) {
      incident.status = status;
      if (status === 'resolved') {
        incident.resolvedAt = Date.now();
      }

      // Notify Reporter
      await sendNotification({
        userId: incident.reportedBy,
        title: `Incident ${status.replace('_', ' ')}`,
        body: `Your report about ${incident.type} has been moved to ${status.replace('_', ' ')}.`,
        type: `INCIDENT_${status.toUpperCase()}`,
        incidentId: incident._id
      });

      // If resolved, also notify Admins
      if (status === 'resolved') {
        await sendNotification({
          role: 'admin',
          title: 'Incident Resolved',
          body: `Officer has resolved the ${incident.type} incident in ${incident.zone}.`,
          type: 'INCIDENT_RESOLVED',
          incidentId: incident._id
        });
      }
    }

    // Append evidence if provided
    if (evidence) {
      if (Array.isArray(evidence)) {
        incident.evidence.push(...evidence);
      } else {
        incident.evidence.push(evidence);
      }
    }

    await incident.save();

    res.status(200).json({
      success: true,
      data: incident,
      message: 'Incident updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
