const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

// @desc    Upload a new file document
// @route   POST /api/documents/upload
// @access  Private (Normal User)
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a file to upload.' });
    }

    const { title, category, description, tagId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Document title is required.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const newDoc = await Document.create({
      userId: req.user._id,
      tagId: (tagId || 'TAG001').toUpperCase(),
      title: title.trim(),
      category: category || 'general',
      description: description ? description.trim() : '',
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileUrl,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      document: newDoc,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's uploaded documents
// @route   GET /api/documents
// @access  Private
const getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get documents associated with a tag (Public / Visitor)
// @route   GET /api/documents/tag/:tagId
// @access  Public
const getTagDocumentsPublic = async (req, res) => {
  try {
    const tagId = req.params.tagId.toUpperCase();
    const documents = await Document.find({ tagId }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an uploaded document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Verify ownership
    if (doc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this document.' });
    }

    // Delete file from disk if exists
    if (fs.existsSync(doc.filePath)) {
      try {
        fs.unlinkSync(doc.filePath);
      } catch (err) {
        console.warn('Could not remove file from disk:', err.message);
      }
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Document deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unique custom categories for a tag (user-created "Other" categories)
// @route   GET /api/documents/tag/:tagId/categories
// @access  Public
const getTagCategories = async (req, res) => {
  try {
    const tagId = req.params.tagId.toUpperCase();
    const builtInCategories = ['vehicle', 'medical', 'emergency', 'identity', 'general'];
    const categories = await Document.distinct('category', { tagId });
    // Return only custom categories (user-created via "Other")
    const customCategories = categories.filter(
      (cat) => cat && !builtInCategories.includes(cat.toLowerCase())
    );
    res.json({ customCategories, allCategories: categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getUserDocuments,
  getTagDocumentsPublic,
  deleteDocument,
  getTagCategories,
};
