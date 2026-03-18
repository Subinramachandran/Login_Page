const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User'); // Make sure your User model path is correct
require('dotenv').config();

const createUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const passwordHash = await bcrypt.hash('1234', 10);

    const user = new User({
      username: 'Subin',
      passwordHash
    });

    await user.save();
    console.log("✅ User created");
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

createUser();