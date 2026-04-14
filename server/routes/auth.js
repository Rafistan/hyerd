const router = require('express').Router();
const { users } = require('../data/mock-data');

// POST /login - mock login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Mock token generation
  const token = 'mock_jwt_token_' + user.id + '_' + Date.now();

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      memberSince: user.memberSince
    },
    token
  });
});

// POST /register - mock register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existingUser = users.find(u => u.email === email);

  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newUser = {
    id: Math.max(...users.map(u => u.id), 0) + 1,
    name,
    email,
    avatar: null,
    bio: '',
    memberSince: new Date().toISOString().split('T')[0],
    location: ''
  };

  users.push(newUser);

  // Mock token generation
  const token = 'mock_jwt_token_' + newUser.id + '_' + Date.now();

  res.status(201).json({
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      bio: newUser.bio,
      location: newUser.location,
      memberSince: newUser.memberSince
    },
    token
  });
});

module.exports = router;
