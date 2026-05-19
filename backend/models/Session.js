const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
  question:     { type: String, required: true },
  userAnswer:   { type: String, required: true },
  aiFeedback:   { type: String, required: true },
  idealAnswer:  { type: String, required: true },
  score:        { type: Number, required: true, min: 0, max: 10 },
})

const sessionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company:     { type: String, required: true },
  companyName: { type: String, required: true },
  round:       { type: String, required: true },
  roundName:   { type: String, required: true },
  answers:     [answerSchema],
  totalScore:  { type: Number, default: 0 },
  maxScore:    { type: Number, default: 50 },  // 5 questions × 10
  completed:   { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Session', sessionSchema)