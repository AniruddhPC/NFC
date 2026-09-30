const mongoose = require('mongoose');

const personalInformationSchema = new mongoose.Schema(
  {
    tagId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      default: 'Alex Rivera',
    },
    preferredName: {
      type: String,
      default: 'Alex',
    },
    bio: {
      type: String,
      default: 'Hardware hacker, IoT enthusiast, and mobile systems researcher.',
    },
    language: {
      type: String,
      default: 'English, Spanish',
    },
    nationality: {
      type: String,
      default: 'United States',
    },
    identityReference: {
      type: String,
      default: 'ID-PASSPORT-US-99120',
    },
    socialLinks: {
      linkedin: {
        type: String,
        default: 'https://linkedin.com/in/alex-rivera-example',
      },
      twitter: {
        type: String,
        default: 'https://twitter.com/alex_rivera_iot',
      },
      github: {
        type: String,
        default: 'https://github.com/alexrivera-example',
      },
    },
    notes: {
      type: String,
      default: 'Authorized personnel for Lab Cluster Beta access.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PersonalInformation', personalInformationSchema);
