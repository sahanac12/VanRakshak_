const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../socket');

/**
 * Send a notification to a specific user or room
 * @param {Object} data { userId, title, body, type, incidentId, role }
 */
exports.sendNotification = async ({ userId, title, body, type, incidentId, role }) => {
  try {
    const io = getIO();
    
    // 1. If sending to a specific user
    if (userId) {
      // Save to DB
      const notification = await Notification.create({
        userId,
        title,
        body,
        type,
        incidentId
      });

      // Emit via Socket.IO
      io.to(userId.toString()).emit('new_notification', notification);
      return notification;
    }

    // 2. If sending to all admins
    if (role === 'admin') {
      const admins = await User.find({ role: 'admin' });
      
      const notifications = await Promise.all(admins.map(admin => 
        Notification.create({
          userId: admin._id,
          title,
          body,
          type,
          incidentId
        })
      ));

      // Emit to admin room
      io.to('admins').emit('new_notification', notifications[0]); // Send first one as representative or iterate
      return notifications;
    }

  } catch (error) {
    console.error('Notification Service Error:', error);
  }
};
