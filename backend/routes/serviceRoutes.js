// backend/routes/serviceRoutes.js
const express = require('express');
const Service = require('../models/service.js');
const auth = require('../middleware/auth');
const router = express.Router();

// Create service
router.post('/', auth, async (req, res) => {
  try {
    const service = new Service({
      ...req.body,
      provider: req.user._id
    });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all services with filters
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.status) filters.status = req.query.status;

    const services = await Service.find(filters)
      .populate('provider', 'companyName email')
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'companyName email contactInfo');
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update service
router.patch('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      provider: req.user._id
    });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    Object.keys(req.body).forEach(update => {
      service[update] = req.body[update];
    });
    await service.save();
    res.json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete service
router.delete('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      provider: req.user._id
    });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;