const Tag = require('../models/Tag');
const Vehicle = require('../models/Vehicle');
const MedicalInformation = require('../models/MedicalInformation');
const EmergencyInformation = require('../models/EmergencyInformation');
const ContactInformation = require('../models/ContactInformation');
const PersonalInformation = require('../models/PersonalInformation');
const {
  validateDynamicContext,
  evaluateTagState,
} = require('../services/contextEngine');

// @desc    Get all tags for the logged-in user/owner
// @route   GET /api/tags
// @access  Private
const getTags = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { ownerId: req.user._id };
    const tags = await Tag.find(query).sort({ createdAt: -1 });

    // Evaluate state dynamically for each tag
    const evaluatedTags = await Promise.all(
      tags.map(async (tag) => {
        const state = await evaluateTagState(tag);
        return {
          id: tag._id,
          tagId: tag.tagId,
          name: tag.name,
          permanentUrl: tag.permanentUrl,
          defaultFunction: tag.defaultFunction,
          configuration: tag.configuration,
          state,
          createdAt: tag.createdAt,
        };
      })
    );

    res.json(evaluatedTags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tag details by tagId
// @route   GET /api/tags/:tagId
// @access  Public / Optional Auth
const getTagById = async (req, res) => {
  try {
    const tagId = req.params.tagId.toUpperCase();
    const tag = await Tag.findOne({ tagId });

    if (!tag) {
      return res.status(404).json({ message: `Tag '${tagId}' not found.` });
    }

    const state = await evaluateTagState(tag);

    res.json({
      id: tag._id,
      tagId: tag.tagId,
      name: tag.name,
      permanentUrl: tag.permanentUrl,
      defaultFunction: tag.defaultFunction,
      configuration: tag.configuration,
      isOwner: req.user
        ? tag.ownerId.toString() === req.user._id.toString() || req.user.role === 'admin'
        : false,
      state,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authoritative tag state (Central Core Endpoint)
// @route   GET /api/tags/:tagId/state
// @access  Public
const getTagState = async (req, res) => {
  try {
    const tagId = req.params.tagId.toUpperCase();
    const tag = await Tag.findOne({ tagId });

    if (!tag) {
      return res.status(404).json({
        tagId,
        status: 'not_found',
        message: `Tag '${tagId}' not found.`,
      });
    }

    const evaluated = await evaluateTagState(tag);

    res.json({
      tagId: evaluated.tagId,
      name: evaluated.name,
      status: evaluated.status,
      function: evaluated.function,
      accessLevel: evaluated.accessLevel,
      activatedAt: evaluated.activatedAt,
      expiresAt: evaluated.expiresAt,
      remainingSeconds: evaluated.remainingSeconds,
      context: evaluated.context,
      configuration: tag.configuration,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dynamic configuration for a tag
// @route   GET /api/tags/:tagId/config
// @access  Public
const getTagConfig = async (req, res) => {
  try {
    const tagId = req.params.tagId.toUpperCase();
    const tag = await Tag.findOne({ tagId });

    if (!tag) {
      return res.status(404).json({ message: `Tag '${tagId}' not found.` });
    }

    res.json({
      tagId: tag.tagId,
      name: tag.name,
      configuration: tag.configuration || {},
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Activate tag with a dynamic context
// @route   POST /api/tags/:tagId/activate
// @access  Private (Owner or Admin or Public Visitor with Context)
const activateTag = async (req, res) => {
  try {
    const tagId = req.params.tagId.toUpperCase();
    const { function: selectedFunction, duration, context = {} } = req.body;

    const tag = await Tag.findOne({ tagId });
    if (!tag) {
      return res.status(404).json({ message: `Tag '${tagId}' not found.` });
    }

    // Check ownership if user is logged in
    const isOwnerOrAdmin =
      req.user &&
      (tag.ownerId.toString() === req.user._id.toString() || req.user.role === 'admin');

    // If tag requires authenticated owner only
    if (tag.activeState?.accessLevel === 'owner_only' && !isOwnerOrAdmin) {
      return res.status(403).json({ message: 'Only the tag owner can modify this tag.' });
    }

    // Validate payload against tag's dynamic configuration via Context Engine
    const { validFunction, validDuration, validAccessLevel } = validateDynamicContext(tag, {
      function: selectedFunction,
      duration: duration || tag.configuration?.defaultDuration || 300,
      context,
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + validDuration * 1000);

    // Save full dynamic context (including custom fields like vehicleType, emergencyLevel, etc.)
    const activeState = {
      function: validFunction,
      accessLevel: validAccessLevel,
      activatedAt: now,
      expiresAt: expiresAt,
      durationSeconds: validDuration,
      context: {
        ...context,
        time: context?.time ? new Date(context.time) : now,
        personId: req.user?.personId || context?.personId || 'VISITOR',
        intent: context?.intent || validFunction,
        accessLevel: validAccessLevel,
      },
    };

    tag.activeState = activeState;
    tag.markModified('activeState');
    await tag.save();

    res.json({
      success: true,
      message: `Tag ${tagId} successfully activated for ${validDuration}s as ${validFunction}.`,
      state: {
        tagId: tag.tagId,
        status: 'active',
        function: validFunction,
        accessLevel: validAccessLevel,
        activatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        remainingSeconds: validDuration,
        context: activeState.context,
        configuration: tag.configuration,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Deactivate tag context manually
// @route   POST /api/tags/:tagId/deactivate
// @access  Private (Owner or Admin)
const deactivateTag = async (req, res) => {
  try {
    const tagId = req.params.tagId.toUpperCase();
    const tag = await Tag.findOne({ tagId });

    if (!tag) {
      return res.status(404).json({ message: `Tag '${tagId}' not found.` });
    }

    const isOwnerOrAdmin =
      req.user &&
      (tag.ownerId.toString() === req.user._id.toString() || req.user.role === 'admin');

    if (!isOwnerOrAdmin) {
      return res.status(403).json({ message: 'Only the tag owner or admin can deactivate this tag.' });
    }

    tag.activeState = null;
    await tag.save();

    const evaluated = await evaluateTagState(tag);

    res.json({
      success: true,
      message: `Tag ${tagId} has been reset to default configuration state.`,
      state: evaluated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch function data for an active tag with access control enforcement
// @route   GET /api/tags/:tagId/data/:function OR GET /api/tags/:tagId/:function
// @access  Public / Protected depending on accessLevel
const getTagFunctionData = async (req, res) => {
  try {
    const tagId = req.params.tagId.toUpperCase();
    const requestedFunction = req.params.function || req.params.dataFunction;

    const tag = await Tag.findOne({ tagId });
    if (!tag) {
      return res.status(404).json({ message: `Tag '${tagId}' not found.` });
    }

    // Authoritative state check
    const evaluated = await evaluateTagState(tag);

    if (evaluated.status !== 'active') {
      return res.status(410).json({
        message: 'This tag is not currently in an active context or has expired.',
        tagStatus: evaluated.status,
      });
    }

    if (evaluated.function !== requestedFunction) {
      return res.status(400).json({
        message: `Tag is active with function '${evaluated.function}', not '${requestedFunction}'.`,
        activeFunction: evaluated.function,
      });
    }

    // Access control evaluation
    const accessLevel = evaluated.accessLevel?.toLowerCase() || 'public';
    const isOwnerOrAdmin =
      req.user &&
      (tag.ownerId.toString() === req.user._id.toString() || req.user.role === 'admin');
    const isAuthenticated = !!req.user;

    if (accessLevel === 'owner_only' && !isOwnerOrAdmin) {
      return res.status(403).json({
        message: 'Access Denied: This information is restricted to the tag owner only.',
        requiresAuth: true,
      });
    }

    if (accessLevel === 'authorized' && !isAuthenticated) {
      return res.status(401).json({
        message: 'Access Denied: You must be logged in as an authorized user to view this information.',
        requiresAuth: true,
      });
    }

    // Retrieve corresponding data document based on function
    let data = null;
    switch (requestedFunction) {
      case 'vehicle_details':
        data = await Vehicle.findOne({ tagId });
        break;
      case 'medical_information':
        data = await MedicalInformation.findOne({ tagId });
        break;
      case 'emergency':
        data = await EmergencyInformation.findOne({ tagId });
        break;
      case 'contact':
        data = await ContactInformation.findOne({ tagId });
        break;
      case 'personal_information':
        data = await PersonalInformation.findOne({ tagId });
        break;
      default:
        return res.status(400).json({ message: `Unsupported function '${requestedFunction}'.` });
    }

    if (!data) {
      return res.status(404).json({
        message: `No ${requestedFunction} record configured for tag '${tagId}'.`,
      });
    }

    res.json({
      tagId,
      function: requestedFunction,
      accessLevel,
      expiresAt: evaluated.expiresAt,
      remainingSeconds: evaluated.remainingSeconds,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTags,
  getTagById,
  getTagState,
  getTagConfig,
  activateTag,
  deactivateTag,
  getTagFunctionData,
};
