import { useState, useEffect } from "react";
import AIRecommendationCard from "./AIRecommendationCard";

function StudentAnalysisModal({ student, subject, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeStudent = () => {
      if (!student) return;

      // Calculate analysis for this specific subject
      const subjectMarks = student.marks;
      const daysUntilExam = Math.floor((new Date(student.exam) - new Date()) / (1000 * 60 * 60 * 24));

      const suggestions = [];

      // Rule 1: Subject-specific marks analysis
      if (subjectMarks < 50) {
        suggestions.push({
          title: "⚠️ Critical Performance in Subject",
          description: `This student scored ${subjectMarks}% in ${subject} (${student.title}). This requires immediate intervention.`,
          type: "critical",
          actionable: "Schedule one-on-one sessions, focus on fundamentals, provide extra practice materials, break down complex topics"
        });
      } else if (subjectMarks >= 75) {
        suggestions.push({
          title: "⭐ Excellent Performance",
          description: `Outstanding performance with ${subjectMarks}% in ${subject}. This student shows strong understanding.`,
          type: "positive",
          actionable: "Engage with advanced topics, assign peer tutoring role, give challenging assignments"
        });
      } else {
        suggestions.push({
          title: "📈 Average Performance - Room to Improve",
          description: `Student scored ${subjectMarks}% in ${subject}. Can improve with focused effort.`,
          type: "moderate",
          actionable: "Provide targeted revision, identify weak areas, increase practice with mixed difficulty questions"
        });
      }

      // Rule 2: Exam urgency
      if (daysUntilExam > 0 && daysUntilExam <= 7) {
        suggestions.push({
          title: "⏰ Exam Approaching - Revision Focus",
          description: `Exam in ${daysUntilExam} day(s). Student needs intensive revision in this subject.`,
          type: "urgent",
          actionable: "Quick revision sessions, mock tests, focus on high-weighted topics, stress management tips"
        });
      } else if (daysUntilExam > 7 && daysUntilExam <= 30) {
        suggestions.push({
          title: "📅 Exam in ${daysUntilExam} Days - Structured Learning",
          description: `${daysUntilExam} days until exam. Plan a structured curriculum with time for revision.`,
          type: "moderate",
          actionable: "Complete syllabus coverage, topic-based practice, cumulative assessments, time management training"
        });
      } else if (daysUntilExam > 30) {
        suggestions.push({
          title: "🎯 Long-term Preparation Plan",
          description: `${daysUntilExam} days until exam. Ample time for comprehensive learning.`,
          type: "planning",
          actionable: "Structured curriculum pacing, diverse teaching methods, regular assessments, build confidence gradually"
        });
      }

      // Rule 3: Teaching recommendations based on marks
      if (subjectMarks < 60) {
        suggestions.push({
          title: "🎓 Pedagogy Recommendations",
          description: "Student struggling with fundamental concepts.",
          type: "teaching",
          actionable: "Use visual aids and examples, slow down pace, use multiple teaching methods (video, interactive), frequent polls to check understanding"
        });
      }

      setAnalysis({
        studentName: student.studentName || "Unknown",
        subject: subject,
        topic: student.title,
        marks: subjectMarks,
        examDate: student.exam,
        daysLeft: daysUntilExam,
        suggestions: suggestions
      });

      setLoading(false);
    };

    analyzeStudent();
  }, [student, subject]);

  const getColorByType = (type) => {
    const colors = {
      critical: "#ff6b6b",
      urgent: "#ff9800",
      moderate: "#ffd93d",
      positive: "#6bcf7f",
      planning: "#4ecdc4",
      teaching: "#667eea"
    };
    return colors[type] || "#95e1d3";
  };

  const getBackgroundByType = (type) => {
    const colors = {
      critical: "#ffebee",
      urgent: "#fff3e0",
      moderate: "#fffbe6",
      positive: "#e8f5e9",
      planning: "#e0f7f4",
      teaching: "#eef2ff"
    };
    return colors[type] || "#f0f0f0";
  };

  return (
    <div className="analysis-modal">
      <div className="analysis-modal-content">
        {/* CLOSE BUTTON */}
        <button className="analysis-close-btn" onClick={onClose}>✕</button>

        {loading ? (
          <div className="loading-message">
            <p>📊 Analyzing student performance...</p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="analysis-header">
              <h2>{analysis.studentName}</h2>
              <p className="analysis-meta">
                Subject: <strong>{analysis.subject}</strong> | Topic: <strong>{analysis.topic}</strong>
              </p>
            </div>

            {/* KEY METRICS */}
            <div className="stats-grid">
              {/* MARKS CARD */}
              <div className={`stat-box ${analysis.marks >= 75 ? "high" : analysis.marks >= 50 ? "medium" : "low"}`}>
                <p className="stat-label-small">Subject Marks ({analysis.subject})</p>
                <h3 className="stat-value-large">{analysis.marks}%</h3>
                <div className="progress-bar-small">
                  <div className={`progress-fill-small ${analysis.marks >= 75 ? "strong" : analysis.marks >= 50 ? "moderate" : "weak"}`} style={{ width: `${analysis.marks}%` }}></div>
                </div>
              </div>

              {/* EXAM DATE CARD */}
              <div className={`stat-box ${analysis.daysLeft <= 7 && analysis.daysLeft > 0 ? "low" : analysis.daysLeft > 30 ? "high" : "medium"}`}>
                <p className="stat-label-small">Exam Status</p>
                <h3 className="stat-value-large">{analysis.daysLeft > 0 ? `${analysis.daysLeft} days` : "Passed"}</h3>
                <p className="stat-label-small">{new Date(analysis.examDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* RECOMMENDATIONS */}
            <div className="analysis-suggestions">
              <h3>🎯 Teaching Recommendations</h3>

              {analysis.suggestions.map((sug, idx) => (
                <AIRecommendationCard key={idx} suggestion={sug} />
              ))}
            </div>

            {/* FOOTER */}
            <div className="analysis-footer">
              💡 Use these insights to personalize your teaching approach for this student
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentAnalysisModal;
