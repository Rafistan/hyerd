const router = require('express').Router();
const { users } = require('../data/mock-data');

// GET /:id - get user profile
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

module.exports = router;
