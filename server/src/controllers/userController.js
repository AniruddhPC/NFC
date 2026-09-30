const User = require('../models/User');
const Tag = require('../models/Tag');
const Vehicle = require('../models/Vehicle');
const MedicalInformation = require('../models/MedicalInformation');
const EmergencyInformation = require('../models/EmergencyInformation');
const ContactInformation = require('../models/ContactInformation');
const PersonalInformation = require('../models/PersonalInformation');

// @desc    Get user profile with their registered tags
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const tags = await Tag.find({ ownerId: req.user._id });

    res.json({
      user,
      tags,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user personal profile details
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { name, phone, organization, bio, password } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (organization !== undefined) user.organization = organization.trim();
    if (bio !== undefined) user.bio = bio.trim();

    if (password) {
      user.password = password;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        personId: user.personId,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: user.organization,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all functional documents for a tag owned by the user
// @route   GET /api/user/documents/:tagId
// @access  Private
const getTagDocuments = async (req, res) => {
  try {
    const tagId = req.params.tagId.toUpperCase();
    const tag = await Tag.findOne({ tagId });

    if (!tag) {
      return res.status(404).json({ message: `Tag '${tagId}' not found.` });
    }

    // Verify ownership or admin
    if (tag.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view documents for this tag.' });
    }

    const [vehicle, medical, emergency, contact, personal] = await Promise.all([
      Vehicle.findOne({ tagId }),
      MedicalInformation.findOne({ tagId }),
      EmergencyInformation.findOne({ tagId }),
      ContactInformation.findOne({ tagId }),
      PersonalInformation.findOne({ tagId }),
    ]);

    res.json({
      tagId,
      vehicle,
      medical,
      emergency,
      contact,
      personal,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add / Update a functional document for a tag
// @route   PUT /api/user/documents/:tagId/:function
// @access  Private
const saveTagDocument = async (req, res) => {
  try {
    const tagId = req.params.tagId.toUpperCase();
    const funcName = req.params.function;
    const payload = req.body;

    const tag = await Tag.findOne({ tagId });
    if (!tag) {
      return res.status(404).json({ message: `Tag '${tagId}' not found.` });
    }

    // Verify ownership or admin
    if (tag.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify documents for this tag.' });
    }

    let document = null;

    switch (funcName) {
      case 'vehicle':
      case 'vehicle_details':
        document = await Vehicle.findOneAndUpdate(
          { tagId },
          { ...payload, tagId },
          { upsert: true, new: true, runValidators: true }
        );
        break;

      case 'medical':
      case 'medical_information':
        document = await MedicalInformation.findOneAndUpdate(
          { tagId },
          { ...payload, tagId },
          { upsert: true, new: true, runValidators: true }
        );
        break;

      case 'emergency':
        document = await EmergencyInformation.findOneAndUpdate(
          { tagId },
          { ...payload, tagId },
          { upsert: true, new: true, runValidators: true }
        );
        break;

      case 'contact':
        document = await ContactInformation.findOneAndUpdate(
          { tagId },
          { ...payload, tagId },
          { upsert: true, new: true, runValidators: true }
        );
        break;

      case 'personal_information':
        document = await PersonalInformation.findOneAndUpdate(
          { tagId },
          { ...payload, tagId },
          { upsert: true, new: true, runValidators: true }
        );
        break;

      default:
        return res.status(400).json({ message: `Invalid function type '${funcName}'.` });
    }

    res.json({
      success: true,
      message: `${funcName} details saved successfully for tag ${tagId}.`,
      document,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getTagDocuments,
  saveTagDocument,
};
