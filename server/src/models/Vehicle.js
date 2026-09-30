const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    tagId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: 'Black',
    },
    fuelType: {
      type: String,
      default: 'Electric',
    },
    insuranceStatus: {
      type: String,
      default: 'Active (Valid through Dec 2026)',
    },
    registrationStatus: {
      type: String,
      default: 'Valid & Verified',
    },
    vin: {
      type: String,
      default: '1HGCR2F83HA001928',
    },
    emergencyContact: {
      type: String,
      default: '+1 (555) 019-2834',
    },
    notes: {
      type: String,
      default: 'Parked in Designated Visitor Bay. Contact owner for repositioning.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
