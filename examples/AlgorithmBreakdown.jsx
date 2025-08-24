// Simple component to display algorithm breakdown
import React from 'react';

const AlgorithmBreakdown = ({ breakdown, score, isExpanded, onToggle }) => {
  if (!breakdown || !breakdown.details) return null;

  return (
    <div>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          background: 'none',
          border: '1px solid #007bff',
          color: '#007bff',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          marginTop: '10px'
        }}
      >
        {isExpanded ? '🔼 Hide' : '🔽 Show'} Algorithm Details
      </button>

      {/* Breakdown Details */}
      {isExpanded && (
        <div style={{ 
          marginTop: '15px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h5 style={{ margin: '0 0 15px 0', color: '#495057' }}>
            🧬 Compatibility Algorithm Breakdown
          </h5>
          
          <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '6px' }}>
            <strong>Final Score: {score}/115+ points</strong>
            {breakdown.ageDifference !== null && (
              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                Age Difference: {breakdown.ageDifference} years
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            {breakdown.details.map((detail, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: `2px solid ${
                    detail.status === 'passed' ? '#28a745' :
                    detail.status === 'bonus' ? '#17a2b8' :
                    detail.status === 'failed' ? '#dc3545' :
                    '#6c757d'
                  }`
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '5px',
                    color: '#333'
                  }}>
                    {detail.status === 'passed' ? '✅' : 
                     detail.status === 'bonus' ? '🎁' :
                     detail.status === 'failed' ? '❌' : 'ℹ️'} {detail.factor}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    {detail.reason}
                  </div>
                </div>
                <div style={{ 
                  fontWeight: 'bold',
                  fontSize: '18px',
                  minWidth: '60px',
                  textAlign: 'right',
                  color: detail.points > 0 ? '#28a745' : detail.status === 'failed' ? '#dc3545' : '#6c757d'
                }}>
                  {detail.points > 0 ? '+' : ''}{detail.points}
                </div>
              </div>
            ))}
          </div>

          {/* Score Categories */}
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
            <strong>Scoring Guide:</strong>
            <div>🟢 Excellent (90+) | 🟡 Good (50-89) | 🔴 Incompatible (0)</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Usage example in a donor card
const DonorCard = ({ donor }) => {
  const [showBreakdown, setShowBreakdown] = React.useState(false);

  const getCompatibilityBadgeStyle = (color) => {
    const styles = {
      green: { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
      yellow: { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' },
      red: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
      gray: { backgroundColor: '#e2e3e5', color: '#6c757d', border: '1px solid #d6d8db' }
    };
    
    return {
      ...styles[color] || styles.gray,
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'inline-block',
      minWidth: '120px',
      textAlign: 'center'
    };
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '20px', 
      margin: '10px 0',
      backgroundColor: 'white'
    }}>
      {/* Donor Basic Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h4 style={{ margin: '0 0 10px 0' }}>{donor.name}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
            <div><strong>Blood:</strong> {donor.bloodGroup}</div>
            <div><strong>Age:</strong> {donor.age}</div>
            <div><strong>Distance:</strong> {donor.distance}km</div>
          </div>
          <div style={{ marginTop: '8px' }}>
            <strong>Organs:</strong> {donor.organType.join(', ')}
          </div>
        </div>
        
        {/* Compatibility Badge */}
        <div style={{ textAlign: 'right' }}>
          <div style={getCompatibilityBadgeStyle(donor.compatibilityColor)}>
            {donor.compatibilityStatus}
          </div>
          {donor.compatibilityScore !== null && (
            <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
              Score: {donor.compatibilityScore}/115+
            </div>
          )}
        </div>
      </div>

      {/* Algorithm Breakdown */}
      {donor.compatibilityBreakdown && (
        <AlgorithmBreakdown 
          breakdown={donor.compatibilityBreakdown}
          score={donor.compatibilityScore}
          isExpanded={showBreakdown}
          onToggle={() => setShowBreakdown(!showBreakdown)}
        />
      )}
    </div>
  );
};

export { AlgorithmBreakdown, DonorCard };
