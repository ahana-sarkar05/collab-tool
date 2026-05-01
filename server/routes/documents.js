const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET all documents
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { owner: req.userId },
        { collaborators: req.userId }
      ],
    }).sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single document
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create document
router.post('/', async (req, res) => {
  try {
    const document = await Document.create({
      title: req.body.title || 'Untitled Document',
      content: '',
      owner: req.userId,
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH update document
router.patch('/:id', async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content, title: req.body.title },
      { returnDocument: 'after' }
    );
    console.log('💾 Document saved:', req.params.id);
    res.json(document);
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE document
router.delete('/:id', async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;