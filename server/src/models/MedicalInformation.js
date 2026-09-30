const mongoose = require('mongoose');

const medicalInformationSchema = new mongoose.Schema(
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
    },
    bloodGroup: {
      type: String,
      required: true,
      default: 'O+',
    },
    allergies: {
      type: [String],
      default: ['Penicillin', 'Peanuts'],
    },
    chronicConditions: {
      type: [String],
      default: ['Asthma (Mild)'],
    },
    medications: {
      type: [String],
      default: ['Albuterol Inhaler (PRN)'],
    },
    emergencyContactName: {
      type: String,
      required: true,
      default: 'Dr. Sarah Connor',
    },
    emergencyContactPhone: {
      type: String,
      required: true,
      default: '+1 (555) 987-6543',
    },
    physicianName: {
      type: String,
      default: 'Dr. Raymond Palmer, MD',
    },
    physicianPhone: {
      type: String,
      default: '+1 (555) 345-6789',
    },
    organDonor: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: 'Carry inhaler in backpack at all times. No known heart conditions.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicalInformation', medicalInformationSchema);
