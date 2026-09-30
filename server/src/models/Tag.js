const mongoose = require('mongoose');

const fieldConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'dropdown', 'location', 'number', 'datetime'],
      default: 'text',
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [String],
      default: [],
    },
    defaultValue: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const tagConfigSchema = new mongoose.Schema(
  {
    fields: {
      type: [fieldConfigSchema],
      default: [
        {
          name: 'location',
          label: 'Location',
          type: 'location',
          required: false,
          options: [],
        },
        {
          name: 'intent',
          label: 'Intent / Purpose',
          type: 'dropdown',
          required: true,
          options: ['Emergency', 'Medical', 'Vehicle', 'Contact', 'Personal'],
        },
        {
          name: 'accessLevel',
          label: 'Access Level',
          type: 'dropdown',
          required: true,
          options: ['Public', 'Authorized Users', 'Owner Only'],
        },
      ],
    },
    functions: {
      type: [String],
      default: [
        'vehicle_details',
        'medical_information',
        'emergency',
        'contact',
        'personal_information',
      ],
    },
    accessLevels: {
      type: [String],
      default: ['public', 'authorized', 'owner_only'],
    },
    defaultDuration: {
      type: Number,
      default: 300,
    },
  },
  { _id: false }
);

const activeStateSchema = new mongoose.Schema(
  {
    function: {
      type: String,
      required: true,
    },
    accessLevel: {
      type: String,
      default: 'public',
      required: true,
    },
    activatedAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    durationSeconds: {
      type: Number,
      required: true,
    },
    context: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const tagSchema = new mongoose.Schema(
  {
    tagId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'NFC Tag',
    },
    permanentUrl: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    defaultFunction: {
      type: String,
      default: 'configuration',
    },
    configuration: {
      type: tagConfigSchema,
      default: () => ({}),
    },
    activeState: {
      type: activeStateSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Tag', tagSchema);
