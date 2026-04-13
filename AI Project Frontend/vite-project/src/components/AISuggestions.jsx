import { useState, useEffect } from "react";
import { FiPieChart, FiBook, FiCalendar, FiAlertCircle, FiCheckCircle, FiInfo, FiTrendingUp, FiTrendingDown, FiTarget } from "react-icons/fi";
import AIRecommendationCard from "./AIRecommendationCard";

function AISuggestions({ userId }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // 🔹 REFACTORED LOGIC: Returns multiple cards based on 3-pillar rules
  const generateSubjectSuggestions = (subject) => {
    if (!subject) return [];

    const marks = Number(subject.marks ?? 0);
    const completion = Number(subject.completion ?? 0);
    const examDate = subject.examDate ? new Date(subject.examDate) : null;
    const today = new Date();
    const daysUntilExam = examDate ? Math.max(0, Math.ceil((examDate - today) / (1000 * 60 * 60 * 24))) : null;

    const suggestions = [];

    // 1. PERFORMANCE PILLAR
    if (marks < 60) {
       suggestions.push({
        title: "Average Performance - Room to Improve",
        description: `Your score is ${marks}%. Focused effort can significantly boost your results.`,
        type: "moderate",
        actionPlan: ["Target weak areas", "Practice mixed difficulty questions", "Revise key concepts fundamentals"]
      });
    } else if (marks <= 80) {
      suggestions.push({
        title: "Good Performance - Can Improve Further",
        description: `Maintaining a steady ${marks}% score. You are doing well, aim for excellence.`,
        type: "positive",
        actionPlan: ["Aim for perfection in upcoming tests", "Take advanced mock assessments", "Master complex topics and theories"]
      });
    } else {
      suggestions.push({
        title: "Strong Performance - Keep It Up",
        description: `Outstanding work with ${marks}%! You have a strong grasp of the material.`,
        type: "planning",
        actionPlan: ["Maintain consistency in your studies", "Help peers to reinforce your understanding", "Explore extra-curricular reading in this field"]
      });
    }

    // 2. EXAM PILLAR (Urgency)
    if (daysUntilExam !== null && daysUntilExam <= 7) {
      suggestions.push({
        title: "Exam Approaching - Revision Focus",
        description: `Your exam is in only ${daysUntilExam} day(s). High intensity revision needed.`,
        type: "urgent",
        actionPlan: ["Focus exclusively on high-weight topics", "Take full-length mock tests", "Avoid starting new complex units now"]
      });
    } else if (daysUntilExam !== null && daysUntilExam <= 14) {
      suggestions.push({
        title: "Upcoming Exam - Preparation Phase",
        description: `Exam in ${daysUntilExam} days. Transition into full-scale preparation.`,
        type: "urgent",
        actionPlan: ["Review all previously completed chapters", "Practice with past question papers", "Organize group study to clarify doubts"]
      });
    }

    // 3. COMPLETION PILLAR
    if (completion < 50) {
      suggestions.push({
        title: "Low Completion - Urgent Attention Needed",
        description: `You have completed only ${completion}% of the syllabus. Pace needs to increase.`,
        type: "critical",
        actionPlan: ["Complete pending topics as priority", "Prioritize important chapters according to weightage", "Track daily progress to stay on schedule"]
      });
    } else if (completion < 80) {
      suggestions.push({
        title: "Moderate Completion - Stay Consistent",
        description: `Coverage stands at ${completion}%. You are halfway through the journey.`,
        type: "moderate",
        actionPlan: ["Finish remaining units systematically", "Balance revision of old topics with new ones", "Set clear weekly completion targets"]
      });
    } else {
      suggestions.push({
        title: "High Completion - Almost There",
        description: `Great syllabus coverage at ${completion}%! Just a few more topics to go.`,
        type: "positive",
        actionPlan: ["Conduct a final revision of all units", "Check for any skipped minor sub-topics", "Attempt full-length tests for confidence"]
      });
    }

    return suggestions;
  };



  useEffect(() => {
    const fetchAISuggestions = async () => {
      try {
        const response = await fetch(`http://localhost:8080/suggestions/${userId}`);
        if (response.ok) {
          const result = await response.json();
          console.log("AI Suggestions Response:", result);
          setData(result);
        } else {
          console.error("Failed to fetch AI suggestions");
          setData(null);
        }
      } catch (err) {
        console.error("AI Analysis Error:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAISuggestions();
    } else {
      console.warn("AISuggestions: userId is missing or not set in localStorage.");
      setData(null);
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            animation: 'pulse 2s infinite'
          }}>🤖</div>
          <h3 style={{ color: '#1F2937', margin: '0' }}>Analyzing your performance...</h3>
          <p style={{ color: '#6B7280', margin: '8px 0 0 0' }}>Generating personalized AI insights</p>
        </div>
      </div>
    );
  }

  if (!data || (!data.overallSuggestions?.length && !data.subjectSuggestions?.length)) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: '#F9FAFB',
        borderRadius: '16px',
        border: '1px dashed #D1D5DB',
        margin: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <p style={{ fontSize: '18px', color: '#374151', margin: '0 0 8px 0' }}>No Data Available</p>
        <p style={{ color: '#6B7280' }}>Add subjects, complete topics, and take exams for AI to provide personalized suggestions</p>
      </div>
    );
  }

  // Calculate overall metrics
  const overallAvgMarks = data.analysis?.averageMarks || 0;
  const subjectMarks = data.subjectSuggestions?.map(s => s.marks) || [];
  const highestSubjectMark = subjectMarks.length > 0 ? Math.max(...subjectMarks) : 0;
  const lowestSubjectMark = subjectMarks.length > 0 ? Math.min(...subjectMarks) : 0;
  const selectedSubjectSuggestions = selectedSubject ? generateSubjectSuggestions(selectedSubject) : [];

  return (
    <div style={{
      padding: '24px',
      background: '#F9FAFB',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .metric-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid #E5E7EB;
          transition: all 0.2s;
          text-align: center;
        }
        .metric-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px -5px rgba(0,0,0,0.1); }
        .subject-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #E5E7EB;
          position: relative;
          overflow: hidden;
        }
        .subject-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          border-color: #6366F1;
        }
        .subject-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justifyContent: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .modal-content {
          background: white;
          border-radius: 20px;
          padding: 32px;
          max-width: 800px;
          width: 95%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          position: relative;
        }
        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .suggestion-item {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #475569;
          line-height: 1.5;
        }
      `}</style>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1F2937',
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🤖 AI Learning Assistant
        </h1>
        <p style={{ color: '#6B7280', fontSize: '16px', margin: '0' }}>
          Standardized intelligent insights following the 3-pillar performance rule
        </p>
      </div>

      {/* OVERALL PERFORMANCE METRICS */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          color: '#1F2937',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FiTarget style={{ color: '#667eea' }} />
          Overall Performance
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {/* Overall Average */}
          <div className="metric-card">
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: `conic-gradient(#667eea ${overallAvgMarks * 3.6}deg, #E5E7EB 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              position: 'relative'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiTrendingUp style={{ color: '#667eea', fontSize: '20px' }} />
              </div>
            </div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1F2937',
              margin: '0 0 4px 0'
            }}>
              {Math.round(overallAvgMarks)}%
            </h3>
            <p style={{
              color: '#6B7280',
              fontSize: '14px',
              margin: '0',
              fontWeight: '500'
            }}>
              Overall Average
            </p>
            <div style={{
              marginTop: '12px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: overallAvgMarks >= 80 ? '#D1FAE5' : overallAvgMarks >= 60 ? '#FEF3C7' : '#FEE2E2',
              color: overallAvgMarks >= 80 ? '#065F46' : overallAvgMarks >= 60 ? '#92400E' : '#991B1B',
              fontSize: '12px',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              {overallAvgMarks >= 80 ? 'Excellent' : overallAvgMarks >= 60 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>

          {/* Highest Subject */}
          <div className="metric-card">
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#D1FAE5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FiTrendingUp style={{ color: '#16A34A', fontSize: '24px' }} />
            </div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#16A34A',
              margin: '0 0 4px 0'
            }}>
              {highestSubjectMark}%
            </h3>
            <p style={{
              color: '#6B7280',
              fontSize: '14px',
              margin: '0',
              fontWeight: '500'
            }}>
              Best Subject Score
            </p>
            <div className="status-indicator" style={{
              background: '#D1FAE5',
              color: '#065F46'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#16A34A'
              }}></div>
              Strong Performance
            </div>
          </div>

          {/* Lowest Subject */}
          <div className="metric-card">
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FiTrendingDown style={{ color: '#DC2626', fontSize: '24px' }} />
            </div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#DC2626',
              margin: '0 0 4px 0'
            }}>
              {lowestSubjectMark}%
            </h3>
            <p style={{
              color: '#6B7280',
              fontSize: '14px',
              margin: '0',
              fontWeight: '500'
            }}>
              Area for Improvement
            </p>
            <div className="status-indicator" style={{
              background: '#FEE2E2',
              color: '#991B1B'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#DC2626'
              }}></div>
              Focus Required
            </div>
          </div>
        </div>
      </div>

      {/* SUBJECT-WISE ANALYSIS */}
      {data.subjectSuggestions && data.subjectSuggestions.length > 0 && (
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#1F2937',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FiBook style={{ color: '#667eea' }} />
            Subject-wise Analysis
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {data.subjectSuggestions.map((subject, idx) => {
              return (
                <div
                  key={idx}
                  className="subject-card"
                  onClick={() => setSelectedSubject(subject)}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: '800',
                      color: '#1F2937',
                      margin: '0'
                    }}>
                      {subject.subject}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                      {subject.examDate ? (
                        <div className="status-indicator" style={{
                          background: '#FEF3C7',
                          color: '#92400E',
                          fontSize: '11px'
                        }}>
                          <FiCalendar style={{ fontSize: '12px' }} />
                          Exam: {subject.examDate}
                        </div>
                      ) : (
                        <div className="status-indicator" style={{
                          background: '#DBEAFE',
                          color: '#1D4ED8',
                          fontSize: '11px'
                        }}>
                          No upcoming exam
                        </div>
                      )}
                      <small style={{ color: '#6B7280', marginTop: '4px' }}>
                        {subject.marks >= 85 ? 'High score' : subject.marks >= 60 ? 'Moderate score' : 'Needs improvement'}
                      </small>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: subject.completion >= 70 ? '#16A34A' :
                               subject.completion >= 40 ? '#CA8A04' : '#DC2626',
                        marginBottom: '4px'
                      }}>
                        {subject.completion}%
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}>
                        Completion
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: subject.marks >= 80 ? '#16A34A' :
                               subject.marks >= 60 ? '#CA8A04' : '#DC2626',
                        marginBottom: '4px'
                      }}>
                        {subject.marks}%
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}>
                        Avg Marks
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: '1px dashed #6366F1',
                    marginTop: '8px'
                  }}>
                    <FiTrendingUp style={{ color: '#6366F1', fontSize: '16px' }} />
                    <span style={{
                      color: '#6366F1',
                      fontSize: '13px',
                      fontWeight: '700'
                    }}>
                      Personalized Strategy
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBJECT DETAIL MODAL */}
      {selectedSubject && (
        <div className="modal-overlay" onClick={() => setSelectedSubject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedSubject(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#F3F4F6',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#4B5563',
                padding: '4px',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#1F2937',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  {selectedSubject.subject.charAt(0)}
                </div>
                {selectedSubject.subject} Insights
              </h2>
              <p style={{ color: '#6B7280', margin: '0', fontSize: '16px' }}>
                Rule-based intelligent guidance for this subject
              </p>
            </div>

            {/* METRICS GRID */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: '#F8FAFC',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #E2E8F0'
              }}>
                <FiTarget style={{ color: '#667eea', fontSize: '20px', marginBottom: '8px' }} />
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1F2937' }}>
                  {selectedSubject.completion}%
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                  Completion
                </div>
              </div>

              <div style={{
                background: '#F8FAFC',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #E2E8F0'
              }}>
                <FiTrendingUp style={{
                  color: selectedSubject.marks >= 80 ? '#16A34A' : selectedSubject.marks >= 60 ? '#CA8A04' : '#DC2626',
                  fontSize: '20px',
                  marginBottom: '8px'
                }} />
                <div style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                  color: selectedSubject.marks >= 80 ? '#16A34A' : selectedSubject.marks >= 60 ? '#CA8A04' : '#DC2626'
                }}>
                  {selectedSubject.marks}%
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                  Avg Marks
                </div>
              </div>

              <div style={{
                background: '#F8FAFC',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                border: '1px solid #E2E8F0'
              }}>
                <FiCalendar style={{ color: '#667eea', fontSize: '20px', marginBottom: '8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1F2937', marginTop: '8px' }}>
                  {selectedSubject.examDate || 'Not Set'}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>
                  Exam Schedule
                </div>
              </div>
            </div>

            {/* AI SUGGESTIONS */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1F2937',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiTrendingUp style={{ color: '#667eea' }} />
                AI Strategy Cards
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {selectedSubjectSuggestions.length > 0 ? (
                  selectedSubjectSuggestions.map((sug, i) => (
                    <AIRecommendationCard key={i} suggestion={sug} />
                  ))
                ) : (
                  <div style={{ padding: '32px', textAlign: 'center', background: '#F9FAFB', borderRadius: '16px', border: '1px dashed #D1D5DB' }}>
                    <p style={{ color: '#6B7280' }}>No AI suggestions available at the moment.</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{
                color: 'white',
                margin: '0',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                💡 Keep learning consistently to achieve your academic goals!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AISuggestions;
