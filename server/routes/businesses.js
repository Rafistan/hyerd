const router = require('express').Router();
const { businesses } = require('../data/mock-data');

// GET / - list all businesses with filtering
router.get('/', (req, res) => {
  const { category, search, verified } = req.query;

  let filtered = [...businesses];

  if (category) {
    filtered = filtered.filter(b => b.category === category);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(b =>
      b.name.toLowerCase().includes(searchLower) ||
      b.description.toLowerCase().includes(searchLower) ||
      b.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  if (verified !== undefined) {
    filtered = filtered.filter(b => b.verified === (verified === 'true'));
  }

  res.json(filtered);
});

// GET /:id - get single business
router.get('/:id', (req, res) => {
  const business = businesses.find(b => b.id === parseInt(req.params.id));

  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }

  res.json(business);
});

// POST / - create business
router.post('/', (req, res) => {
  const { name, category, description, address, phone, email, website, tags } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'Name and category are required' });
  }

  const newBusiness = {
    id: Math.max(...businesses.map(b => b.id), 0) + 1,
    name,
    category,
    description: description || '',
    address: address || '',
    phone: phone || '',
    email: email || '',
    website: website || '',
    rating: 0,
    reviewCount: 0,
    image: null,
    hours: '',
    verified: false,
    tags: tags || [],
    createdAt: new Date().toISOString().split('T')[0]
  };

  businesses.push(newBusiness);
  res.status(201).json(newBusiness);
});

module.exports = router;
