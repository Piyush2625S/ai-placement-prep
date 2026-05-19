const express = require('express')
const router = express.Router()
const protect = require('../middleware/auth')

// ── With JSON mode — for structured question generation ──
async function callAIJson(prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    })
  })
  const data = await res.json()
  if (!res.ok) {
    console.error('Groq error:', JSON.stringify(data))
    throw new Error(`Groq API error: ${data.error?.message || 'unknown'}`)
  }
  return data.choices[0].message.content
}

// ── Without JSON mode — for feedback with code blocks ───
async function callAIText(prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    })
  })
  const data = await res.json()
  if (!res.ok) {
    console.error('Groq error:', JSON.stringify(data))
    throw new Error(`Groq API error: ${data.error?.message || 'unknown'}`)
  }
  return data.choices[0].message.content
}

function parseJSON(raw) {
  let cleaned = raw.replace(/```json|```/gi, '').trim()
  try { return JSON.parse(cleaned) } catch (_) {}
  const arrMatch = cleaned.match(/\[[\s\S]*\]/)
  if (arrMatch) { try { return JSON.parse(arrMatch[0]) } catch (_) {} }
  const objMatch = cleaned.match(/\{[\s\S]*\}/)
  if (objMatch) { try { return JSON.parse(objMatch[0]) } catch (_) {} }
  throw new Error('Could not parse JSON from AI response')
}

// ── Generate questions ───────────────────────────────────
router.post('/generate', protect, async (req, res) => {
  try {
    const { company, companyName, round, roundName } = req.body

    if (!company || !round) {
      return res.status(400).json({ message: 'Company and round are required' })
    }

    const prompt = `Generate exactly 5 ${roundName} interview questions for ${companyName}.
Return a JSON object with a "questions" array of exactly 5 items.
Each item: id (number 1-5), question (string), difficulty (Easy/Medium/Hard), topic (string).

Company difficulty context — follow this strictly:
- Service companies (TCS, Infosys, Wipro, Cognizant, Accenture): EASY to MEDIUM only. Basic problems. Arrays, strings, simple patterns, basic recursion. No graphs, no DP, no advanced trees.
- Product companies (Flipkart, Uber, Razorpay, PhonePe, Paytm, Swiggy, Zepto, CRED, Meesho, Groww): MEDIUM to HARD. Standard DSA, system thinking.
- FAANG (Google, Amazon, Microsoft, Meta, Apple): HARD. Advanced DSA, optimization, edge cases.
- Generic Startup: MEDIUM. Practical problems.

Current company: ${companyName}. Current round: ${roundName}.

STRICT round rules:
- DSA: ONLY algorithms and data structures. No theory, no HR, no system design.
- Technical: ONLY CS fundamentals — OOP, DBMS, OS, networking. No coding problems.
- Aptitude: ONLY quantitative, logical reasoning, verbal. No coding.
- HR: ONLY behavioural questions based on ${companyName} values. No technical content.

Keep each question under 100 words.`

    const raw = await callAIJson(prompt)
    const parsed = parseJSON(raw)
    const questions = Array.isArray(parsed) ? parsed : parsed.questions

    if (!questions || !Array.isArray(questions)) {
      throw new Error('Invalid questions format from AI')
    }

    res.json({ questions })
  } catch (error) {
    console.error('Generate error:', error.message)
    res.status(500).json({ message: 'Failed to generate questions', error: error.message })
  }
})

// ── Evaluate answer ──────────────────────────────────────
router.post('/feedback', protect, async (req, res) => {
  try {
    const { question, userAnswer, company } = req.body

    if (!question || !userAnswer) {
      return res.status(400).json({ message: 'Question and answer are required' })
    }

    const prompt = `You are a strict interviewer at ${company} evaluating a candidate answer.

Question: ${question}
Candidate Answer: ${userAnswer}

Respond with ONLY a JSON object. No explanation before or after.
Use this exact structure:
{
  "score": 7,
  "feedback": "direct feedback in 2-3 sentences",
  "idealAnswer": "complete model answer here. For code use: \`\`\`cpp\\ncode here\\n\`\`\`",
  "weakAreas": ["area1", "area2"]
}

Score 0-10. Be honest and direct.`

    const raw = await callAIText(prompt)

    // Extract JSON — handle cases where model adds text before/after
    let result
    const objMatch = raw.match(/\{[\s\S]*\}/)
    if (!objMatch) throw new Error('No JSON found in response')

    // The JSON contains code blocks with backticks — parse carefully
    try {
      result = JSON.parse(objMatch[0])
    } catch (_) {
      // If parse fails due to unescaped content, extract fields manually
      const scoreMatch    = objMatch[0].match(/"score"\s*:\s*(\d+)/)
      const feedbackMatch = objMatch[0].match(/"feedback"\s*:\s*"([^"]*)"/)

      if (!scoreMatch) throw new Error('Could not extract score from response')

      // Use the full raw idealAnswer section
      const idealMatch = raw.match(/"idealAnswer"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"weakAreas"|"\s*\})/)
      const weakMatch  = raw.match(/"weakAreas"\s*:\s*\[([^\]]*)\]/)

      result = {
        score:       parseInt(scoreMatch[1]),
        feedback:    feedbackMatch?.[1] || 'See ideal answer for guidance.',
        idealAnswer: idealMatch?.[1]?.replace(/\\n/g, '\n').replace(/\\`/g, '`') || '',
        weakAreas:   weakMatch
          ? weakMatch[1].match(/"([^"]*)"/g)?.map(s => s.replace(/"/g, '')) || []
          : []
      }
    }

    res.json(result)
  } catch (error) {
    console.error('Feedback error:', error.message)
    res.status(500).json({ message: 'Failed to evaluate answer', error: error.message })
  }
})

// ── Resume analyzer ──────────────────────────────────────
router.post('/resume', protect, async (req, res) => {
  try {
    const { resume } = req.body
    if (!resume) return res.status(400).json({ message: 'Resume text is required' })

    const prompt = `You are an expert resume reviewer for tech placements in India.
Analyze this resume and return a JSON object with:
- score: integer 0-10
- summary: string, 2-3 sentence overall assessment
- strengths: array of 3-5 strings, what is done well
- improvements: array of 3-5 strings, specific problems
- actionItems: array of 3-5 strings, exact things to fix

Resume:
${resume}`

    const raw    = await callAIText(prompt)
    const result = parseJSON(raw)
    res.json(result)
  } catch (error) {
    console.error('Resume error:', error.message)
    res.status(500).json({ message: 'Failed to analyze resume', error: error.message })
  }
})

module.exports = router