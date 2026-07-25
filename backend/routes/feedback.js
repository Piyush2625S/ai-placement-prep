router.post("/feedback", protect, async (req, res) => {
  try {
    const { question, userAnswer, company, round } = req.body;

    if (!question || !userAnswer) {
      return res
        .status(400)
        .json({ message: "Question and answer are required" });
    }

    const prompt = `You are a strict interviewer at ${company} evaluating a candidate answer.

Question: ${question}
Candidate Answer: ${userAnswer}

Evaluate and return JSON with exactly this structure:
{
  "score": 7,
  "feedback": "2-3 sentences of direct feedback here",
  "idealAnswer": "complete model answer here",
  "weakAreas": ["area1", "area2"]
}

Score must be a number 0-10. Be direct and specific.`;

    const raw = await callAI(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match)
        throw new Error("Could not parse feedback from Gemini response");
      result = JSON.parse(match[0]);
    }

    res.json(result);
  } catch (error) {
    console.error("Feedback error:", error.message);
    res
      .status(500)
      .json({ message: "Failed to evaluate answer", error: error.message });
  }
});
