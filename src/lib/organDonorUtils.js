// Utility functions for organ donor registration

export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const organTypes = [
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
];

export const validateAadhar = (aadhar) => {
  const aadharRegex = /^[0-9]{12}$/;
  return aadharRegex.test(aadhar);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const formatAadhar = (aadhar) => {
  if (!aadhar) return '';
  return aadhar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};

export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const isEligibleForDonation = (age, organType = null) => {
  if (age < 18) return false;
  
  // Different organs have different age limits
  const ageLimits = {
    'Heart': 60,
    'Liver': 70,
    'Kidneys': 75,
    'Lungs': 65,
    'Pancreas': 60,
    'Small Intestine': 60,
    'Corneas': 80,
    'Skin': 80,
    'Bone': 80,
    'Heart Valves': 80,
    'Blood Vessels': 80,
    'Connective Tissue': 80
  };
  
  if (organType && ageLimits[organType]) {
    return age <= ageLimits[organType];
  }
  
  return age <= 80; // General limit
};

export const getCompatibleBloodGroups = (bloodGroup) => {
  const compatibility = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'] // Universal recipient for receiving
  };
  
  return compatibility[bloodGroup] || [];
};

export const formatRegistrationDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
};
