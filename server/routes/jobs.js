const router = require('express').Router();
const { jobs } = require('../data/mock-data');

// GET / - list jobs with filtering
router.get('/', (req, res) => {
  const { category, type, search } = req.query;

  let filtered = [...jobs];

  if (category) {
    filtered = filtered.filter(j => j.category === category);
  }

  if (type) {
    filtered = filtered.filter(j => j.type === type);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(j =>
      j.title.toLowerCase().includes(searchLower) ||
      j.company.toLowerCase().includes(searchLower) ||
      j.description.toLowerCase().includes(searchLower)
    );
  }

  res.json(filtered);
});

// GET /:id - get single job
router.get('/:id', (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.params.id));

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

// POST / - create job
router.post('/', (req, res) => {
  const { title, company, category, type, description, salary, location, skills, benefits } = req.body;

  if (!title || !company) {
    return res.status(400).json({ error: 'Title and company are required' });
  }

  const newJob = {
    id: Math.max(...jobs.map(j => j.id), 0) + 1,
    title,
    company,
    category: category || '',
    type: type || 'full-time',
    description: description || '',
    salary: salary || '',
    location: location || '',
    postedAt: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    skills: skills || [],
    benefits: benefits || []
  };

  jobs.push(newJob);
  res.status(201).json(newJob);
});

module.exports = router;
