import mongoose from 'mongoose';

const OrganDonorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit contact number']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates are required']
    }
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    uppercase: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Age must be at least 18 for organ donation'],
    max: [80, 'Age cannot exceed 80 for organ donation']
  },
  organType: {
    type: [String],
    required: [true, 'At least one organ type must be selected'],
    enum: [
      'Heart',
      'Liver',
      'Kidneys',
      'Lungs',
      'Pancreas',
      'Small Intestine',
      'Corneas',
      'Skin',
      'Bone',
      'Heart Valves',
      'Blood Vessels',
      'Connective Tissue'
    ],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one organ type must be selected'
    }
  },
  aadharNumber: {
    type: String,
    required: [true, 'Aadhar number is required'],
    unique: true,
    match: [/^[0-9]{12}$/, 'Please enter a valid 12-digit Aadhar number']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a 2dsphere index for location-based queries
OrganDonorSchema.index({ coordinates: '2dsphere' });

// Index for faster queries
OrganDonorSchema.index({ userId: 1 });
OrganDonorSchema.index({ bloodGroup: 1 });
OrganDonorSchema.index({ organType: 1 });
OrganDonorSchema.index({ location: 1 });

const OrganDonor = mongoose.models.OrganDonor || mongoose.model('OrganDonor', OrganDonorSchema);

export default OrganDonor;
