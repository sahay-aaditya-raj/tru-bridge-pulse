import mongoose from 'mongoose';

const SummarySchema = new mongoose.Schema({
  patientInfo: {
    name: {
      type: String,
      required: true
    },
    age: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      required: true
    }
  },
  symptoms: [{
    type: String,
    required: true
  }],
  duration: {
    type: String,
    default: "Unknown"
  },
  severity: {
    type: String,
    required: true
  },
  possibleCauses: [{
    type: String,
    required: true
  }],
  emotionalState: {
    type: String,
    required: true
  },
  doctorNotes: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    index: true // Index for efficient querying by username
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  collection: 'summaries' // Explicitly specify the collection name
});

// Prevent re-compilation of the model
const Summary = mongoose.models.Summary || mongoose.model('Summary', SummarySchema);

export default Summary;
