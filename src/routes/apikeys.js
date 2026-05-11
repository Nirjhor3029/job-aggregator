const express = require('express');
const router = express.Router();
const ApiKey = require('../models/ApiKey');

router.post('/generate', async (req, res) => {
  try {
    const { name, tier } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: 'API key name is required'
      });
    }

    const validTiers = ['free', 'paid'];
    const selectedTier = validTiers.includes(tier) ? tier : 'free';

    const newKey = await ApiKey.generateKey(name.trim(), selectedTier);

    res.status(201).json({
      message: 'API key generated successfully. Save this key - it will not be shown again.',
      data: newKey
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const keys = await ApiKey.find({}, 'name tier rateLimit active lastUsedAt createdAt')
      .sort({ createdAt: -1 });

    res.json({
      count: keys.length,
      keys
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/activate', async (req, res) => {
  try {
    const key = await ApiKey.findById(req.params.id);

    if (!key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    key.active = true;
    await key.save();

    res.json({
      message: 'API key activated',
      data: {
        _id: key._id,
        name: key.name,
        active: key.active
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/deactivate', async (req, res) => {
  try {
    const key = await ApiKey.findById(req.params.id);

    if (!key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    key.active = false;
    await key.save();

    res.json({
      message: 'API key deactivated',
      data: {
        _id: key._id,
        name: key.name,
        active: key.active
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const key = await ApiKey.findByIdAndDelete(req.params.id);

    if (!key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({
      message: 'API key deleted',
      data: {
        _id: key._id,
        name: key.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
