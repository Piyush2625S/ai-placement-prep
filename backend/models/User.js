const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  course: {
    type: String,
    required: true,
    trim: true
    // e.g. "B.Tech CSE", "MCA", "BCA"
  },
  passingYear: {
    type: Number,
    required: true
    // e.g. 2025, 2026
  },
  college: {
    type: String,
    trim: true,
    default: ''
  },
  targetRole: {
    type: String,
    trim: true,
    default: ''
    // e.g. "SDE", "Data Analyst", "DevOps"
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('User', userSchema)