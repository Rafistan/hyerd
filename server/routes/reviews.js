const router = require('express').Router();
const { reviews } = require('../data/mock-data');

// GET /:businessId - get reviews for business
router.get('/:businessId', (req, res) => {
  const businessId = parseInt(req.params.businessId);
  const businessReviews = reviews.filter(r => r.businessId === businessId);

  res.json(businessReviews);
});

// POST / - create review
router.post('/', (req, res) => {
  const { businessId, userId, userName, rating, title, content } = req.body;

  if (!businessId || !userId || !rating || !title || !content) {
    return res.status(400).json({ error: 'BusinessId, userId, rating, title, and content are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const newReview = {
    id: Math.max(...reviews.map(r => r.id), 0) + 1,
    businessId,
    userId,
    userName: userName || 'Anonymous',
    rating,
    title,
    content,
    postedAt: new Date().toISOString().split('T')[0]
  };

  reviews.push(newReview);
  res.status(201).json(newReview);
});

module.exports = router;
