function AIRecommendationCard({ suggestion }) {
  const getIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'urgent': return '⏰';
      case 'moderate': return '📈';
      case 'positive': return '⭐';
      case 'planning': return '🎯';
      case 'teaching': return '🎓';
      default: return '💡';
    }
  };

  return (
    <div className={`suggestion-item ${suggestion.type}`}>
      <div className="suggestion-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px' }}>{getIcon(suggestion.type)}</span>
        <h4 className="suggestion-title" style={{ margin: 0 }}>{suggestion.title}</h4>
      </div>
      <p className="suggestion-desc">{suggestion.description}</p>
      
      <div className="action-plan-container" style={{ marginTop: '12px' }}>
        <p className="suggestion-action" style={{ fontWeight: 700, marginBottom: '8px', color: '#374151', fontSize: '13px' }}>
          ✓ Action Plan:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {suggestion.actionPlan ? (
            suggestion.actionPlan.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4B5563' }}>
                <span style={{ color: '#10B981' }}>✔</span>
                <span>{item}</span>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4B5563' }}>
              <span style={{ color: '#10B981' }}>✔</span>
              <span>{suggestion.actionable}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIRecommendationCard;
