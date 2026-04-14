const router = require('express').Router();
const { marketplace } = require('../data/mock-data');

// GET / - list marketplace items with filtering
router.get('/', (req, res) => {
  const { category, sort } = req.query;

  let filtered = [...marketplace];

  if (category) {
    filtered = filtered.filter(m => m.category === category);
  }

  if (sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    filtered.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  }

  res.json(filtered);
});

// GET /:id - get single marketplace item
router.get('/:id', (req, res) => {
  const item = marketplace.find(m => m.id === parseInt(req.params.id));

  if (!item) {
    return res.status(404).json({ error: 'Marketplace item not found' });
  }

  res.json(item);
});

// POST / - create marketplace item
router.post('/', (req, res) => {
  const { title, category, description, price, condition, sellerName, sellerPhone, sellerEmail, tags } = req.body;

  if (!title || !category || price === undefined) {
    return res.status(400).json({ error: 'Title, category, and price are required' });
  }

  const newItem = {
    id: Math.max(...marketplace.map(m => m.id), 0) + 1,
    title,
    category,
    description: description || '',
    price,
    condition: condition || 'fair',
    sellerName: sellerName || '',
    sellerPhone: sellerPhone || '',
    sellerEmail: sellerEmail || '',
    postedAt: new Date().toISOString().split('T')[0],
    image: null,
    tags: tags || []
  };

  marketplace.push(newItem);
  res.status(201).json(newItem);
});

module.exports = router;
