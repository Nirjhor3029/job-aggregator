const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

const sanitizeLimit = (val, def = 20, max = 100) => Math.min(Math.max(parseInt(val) || def, 1), max);
const sanitizePage = (val, def = 1) => Math.max(parseInt(val) || def, 1);

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      location,
      salary_min,
      salary_max,
      jobType,
      source,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const safeLimit = sanitizeLimit(limit);
    const safePage = sanitizePage(page);

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      query.jobType = { $regex: jobType, $options: 'i' };
    }

    if (source) {
      query.source = source;
    }

    if (salary_min || salary_max) {
      query.$and = [];
      if (salary_min) {
        query.$and.push({ salary_max: { $gte: parseInt(salary_min) } });
      }
      if (salary_max) {
        query.$and.push({ salary_min: { $lte: parseInt(salary_max) } });
      }
    }

    const sortOption = { [sort]: order === 'asc' ? 1 : -1 };
    const skip = (safePage - 1) * safeLimit;

    const [jobs, total] = await Promise.all([
      Job.find(query).sort(sortOption).skip(skip).limit(safeLimit),
      Job.countDocuments(query)
    ]);

    res.json({
      jobs,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const myjobsCount = await Job.countDocuments({ source: 'myjobs' });
    const bdjobsCount = await Job.countDocuments({ source: 'bdjobs' });

    res.json({
      totalJobs,
      myjobsCount,
      bdjobsCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const safeLimit = sanitizeLimit(limit);

    const jobs = await Job.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(safeLimit);

    res.json({ jobs, count: jobs.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
