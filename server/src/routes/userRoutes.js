const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getTagDocuments,
  saveTagDocument,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/profile').get(getUserProfile).put(updateUserProfile);
router.route('/documents/:tagId').get(getTagDocuments);
router.route('/documents/:tagId/:function').put(saveTagDocument);

module.exports = router;
