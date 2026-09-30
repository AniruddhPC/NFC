const Tag = require('../models/Tag');
const User = require('../models/User');

// @desc    Get all tags in the system for admin overview
// @route   GET /api/admin/tags
// @access  Admin
const getAllAdminTags = async (req, res) => {
  try {
    const tags = await Tag.find()
      .populate('ownerId', 'name email personId role')
      .sort({ createdAt: -1 });

    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new NFC tag (Admin)
// @route   POST /api/admin/tags
// @access  Admin
const createAdminTag = async (req, res) => {
  try {
    const { tagId, name, ownerEmail, configuration } = req.body;

    if (!tagId) {
      return res.status(400).json({ message: 'Tag ID is required.' });
    }

    const cleanTagId = tagId.trim().toUpperCase();
    const existing = await Tag.findOne({ tagId: cleanTagId });
    if (existing) {
      return res.status(400).json({ message: `Tag with ID '${cleanTagId}' already exists.` });
    }

    let ownerId = req.user._id;
    if (ownerEmail) {
      const targetUser = await User.findOne({ email: ownerEmail.trim().toLowerCase() });
      if (targetUser) {
        ownerId = targetUser._id;
      }
    }

    const permanentUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/tag/${cleanTagId}`;

    const newTag = await Tag.create({
      tagId: cleanTagId,
      name: name || `NFC Tag ${cleanTagId}`,
      permanentUrl,
      ownerId,
      defaultFunction: 'configuration',
      configuration: configuration || undefined,
    });

    res.status(201).json({
      success: true,
      message: `Tag ${cleanTagId} successfully created.`,
      tag: newTag,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a tag's dynamic context configuration (Admin Core Feature)
// @route   PUT /api/admin/tags/:tagId/config
// @access  Admin
const updateTagConfig = async (req, res) => {
  try {
    const tagId = req.params.tagId.toUpperCase();
    const { fields, functions, accessLevels, defaultDuration, name } = req.body;

    const tag = await Tag.findOne({ tagId });
    if (!tag) {
      return res.status(404).json({ message: `Tag '${tagId}' not found.` });
    }

    if (name) {
      tag.name = name;
    }

    // Initialize or update configuration
    if (!tag.configuration) {
      tag.configuration = {};
    }

    if (Array.isArray(fields)) {
      // Validate each field has name, label, type
      for (const field of fields) {
        if (!field.name || !field.label) {
          return res.status(400).json({
            message: 'Each context field must have a valid name and label.',
          });
        }
        if (!['text', 'dropdown', 'location', 'number', 'datetime'].includes(field.type)) {
          return res.status(400).json({
            message: `Invalid field type '${field.type}'. Must be text, dropdown, location, number, or datetime.`,
          });
        }
      }
      tag.configuration.fields = fields;
    }

    if (Array.isArray(functions)) {
      tag.configuration.functions = functions;
    }

    if (Array.isArray(accessLevels)) {
      tag.configuration.accessLevels = accessLevels;
    }

    if (defaultDuration !== undefined) {
      tag.configuration.defaultDuration = Number(defaultDuration) || 300;
    }

    tag.markModified('configuration');
    await tag.save();

    res.json({
      success: true,
      message: `Dynamic configuration for tag '${tagId}' updated successfully.`,
      configuration: tag.configuration,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users in the system (Admin)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Fetch tag counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const tagCount = await Tag.countDocuments({ ownerId: u._id });
        return {
          ...u.toObject(),
          tagCount,
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user's role (Admin)
// @route   PUT /api/admin/users/:userId/role
// @access  Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'user', 'owner', 'authorized'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User '${user.name}' role updated to '${role}'.`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAdminTags,
  createAdminTag,
  updateTagConfig,
  getAllUsers,
  updateUserRole,
};
