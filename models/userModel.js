const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For hashing passwords

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please enter your username'],
    unique: true,
  },
  mobile: {
    type: String,
    required: [true, 'Please enter your mobile number'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please enter your name'],
  },
  dob: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'], // Simple email validation
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [6, 'Password should be at least 6 characters long'],
  },
  activationCode: {
    type: String,
    required: true,
  },
  activationCodeExpires: {
    type: Date,
    required: true,
  },
  role: {
    type: Array,
    default: 'user'
  },
  Isverified: {
    type: Boolean,
    default: false, // Default value is false
  },
  // You can add additional fields as needed
}, { timestamps: true }); // Automatically create createdAt and updatedAt timestamps

// Pre-save hook to hash password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // If password is not modified, move to the next middleware
  }

  // Hash the password with a salt round of 10
  this.password = await bcrypt.hash(this.password, 10);
  next(); // Move to the next middleware
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
