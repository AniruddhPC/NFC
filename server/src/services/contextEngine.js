/**
 * Validates dynamic context against the tag's admin configuration
 */
const validateDynamicContext = (tag, { function: selectedFunction, duration, context = {} }) => {
  const config = tag.configuration || {};
  const allowedFunctions =
    config.functions && config.functions.length > 0
      ? config.functions
      : [
          'vehicle_details',
          'medical_information',
          'emergency',
          'contact',
          'personal_information',
        ];

  // Allow built-in functions as well as user-created custom upload categories (e.g. 'student id')
  if (!selectedFunction || typeof selectedFunction !== 'string' || !selectedFunction.trim()) {
    throw new Error('A valid target function or custom category is required.');
  }

  const durationNum = Number(duration);
  if (!durationNum || isNaN(durationNum) || durationNum <= 0) {
    throw new Error('Duration must be a positive number of seconds.');
  }

  // Access level
  const allowedAccessLevels =
    config.accessLevels && config.accessLevels.length > 0
      ? config.accessLevels.map((lvl) => lvl.toLowerCase())
      : ['public', 'authorized', 'owner_only'];

  const submittedAccess = (context.accessLevel || 'public').toLowerCase();
  if (!allowedAccessLevels.includes(submittedAccess)) {
    throw new Error(
      `Invalid access level '${submittedAccess}'. Allowed: ${allowedAccessLevels.join(', ')}`
    );
  }

  // Dynamic field validation based on admin configured fields
  const configuredFields = config.fields || [];

  for (const field of configuredFields) {
    const val = context[field.name];

    // Check required fields
    if (field.required) {
      if (val === undefined || val === null || val === '') {
        throw new Error(`Field '${field.label || field.name}' is required by tag configuration.`);
      }
      if (field.type === 'location') {
        if (!val.latitude && val.latitude !== 0) {
          throw new Error(`Location coordinates (Latitude & Longitude) are required.`);
        }
      }
    }

    // Type validations
    if (val !== undefined && val !== null && val !== '') {
      if (field.type === 'number') {
        if (isNaN(Number(val))) {
          throw new Error(`Field '${field.label}' must be a valid number.`);
        }
      } else if (field.type === 'location') {
        if (typeof val === 'object') {
          const { latitude, longitude } = val;
          if (latitude !== undefined && latitude !== null && latitude !== '') {
            const lat = Number(latitude);
            if (isNaN(lat) || lat < -90 || lat > 90) {
              throw new Error('Latitude must be between -90 and 90.');
            }
          }
          if (longitude !== undefined && longitude !== null && longitude !== '') {
            const lng = Number(longitude);
            if (isNaN(lng) || lng < -180 || lng > 180) {
              throw new Error('Longitude must be between -180 and 180.');
            }
          }
        }
      } else if (field.type === 'dropdown') {
        if (field.options && field.options.length > 0) {
          const matched = field.options.some(
            (opt) => opt.toLowerCase() === String(val).toLowerCase()
          );
          if (!matched) {
            // Be forgiving if standard mapped intent
            console.warn(`[Context Engine] Value '${val}' not strictly in options for ${field.name}`);
          }
        }
      }
    }
  }

  return {
    validFunction: selectedFunction,
    validDuration: durationNum,
    validAccessLevel: submittedAccess,
  };
};

/**
 * Authoritative evaluation of a Tag's current state.
 * If currentTime >= expiresAt, clears activeState and marks it configuration.
 */
const evaluateTagState = async (tag) => {
  if (!tag) {
    return {
      status: 'not_found',
      function: null,
      accessLevel: null,
      activatedAt: null,
      expiresAt: null,
    };
  }

  const now = new Date();

  // If no active state was set
  if (!tag.activeState || !tag.activeState.expiresAt) {
    return {
      tagId: tag.tagId,
      name: tag.name,
      status: 'configuration',
      function: null,
      accessLevel: null,
      activatedAt: null,
      expiresAt: null,
      remainingSeconds: 0,
      context: null,
      configuration: tag.configuration,
    };
  }

  const expiresAt = new Date(tag.activeState.expiresAt);

  // Check if expired
  if (now.getTime() >= expiresAt.getTime()) {
    // State has expired! Reset in DB lazily
    tag.activeState = null;
    await tag.save();

    return {
      tagId: tag.tagId,
      name: tag.name,
      status: 'configuration',
      function: null,
      accessLevel: null,
      activatedAt: null,
      expiresAt: null,
      remainingSeconds: 0,
      context: null,
      reason: 'expired',
      configuration: tag.configuration,
    };
  }

  // Active state is still valid
  const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

  return {
    tagId: tag.tagId,
    name: tag.name,
    status: 'active',
    function: tag.activeState.function,
    accessLevel: tag.activeState.accessLevel,
    activatedAt: tag.activeState.activatedAt,
    expiresAt: tag.activeState.expiresAt,
    remainingSeconds,
    context: tag.activeState.context,
    configuration: tag.configuration,
  };
};

module.exports = {
  validateDynamicContext,
  evaluateTagState,
};
