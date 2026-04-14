const router = require('express').Router();
const { events } = require('../data/mock-data');

// GET / - list events with filtering
router.get('/', (req, res) => {
  const { category } = req.query;

  let filtered = [...events];

  if (category) {
    filtered = filtered.filter(e => e.category === category);
  }

  res.json(filtered);
});

// GET /:id - get single event
router.get('/:id', (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.json(event);
});

// POST / - create event
router.post('/', (req, res) => {
  const { name, category, description, date, time, location, address, organizer, contact, tags } = req.body;

  if (!name || !category || !date) {
    return res.status(400).json({ error: 'Name, category, and date are required' });
  }

  const newEvent = {
    id: Math.max(...events.map(e => e.id), 0) + 1,
    name,
    category,
    description: description || '',
    date,
    time: time || '',
    location: location || '',
    address: address || '',
    organizer: organizer || '',
    contact: contact || '',
    image: null,
    attendees: 0,
    tags: tags || []
  };

  events.push(newEvent);
  res.status(201).json(newEvent);
});

module.exports = router;
