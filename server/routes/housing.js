const router = require('express').Router();
const { housing } = require('../data/mock-data');

// GET / - list housing with filtering
router.get('/', (req, res) => {
  const { type, minPrice, maxPrice, bedrooms } = req.query;

  let filtered = [...housing];

  if (type) {
    filtered = filtered.filter(h => h.type === type);
  }

  if (minPrice) {
    filtered = filtered.filter(h => h.price >= parseInt(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(h => h.price <= parseInt(maxPrice));
  }

  if (bedrooms) {
    filtered = filtered.filter(h => h.bedrooms === parseInt(bedrooms));
  }

  res.json(filtered);
});

// GET /:id - get single housing
router.get('/:id', (req, res) => {
  const house = housing.find(h => h.id === parseInt(req.params.id));

  if (!house) {
    return res.status(404).json({ error: 'Housing not found' });
  }

  res.json(house);
});

// POST / - create housing
router.post('/', (req, res) => {
  const { type, bedrooms, bathrooms, price, address, description, petFriendly, furnished, parking, utilities, contactName, contactPhone, contactEmail } = req.body;

  if (!type || bedrooms === undefined || bathrooms === undefined || !price) {
    return res.status(400).json({ error: 'Type, bedrooms, bathrooms, and price are required' });
  }

  const newHousing = {
    id: Math.max(...housing.map(h => h.id), 0) + 1,
    type,
    bedrooms,
    bathrooms,
    price,
    address: address || '',
    description: description || '',
    image: null,
    postedAt: new Date().toISOString().split('T')[0],
    petFriendly: petFriendly || false,
    furnished: furnished || false,
    parking: parking || '',
    utilities: utilities || '',
    contactName: contactName || '',
    contactPhone: contactPhone || '',
    contactEmail: contactEmail || ''
  };

  housing.push(newHousing);
  res.status(201).json(newHousing);
});

module.exports = router;
