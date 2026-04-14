const router = require('express').Router();
const { messages } = require('../data/mock-data');

// GET / - get all messages (for current user mock)
router.get('/', (req, res) => {
  // In a real app, would filter by authenticated user
  // For mock, return all messages
  res.json(messages);
});

// POST / - send message
router.post('/', (req, res) => {
  const { senderId, senderName, recipientId, recipientName, content } = req.body;

  if (!senderId || !recipientId || !content) {
    return res.status(400).json({ error: 'SenderId, recipientId, and content are required' });
  }

  const newMessage = {
    id: Math.max(...messages.map(m => m.id), 0) + 1,
    senderId,
    senderName: senderName || 'Unknown',
    recipientId,
    recipientName: recipientName || 'Unknown',
    content,
    timestamp: new Date().toISOString()
  };

  messages.push(newMessage);
  res.status(201).json(newMessage);
});

module.exports = router;
