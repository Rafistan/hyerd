const router = require('express').Router();
const { cars } = require('../data/mock-data');

// GET / - list cars with filtering
router.get('/', (req, res) => {
  const { make, condition, minPrice, maxPrice } = req.query;

  let filtered = [...cars];

  if (make) {
    filtered = filtered.filter(c => c.make.toLowerCase() === make.toLowerCase());
  }

  if (condition) {
    filtered = filtered.filter(c => c.condition === condition);
  }

  if (minPrice) {
    filtered = filtered.filter(c => c.price >= parseInt(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(c => c.price <= parseInt(maxPrice));
  }

  res.json(filtered);
});

// GET /:id - get single car
router.get('/:id', (req, res) => {
  const car = cars.find(c => c.id === parseInt(req.params.id));

  if (!car) {
    return res.status(404).json({ error: 'Car not found' });
  }

  res.json(car);
});

// POST / - create car
router.post('/', (req, res) => {
  const { make, model, year, price, mileage, condition, transmission, fuel, color, description, sellerName, sellerPhone, sellerEmail } = req.body;

  if (!make || !model || !year || !price) {
    return res.status(400).json({ error: 'Make, model, year, and price are required' });
  }

  const newCar = {
    id: Math.max(...cars.map(c => c.id), 0) + 1,
    make,
    model,
    year,
    price,
    mileage: mileage || 0,
    condition: condition || 'fair',
    transmission: transmission || '',
    fuel: fuel || '',
    color: color || '',
    description: description || '',
    sellerName: sellerName || '',
    sellerPhone: sellerPhone || '',
    sellerEmail: sellerEmail || '',
    postedAt: new Date().toISOString().split('T')[0],
    image: null
  };

  cars.push(newCar);
  res.status(201).json(newCar);
});

module.exports = router;
