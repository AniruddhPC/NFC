const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  uploadDocument,
  getUserDocuments,
  getTagDocumentsPublic,
  deleteDocument,
  getTagCategories,
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

// Upload a document (Normal user)
router.post('/upload', protect, upload.single('file'), uploadDocument);

// Get user documents (Private)
router.get('/', protect, getUserDocuments);

// Get documents for tag (Public)
router.get('/tag/:tagId', getTagDocumentsPublic);

// Get unique custom categories for a tag (Public)
router.get('/tag/:tagId/categories', getTagCategories);

// Delete document (Private)
router.delete('/:id', protect, deleteDocument);

module.exports = router;
