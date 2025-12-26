const express = require('express');
const router = express.Router();
const { verifyJwtUser, verifyJwtAdmin } = require('../middlewares/authorize');
const Notification = require('../models/notification');

// Get notifications for logged-in user
router.get('/user', verifyJwtUser, async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user._id,
            recipientModel: 'user'
        })
            .sort({ createdAt: -1 })
            .limit(10);

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            recipientModel: 'user',
            read: false
        });

        res.json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get notifications for logged-in admin
router.get('/admin', verifyJwtAdmin, async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user._id,
            recipientModel: 'admin'
        })
            .sort({ createdAt: -1 })
            .limit(10);

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            recipientModel: 'admin',
            read: false
        });

        res.json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Mark all as read for user
router.put('/mark-all-read/user', verifyJwtUser, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, recipientModel: 'user', read: false },
            { read: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Mark all as read for admin
router.put('/mark-all-read/admin', verifyJwtAdmin, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, recipientModel: 'admin', read: false },
            { read: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete all notifications for user
router.delete('/clear-all/user', verifyJwtUser, async (req, res) => {
    try {
        await Notification.deleteMany({
            recipient: req.user._id,
            recipientModel: 'user'
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete all notifications for admin
router.delete('/clear-all/admin', verifyJwtAdmin, async (req, res) => {
    try {
        await Notification.deleteMany({
            recipient: req.user._id,
            recipientModel: 'admin'
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
