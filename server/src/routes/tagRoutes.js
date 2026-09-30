const express = require('express');
const router = express.Router();
const {
  getTags,
  getTagById,
  getTagState,
  getTagConfig,
  activateTag,
  deactivateTag,
  getTagFunctionData,
} = require('../controllers/tagController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Base tag operations
router.route('/').get(protect, getTags);

// Public state endpoint (Core architectural requirement)
router.route('/:tagId/state').get(optionalAuth, getTagState);

// Public tag dynamic configuration endpoint
router.route('/:tagId/config').get(optionalAuth, getTagConfig);

// Activation & Deactivation
router.route('/:tagId/activate').post(optionalAuth, activateTag);
router.route('/:tagId/deactivate').post(protect, deactivateTag);

// Tag info
router.route('/:tagId').get(optionalAuth, getTagById);

// Specific function data endpoints
router.get('/:tagId/vehicle', optionalAuth, (req, res, next) => {
  req.params.function = 'vehicle_details';
  getTagFunctionData(req, res, next);
});

router.get('/:tagId/medical', optionalAuth, (req, res, next) => {
  req.params.function = 'medical_information';
  getTagFunctionData(req, res, next);
});

router.get('/:tagId/emergency', optionalAuth, (req, res, next) => {
  req.params.function = 'emergency';
  getTagFunctionData(req, res, next);
});

router.get('/:tagId/contact', optionalAuth, (req, res, next) => {
  req.params.function = 'contact';
  getTagFunctionData(req, res, next);
});

router.get('/:tagId/personal', optionalAuth, (req, res, next) => {
  req.params.function = 'personal_information';
  getTagFunctionData(req, res, next);
});

// Generalized data endpoint (GET /api/tags/:tagId/data/:function)
router.get('/:tagId/data/:function', optionalAuth, getTagFunctionData);

module.exports = router;
