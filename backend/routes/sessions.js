const express = require('express')
const router = express.Router()
const protect = require('../middleware/auth')
const Session = require('../models/Session')

// 1. POST / — save session
router.post('/', protect, async (req, res) => {
  try {
    const { company, companyName, round, roundName, answers } = req.body
    const totalScore = answers.reduce((sum, a) => sum + a.score, 0)
    const session = await Session.create({
      userId: req.userId,
      company, companyName, round, roundName,
      answers, totalScore,
      maxScore: answers.length * 10,
      completed: true,
    })
    res.status(201).json({ session })
  } catch (error) {
    res.status(500).json({ message: 'Failed to save session', error: error.message })
  }
})

// 2. GET /summary — MUST be before /:id
router.get('/summary', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId, completed: true })
      .select('company round totalScore maxScore')

    const summary = {}
    let totalSessions = 0
    const roundsSet    = new Set()
    const companiesSet = new Set()

    sessions.forEach(s => {
      if (!summary[s.company]) {
        summary[s.company] = { dsa: 0, technical: 0, aptitude: 0, hr: 0 }
      }
      if (summary[s.company][s.round] !== undefined) {
        summary[s.company][s.round]++
      }
      totalSessions++
      roundsSet.add(s.round)
      companiesSet.add(s.company)
    })

    res.json({
      summary,
      stats: {
        totalSessions,
        roundsPracticed: roundsSet.size,
        companiesTried:  companiesSet.size,
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch summary', error: error.message })
  }
})

// 3. GET / — all sessions
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-answers')
    res.json({ sessions })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sessions', error: error.message })
  }
})

// 4. GET /:id — single session — MUST be last
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.userId })
    if (!session) return res.status(404).json({ message: 'Session not found' })
    res.json({ session })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch session', error: error.message })
  }
})

module.exports = router