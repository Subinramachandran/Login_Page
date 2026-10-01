const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


// ---------------------
// TASK SCHEMA
// ---------------------
const TaskSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    completed: {
      type: Boolean,
      default: false
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date
    }
  },
  {
    _id: false
  }
);


// ---------------------
// USER SCHEMA
// ---------------------
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  passwordHash: {
    type: String,
    required: true
  },

  tasks: {
    type: [TaskSchema],
    default: []
  }
});


// ---------------------
// CHECK PASSWORD
// ---------------------
UserSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(
    password,
    this.passwordHash
  );
};


const User = mongoose.model("User", UserSchema);

module.exports = User;