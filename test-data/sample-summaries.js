// Test script to add sample summary data to MongoDB
// Run this in your MongoDB shell or through a database client

// Sample data structure based on your provided example
const sampleSummaries = [
  {
    "_id": ObjectId(),
    "patientInfo": {
      "name": "Piyush",
      "age": "21",
      "gender": "male"
    },
    "symptoms": [
      "Heart attack",
      "Severe chest pain",
      "Shortness of breath",
      "Pain in arms, back, neck, jaw, or stomach"
    ],
    "duration": "Unknown",
    "severity": "Severe",
    "possibleCauses": ["Heart attack"],
    "emotionalState": "Distressed",
    "doctorNotes": "Patient is experiencing severe symptoms of a possible heart attack, needs immediate medical attention",
    "username": "pkheria7",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "_id": ObjectId(),
    "patientInfo": {
      "name": "Piyush",
      "age": "21",
      "gender": "male"
    },
    "symptoms": [
      "Mild headache",
      "Fatigue"
    ],
    "duration": "2 days",
    "severity": "Mild",
    "possibleCauses": ["Stress", "Dehydration"],
    "emotionalState": "Slightly concerned",
    "doctorNotes": "Mild symptoms, likely due to stress. Recommend rest and hydration.",
    "username": "pkheria7",
    "createdAt": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    "updatedAt": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    "_id": ObjectId(),
    "patientInfo": {
      "name": "Piyush",
      "age": "21",
      "gender": "male"
    },
    "symptoms": [
      "Persistent cough",
      "Fever",
      "Body aches"
    ],
    "duration": "5 days",
    "severity": "Moderate",
    "possibleCauses": ["Viral infection", "Common cold"],
    "emotionalState": "Worried",
    "doctorNotes": "Moderate symptoms consistent with viral infection. Monitor temperature and rest.",
    "username": "pkheria7",
    "createdAt": new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    "updatedAt": new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  }
];

// To insert the sample data, use:
// db.summaries.insertMany(sampleSummaries);

// Or if you want to insert one by one:
// db.summaries.insertOne(sampleSummaries[0]);
// db.summaries.insertOne(sampleSummaries[1]);
// db.summaries.insertOne(sampleSummaries[2]);

console.log("Sample summaries data ready to insert into MongoDB");
console.log("Run: db.summaries.insertMany(sampleSummaries);");
