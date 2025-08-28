// backend/scripts/seedRoles.js
const mongoose = require('mongoose');
require('dotenv').config();
const UserRole = require('../models/UserRole');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/wedustories';

const roles = [
  { roleName: 'Admin', permissions: ['*'] }, // '*' means all permissions
  { roleName: 'CEO',  permissions: ['*'] },
  { roleName: 'Manager', permissions: ['create_booking','update_booking','cancel_booking','assign_team','view_payments'] },
  { roleName: 'Reception', permissions: ['create_booking','update_booking'] },
  { roleName: 'Client', permissions: [] }
];

(async function seed(){
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    for (const r of roles) {
      const exists = await UserRole.findOne({ roleName: r.roleName });
      if (!exists) {
        await UserRole.create(r);
        console.log('Created role:', r.roleName);
      } else {
        console.log('Role exists:', r.roleName);
      }
    }
    console.log('Done seeding roles');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
