const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        
        const message = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            content
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages between current user and another user
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, recipient: req.params.userId },
                { sender: req.params.userId, recipient: req.user._id }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations/list
// @access  Private
const getConversationsList = async (req, res) => {
    try {
        // Find unique users current user has messaged or received messages from
        const sentMessages = await Message.find({ sender: req.user._id }).distinct('recipient');
        const receivedMessages = await Message.find({ recipient: req.user._id }).distinct('sender');
        
        const userIds = [...new Set([...sentMessages, ...receivedMessages])];
        
        const users = await User.find({ _id: { $in: userIds } }).select('name email role');
        
        // Add last message to each user
        const list = await Promise.all(users.map(async (u) => {
            const lastMsg = await Message.findOne({
                $or: [
                    { sender: req.user._id, recipient: u._id },
                    { sender: u._id, recipient: req.user._id }
                ]
            }).sort({ createdAt: -1 });

            return {
                user: u,
                lastMessage: lastMsg
            };
        }));

        res.json(list.sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendMessage, getConversation, getConversationsList };
