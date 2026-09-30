const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Tag = require('../models/Tag');
const Vehicle = require('../models/Vehicle');
const MedicalInformation = require('../models/MedicalInformation');
const EmergencyInformation = require('../models/EmergencyInformation');
const ContactInformation = require('../models/ContactInformation');
const PersonalInformation = require('../models/PersonalInformation');
const Document = require('../models/Document');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Connected.');

    // Clear existing collections
    console.log('[Seed] Resetting collections for single normal user and single tag...');
    await User.deleteMany({});
    await Tag.deleteMany({});
    await Vehicle.deleteMany({});
    await MedicalInformation.deleteMany({});
    await EmergencyInformation.deleteMany({});
    await ContactInformation.deleteMany({});
    await PersonalInformation.deleteMany({});
    await Document.deleteMany({});

    // 1. Create the Primary Normal User
    console.log('[Seed] Creating primary normal user...');
    const user = await User.create({
      name: 'Sarah Connor',
      email: 'owner@example.com',
      password: 'password123',
      personId: 'USER001',
      role: 'user',
      organization: 'Apex Dynamic Labs',
      phone: '+1 (555) 789-0123',
      bio: 'Normal user and registered owner of NFC Tag TAG001.',
    });
    console.log(`[Seed] Created User: ${user.email} (Password: password123)`);

    // 2. Create the Single Primary NFC Tag (TAG001)
    console.log('[Seed] Creating single primary tag TAG001...');
    const tag = await Tag.create({
      tagId: 'TAG001',
      name: 'My Personal Dynamic NFC Tag',
      permanentUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/tag/TAG001`,
      ownerId: user._id,
      defaultFunction: 'configuration',
      configuration: {
        fields: [
          {
            name: 'location',
            label: 'Current Position',
            type: 'location',
            required: false,
            options: [],
          },
          {
            name: 'intent',
            label: 'Intent / Purpose',
            type: 'dropdown',
            required: true,
            options: [
              'Vehicle Details',
              'Medical Information',
              'Emergency Protocol',
              'Contact Card',
              'Personal Profile',
            ],
          },
          {
            name: 'accessLevel',
            label: 'Access Level',
            type: 'dropdown',
            required: true,
            options: ['Public', 'Authorized Users', 'Owner Only'],
          },
        ],
        functions: [
          'vehicle_details',
          'medical_information',
          'emergency',
          'contact',
          'personal_information',
        ],
        accessLevels: ['public', 'authorized', 'owner_only'],
        defaultDuration: 300,
      },
      activeState: null,
    });
    console.log(`[Seed] Created Tag: ${tag.tagId}`);

    // 3. Create Sample Uploaded Document
    const uploadDir = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const sampleDocPath = path.join(uploadDir, 'sample-insurance.txt');
    fs.writeFileSync(
      sampleDocPath,
      'OFFICIAL VEHICLE INSURANCE POLICY & CERTIFICATE\nPolicy Number: USAA-99214A-2026\nStatus: Comprehensive Active Coverage\nInsured: Sarah Connor\nVehicle: Tesla Model Y Performance\nEffective Date: 2026-01-01 to 2027-01-01'
    );

    await Document.create({
      userId: user._id,
      tagId: 'TAG001',
      title: 'Vehicle Insurance Policy & DMV Certificate',
      category: 'vehicle',
      originalName: 'vehicle-insurance-policy.txt',
      fileName: 'sample-insurance.txt',
      filePath: sampleDocPath,
      fileUrl: '/uploads/sample-insurance.txt',
      mimeType: 'text/plain',
      fileSize: 220,
      description: 'Official digital certificate of active motor insurance policy.',
    });
    console.log('[Seed] Seeded sample uploaded document.');

    // 4. Seed Domain Documents for TAG001
    await Vehicle.create({
      tagId: 'TAG001',
      registrationNumber: 'CA-9NFC-2026',
      owner: 'Sarah Connor',
      model: 'Tesla Model Y Performance (Dual Motor AWD)',
      color: 'Midnight Silver Metallic',
      fuelType: 'Battery Electric (BEV)',
      insuranceStatus: 'Active — Comprehensive Policy #USAA-99214A',
      registrationStatus: 'Valid through Nov 2027 (DMV Verified)',
      vin: '5YJ3E1EB8NF198234',
      emergencyContact: '+1 (555) 019-2834 (Roadside & Security)',
      notes: 'Vehicle parked in Reserved Bay 42. Contact security desk or driver before towing.',
    });

    await MedicalInformation.create({
      tagId: 'TAG001',
      fullName: 'Sarah Connor',
      bloodGroup: 'O Positive (O+)',
      allergies: ['Penicillin', 'Peanuts', 'Sulfa drugs'],
      chronicConditions: ['Asthma (Exercise-induced)'],
      medications: ['Albuterol Inhaler (PRN)', 'Cetirizine 10mg'],
      emergencyContactName: 'Dr. Raymond Palmer, MD',
      emergencyContactPhone: '+1 (555) 432-8765',
      physicianName: 'Metropolitan Health Partners',
      physicianPhone: '+1 (555) 345-6789',
      organDonor: true,
      notes: 'Carries emergency rescue inhaler in outer backpack compartment.',
    });

    await EmergencyInformation.create({
      tagId: 'TAG001',
      emergencyTitle: 'CRITICAL INCIDENT PROTOCOL & EVACUATION',
      primaryContactName: 'Johnathan Doe (Spouse)',
      primaryContactPhone: '+1 (555) 911-0001',
      secondaryContactName: 'Regional Incident Command / Dispatch',
      secondaryContactPhone: '+1 (555) 911-0002',
      emergencyServicesNumber: '911 / 112',
      evacuationPoint: 'Assembly Area 3 — North Campus Lawn opposite Gate 2',
      instructions: [
        'Call primary contact immediately upon tag scan.',
        'If toxic fumes or fire present, move immediately upwind toward Assembly Area 3.',
        'First Aid Kit located on Level 1 Lobby wall cabinet.',
      ],
      medicalAlerts: 'Asthma patient: Ensure airway is kept open and provide rescue inhaler if conscious.',
    });

    await ContactInformation.create({
      tagId: 'TAG001',
      fullName: 'Sarah Connor',
      title: 'Principal Systems & IoT Architect',
      organization: 'Apex Dynamic Labs',
      email: 'sarah.connor@apexlabs.example.com',
      phone: '+1 (555) 789-0123',
      address: '100 Silicon Way, Tech Park Tower 4, San Francisco, CA',
      website: 'https://apexlabs.example.com',
      notes: 'In-office Mon-Thu. Available on Signal and secure email.',
    });

    await PersonalInformation.create({
      tagId: 'TAG001',
      fullName: 'Sarah Connor',
      preferredName: 'Sarah',
      bio: 'Research engineer working on embedded IoT, smart city protocols, and context-aware systems.',
      language: 'English, French',
      nationality: 'United States',
      identityReference: 'ID-PASSPORT-US-991204',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarah-connor-iot',
        twitter: 'https://twitter.com/sarah_embedded',
        github: 'https://github.com/sarahconnor-demo',
      },
      notes: 'Verified Identity Token holder for High-Security R&D Facilities.',
    });

    console.log('[Seed] Finished! Clean single-user and single-tag database ready.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
};

seedData();
