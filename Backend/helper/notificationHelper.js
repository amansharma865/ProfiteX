const Notification = require('../models/notification');

const createNotification = async (type, title, message, recipientId, recipientModel, orderId = null) => {
    try {
        const notification = await Notification.create({
            type,
            title,
            message,
            recipient: recipientId,
            recipientModel,
            relatedOrder: orderId
        });
        return notification;
    } catch (error) {
        return null;
    }
};

module.exports = { createNotification };
