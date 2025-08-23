summary_template = """
You are a medical assistant AI.
Summarize the following conversation between a patient and a health checkup bot
into a concise, structured report for a doctor to quickly review.

Conversation:
{chat_history}

Format the summary with these sections if available:
- Demographics (age, gender)
- Sleep
- Diet
- Exercise
- Stress
- Lifestyle habits
- Medical history
- Current symptoms
- Other observations

Keep it short, factual, and easy to scan.
"""