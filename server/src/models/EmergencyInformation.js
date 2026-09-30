const mongoose = require('mongoose');

const emergencyInformationSchema = new mongoose.Schema(
  {
    tagId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    emergencyTitle: {
      type: String,
      default: 'Immediate Emergency Contact & Evacuation Protocol',
    },
    primaryContactName: {
      type: String,
      required: true,
      default: 'Johnathan Doe (Spouse)',
    },
    primaryContactPhone: {
      type: String,
      required: true,
      default: '+1 (555) 911-0001',
    },
    secondaryContactName: {
      type: String,
      default: 'Office Security Dispatch',
    },
    secondaryContactPhone: {
      type: String,
      default: '+1 (555) 911-0002',
    },
    emergencyServicesNumber: {
      type: String,
      default: '911',
    },
    evacuationPoint: {
      type: String,
      default: 'Assembly Point B - North Lawn across Main Entrance',
    },
    instructions: {
      type: [String],
      default: [
        'Remain calm and dial primary emergency contact immediately.',
        'If smoke or fire is detected, follow emergency green exit signs to Assembly Point B.',
        'Do not use elevators during fire alarm activations.',
      ],
    },
    medicalAlerts: {
      type: String,
      default: 'First Aid Kit located on 2nd Floor Breakroom cabinet (Room 204).',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EmergencyInformation', emergencyInformationSchema);
