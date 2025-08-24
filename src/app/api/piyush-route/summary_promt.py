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
  "patientInfo": {{
    "name": "<if available>",
    "age": "<if available>",
    "gender": "<if available>"
  }},
  "symptoms": [
    "<list of reported symptoms>"
  ],
  "duration": "<how long the symptoms have been present>",
  "severity": "<mild | moderate | severe>",
  "possibleCauses": [
    "<possible causes inferred from conversation>"
  ],
  "emotionalState": "<calm | anxious | distressed | depressed | angry >",
  "doctorNotes": "<short simplified summary for doctor to quickly understand case>"
}}
"""