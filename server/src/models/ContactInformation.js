const mongoose = require('mongoose');

const contactInformationSchema = new mongoose.Schema(
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
    title: {
      type: String,
      default: 'Senior Embedded Systems Architect',
    },
    organization: {
      type: String,
      default: 'Apex Dynamic Labs Inc.',
    },
    email: {
      type: String,
      required: true,
      default: 'alex.rivera@apexlabs.example.com',
    },
    phone: {
      type: String,
      required: true,
      default: '+1 (555) 789-0123',
    },
    address: {
      type: String,
      default: '742 Innovation Way, Suite 400, San Francisco, CA',
    },
    website: {
      type: String,
      default: 'https://apexlabs.example.com',
    },
    notes: {
      type: String,
      default: 'Available for consultations Mon-Fri 9:00 AM - 5:00 PM PST.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ContactInformation', contactInformationSchema);
