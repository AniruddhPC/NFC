const express = require('express');
const router = express.Router();
const {
  getAllAdminTags,
  createAdminTag,
  updateTagConfig,
  getAllUsers,
  updateUserRole,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

router.route('/tags').get(getAllAdminTags).post(createAdminTag);
router.route('/tags/:tagId/config').put(updateTagConfig);

router.route('/users').get(getAllUsers);
router.route('/users/:userId/role').put(updateUserRole);

module.exports = router;
