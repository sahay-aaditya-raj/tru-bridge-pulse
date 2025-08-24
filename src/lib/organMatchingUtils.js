// Organ donor matching utilities without email functionality

// Blood compatibility matrix with Rh factor
const bloodCompatibilityWithRh = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

// Node classes for donor and recipient
class DonorNode {
  constructor(id, bloodGroup, city, age, organType, coordinates = null) {
    this.id = id;
    this.bloodGroup = bloodGroup;
    this.city = city;
    this.age = age;
    this.organType = organType;
    this.coordinates = coordinates;
  }
}

class RecipientNode {
  constructor(id, bloodGroup, city, age, urgency, organType, coordinates = null) {
    this.id = id;
    this.bloodGroup = bloodGroup;
    this.city = city;
    this.age = age;
    this.urgency = urgency;
    this.organType = organType;
    this.coordinates = coordinates;
  }
}

// Check if donor blood group is compatible with recipient blood group
function isBloodCompatible(donorBG, recipientBG) {
  const compatible = bloodCompatibilityWithRh[donorBG]?.includes(recipientBG);
  return compatible;
}

// Calculate compatibility score between donor and recipient
function getCompatibilityScore(donor, recipient) {
  // Check blood compatibility first
  if (!isBloodCompatible(donor.bloodGroup, recipient.bloodGroup)) return 0;
  
  // Check organ type compatibility
  if (Array.isArray(donor.organType)) {
    if (!donor.organType.includes(recipient.organType)) return 0;
  } else {
    if (donor.organType !== recipient.organType) return 0;
  }

  let score = 0;
  
  // Base score for blood compatibility
  score += 50;
  
  // Location compatibility (same city gets bonus)
  if (donor.city === recipient.city) score += 20;
  
  // Urgency factor
  score += recipient.urgency * 10;
  
  // Age compatibility (closer ages get higher scores)
  score += Math.max(0, 20 - Math.abs(donor.age - recipient.age));
  
  // Perfect blood type match bonus
  if (donor.bloodGroup === recipient.bloodGroup) score += 10;
  
  return score;
}

// Hungarian algorithm implementation for optimal matching
function hungarian(costMatrix) {
  const n = costMatrix.length;
  const m = costMatrix[0].length;
  const u = Array(n + 1).fill(0);
  const v = Array(m + 1).fill(0);
  const p = Array(m + 1).fill(0);
  const way = Array(m + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    p[0] = i;
    const minv = Array(m + 1).fill(Infinity);
    const used = Array(m + 1).fill(false);
    let j0 = 0;

    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = 0;

      for (let j = 1; j <= m; j++) {
        if (!used[j]) {
          const cur = costMatrix[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }

      for (let j = 0; j <= m; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }

      j0 = j1;
    } while (p[j0] !== 0);

    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  const result = [];
  for (let j = 1; j <= m; j++) {
    if (p[j] > 0) result.push([p[j] - 1, j - 1]);
  }

  const maxScore = -v[0];
  return { matches: result, totalScore: maxScore };
}

// Find optimal matches between donors and recipients
function findOptimalMatches(donors, recipients) {
  if (!donors.length || !recipients.length) {
    return { matches: [], totalScore: 0 };
  }

  const n = Math.max(donors.length, recipients.length);
  const scoreMatrix = Array.from({ length: n }, () => Array(n).fill(0));

  // Calculate compatibility scores
  for (let i = 0; i < donors.length; i++) {
    for (let j = 0; j < recipients.length; j++) {
      scoreMatrix[i][j] = getCompatibilityScore(donors[i], recipients[j]);
    }
  }

  // Find maximum value for cost matrix conversion
  let maxVal = 0;
  for (let row of scoreMatrix) {
    for (let val of row) {
      maxVal = Math.max(maxVal, val);
    }
  }

  // Convert to cost matrix (Hungarian algorithm minimizes)
  const costMatrix = scoreMatrix.map((row) => row.map((val) => maxVal - val));

  const { matches, totalScore } = hungarian(costMatrix);

  // Filter out matches with zero compatibility score
  const validMatches = matches.filter(([di, ri]) => {
    if (di >= donors.length || ri >= recipients.length) return false;
    return scoreMatrix[di][ri] > 0;
  });

  return {
    matches: validMatches.map(([di, ri]) => ({
      donorIndex: di,
      recipientIndex: ri,
      donor: donors[di],
      recipient: recipients[ri],
      compatibilityScore: scoreMatrix[di][ri]
    })),
    totalScore: maxVal * validMatches.length - totalScore
  };
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Get compatibility level description based on score
function getCompatibilityLevel(score) {
  if (score >= 100) return 'Perfect Match';
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 45) return 'Fair';
  if (score > 0) return 'Poor';
  return 'Incompatible';
}

// Get compatibility status with color coding for UI
function getCompatibilityStatus(score) {
  if (score === 0) {
    return {
      status: 'Not Compatible',
      level: 'Incompatible',
      color: 'red'
    };
  } else if (score >= 90) {
    return {
      status: 'Fully Compatible',
      level: 'Excellent Match',
      color: 'green'
    };
  } else if (score >= 70) {
    return {
      status: 'Highly Compatible',
      level: 'Very Good Match',
      color: 'green'
    };
  } else if (score >= 50) {
    return {
      status: 'Compatible',
      level: 'Good Match',
      color: 'yellow'
    };
  } else {
    return {
      status: 'Low Compatibility',
      level: 'Fair Match',
      color: 'yellow'
    };
  }
}

// Check if a specific donor-recipient pair is compatible
function areCompatible(donor, recipient) {
  return getCompatibilityScore(donor, recipient) > 0;
}

export {
  DonorNode,
  RecipientNode,
  isBloodCompatible,
  getCompatibilityScore,
  findOptimalMatches,
  calculateDistance,
  getCompatibilityLevel,
  getCompatibilityStatus,
  areCompatible,
  bloodCompatibilityWithRh
};
