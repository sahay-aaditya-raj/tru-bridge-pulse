summary_template = """
You are a medical assistant AI.
Summarize the following conversation between a patient and a health checkup bot
into a structured JSON object for a doctor to quickly review.

Conversation:
{chat_history}

Return ONLY valid JSON. 
Do not include explanations, markdown, or triple backticks. 
Output just the JSON object in the following structure:

{{
  "sleep": "",
  "diet": "",
  "exercise": "",
  "stress": "",
  "main_concerns": "",
  "lifestyle_habits": "",
  "medical_history": "",
  "current_symptoms": "",
  "other_observations": ""
}}
"""