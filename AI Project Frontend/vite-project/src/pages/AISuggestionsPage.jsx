import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiTrendingUp, FiBookOpen, FiCalendar, FiPieChart } from "react-icons/fi";
import AIRecommendationCard from "../components/AIRecommendationCard";

function AISuggestionsPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [completedUnits, setCompletedUnits] = useState([]);
  const [examSchedule, setExamSchedule] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // 🔹 RANDOMIZATION HELPER
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const VARIATIONS = {
    overall: {
      lowPerformance: [
        "Your overall performance is low. Focus on revising core concepts.",
        "You need to strengthen fundamentals. Practice regularly.",
        "Performance is below average. Allocate more time for studies."
      ],
      moderatePerformance: [
        "You are doing okay, but improvement is possible.",
        "Your performance is stable. Focus on weaker subjects.",
        "You are on track, but consistency can boost your scores."
      ],
      highPerformance: [
        "Great job! Maintain this performance.",
        "Excellent work! Keep pushing for higher scores.",
        "Strong performance! Stay consistent."
      ],
      lowCompletion: [
        "You have pending topics. Complete them soon.",
        "Focus on finishing your syllabus.",
        "Your completion is low. Prioritize pending units."
      ],
      examNear: [
        "Exams are very close. Focus on revision.",
        "Avoid new topics and revise what you learned.",
        "Quick revision will help you perform better."
      ]
    },
    subject: {
      lowCompExamNear: [
        "Complete important topics quickly.",
        "Focus on high-weight chapters immediately.",
        "Revise key concepts before the exam."
      ],
      highCompLowMarks: [
        "You studied well but need more practice.",
        "Try solving more test papers.",
        "Focus on applying concepts better."
      ],
      lowCompNoExam: [
        "You have time to complete topics.",
        "Gradually finish remaining syllabus.",
        "Plan your study schedule effectively."
      ],
      highMarks: [
        "Excellent performance!",
        "Keep maintaining this level.",
        "Great work, stay consistent!"
      ],
      avgMarks: [
        "You are doing well, aim higher.",
        "Improve accuracy for better scores.",
        "Focus on weak areas."
      ],
      examClose: [
        "Only revision now, no new topics.",
        "Quick recap will help you.",
        "Focus on important formulas and concepts."
      ]
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      const userId = localStorage.getItem("userId");
      try {
        const [marksRes, compRes, examRes] = await Promise.all([
          fetch(`http://localhost:8080/subject/${userId}`),
          fetch(`http://localhost:8080/completion/${userId}`),
          fetch(`http://localhost:8080/exam-schedule/student/${userId}`).catch(() => ({ ok: false }))
        ]);

        const marksData = marksRes.ok ? await marksRes.json() : [];
        const compData = compRes.ok ? await compRes.json() : [];
        const examData = examRes.ok ? await examRes.json() : [];

        setSubjects(marksData);
        setCompletedUnits(compData);
        setExamSchedule(Array.isArray(examData) ? examData : []);

        const result = runAIAnalysis(marksData, compData, Array.isArray(examData) ? examData : []);
        setAnalysis(result);
      } catch (err) {
        console.error("Analysis Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const runAIAnalysis = (marksData, compData, examData) => {
    const today = new Date();
    const enrolledNames = [...new Set([...marksData.map(m => m.name), ...compData.map(c => c.subject)])];
    
    // Overall Stats
    const totalMarks = marksData.reduce((acc, m) => acc + Number(m.marks || 0), 0);
    const avgOverallMarks = marksData.length > 0 ? totalMarks / marksData.length : 0;
    
    const totalUnitsRequired = enrolledNames.length * 5;
    const completedCount = compData.length;
    const overallComp = totalUnitsRequired > 0 ? (completedCount / totalUnitsRequired) * 100 : 0;

    const nearExam = examData.find(ex => {
      const diff = (new Date(ex.examDate) - today) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 3;
    });

    const overallSugs = [];
    if (avgOverallMarks < 60) overallSugs.push({ message: "Your overall performance is below target. Focus on core concepts.", type: "performance", icon: <FiAlertCircle /> });
    else if (avgOverallMarks <= 80) overallSugs.push({ message: "You are on the right track. Keep maintaining consistency.", type: "performance", icon: <FiInfo /> });
    else overallSugs.push({ message: "Excellent overall performance! You are leading the pack.", type: "performance", icon: <FiCheckCircle /> });

    if (overallComp < 50) overallSugs.push({ message: "Your syllabus completion is low. Prioritize your pending units.", type: "completion", icon: <FiBookOpen /> });
    if (nearExam) overallSugs.push({ message: "Exams are approaching soon. Shift into revision mode.", type: "exam", icon: <FiCalendar /> });

    // Subject Wise Analysis
    const subjectDetails = enrolledNames.map(name => {
      const subMarksObj = marksData.filter(m => m.name === name);
      const subAvgMarks = subMarksObj.length > 0 ? subMarksObj.reduce((a, b) => a + Number(b.marks), 0) / subMarksObj.length : 0;
      const subCompCount = compData.filter(c => c.subject === name).length;
      const subCompPerc = (subCompCount / 5) * 100;
      const subExam = examData.find(ex => ex.subject === name);
      const daysUntilExam = subExam ? Math.floor((new Date(subExam.examDate) - today) / (1000 * 60 * 60 * 24)) : null;

      const subjectSugs = [];

      // 1. PERFORMANCE CARD
      if (subAvgMarks < 60) {
        subjectSugs.push({
          title: "Average Performance - Room to Improve",
          description: `You scored ${Math.round(subAvgMarks)}%. Can improve with focused effort.`,
          type: "moderate",
          actionPlan: ["Target weak areas", "Practice mixed difficulty questions", "Revise key concepts"]
        });
      } else if (subAvgMarks >= 60 && subAvgMarks <= 80) {
        subjectSugs.push({
          title: "Good Performance - Can Improve Further",
          description: `You scored ${Math.round(subAvgMarks)}%. You are doing well!`,
          type: "positive",
          actionPlan: ["Aim for perfection", "Take advanced mock tests", "Master complex topics"]
        });
      } else {
        subjectSugs.push({
          title: "Strong Performance - Keep It Up",
          description: `You scored ${Math.round(subAvgMarks)}%. Outstanding work!`,
          type: "planning",
          actionPlan: ["Maintain consistency", "Help peers with concepts", "Explore extra-curricular reading"]
        });
      }

      // 2. EXAM CARD
      if (daysUntilExam !== null && daysUntilExam >= 0 && daysUntilExam <= 7) {
        subjectSugs.push({
          title: "Exam Approaching - Revision Focus",
          description: `Exam in ${daysUntilExam} days. You need intensive revision.`,
          type: "urgent",
          actionPlan: ["Focus on high-weight topics", "Take mock tests", "Avoid new topics"]
        });
      } else if (daysUntilExam !== null && daysUntilExam > 7 && daysUntilExam <= 14) {
        subjectSugs.push({
          title: "Upcoming Exam - Preparation Phase",
          description: `Exam in ${daysUntilExam} days. Start your final prep.`,
          type: "urgent",
          actionPlan: ["Review all chapters", "Practice previous papers", "Group study sessions"]
        });
      }

      // 3. COMPLETION CARD
      if (subCompPerc < 50) {
        subjectSugs.push({
          title: "Low Completion - Urgent Attention Needed",
          description: `You have completed only ${Math.round(subCompPerc)}% of the syllabus.`,
          type: "critical",
          actionPlan: ["Complete pending topics", "Prioritize important chapters", "Track daily progress"]
        });
      } else if (subCompPerc < 80) {
        subjectSugs.push({
          title: "Moderate Completion - Stay Consistent",
          description: `You have completed ${Math.round(subCompPerc)}% of the syllabus.`,
          type: "moderate",
          actionPlan: ["Finish remaining units", "Balance revision with new topics", "Set weekly targets"]
        });
      } else {
        subjectSugs.push({
          title: "High Completion - Almost There",
          description: `You have completed ${Math.round(subCompPerc)}% of the syllabus.`,
          type: "positive",
          actionPlan: ["Final revision of all units", "Check for any skipped minor topics", "Attempt full-length tests"]
        });
      }

      return {
        name,
        completion: Math.min(100, subCompPerc),
        avgMarks: Math.round(subAvgMarks),
        examDate: subExam ? new Date(subExam.examDate).toLocaleDateString() : "No exam scheduled",
        suggestions: subjectSugs
      };
    });

    return {
      avgMarks: Math.round(avgOverallMarks),
      overallComp: Math.round(overallComp),
      overallSuggestions: overallSugs,
      subjectDetails
    };
  };

  return (
    <Layout>
      <style>{`
        .ai-card { background: white; border-radius: 20px; padding: 24px; border: 1px solid #E5E7EB; transition: all 0.3s ease; }
        .ai-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border-color: #4F46E5; }
        .overall-suggestion-item { padding: 16px; border-radius: 14px; display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .performance { background: #fee2e2; color: #b91c1c; }
        .completion { background: #eff6ff; color: #1d4ed8; }
        .exam { background: #fff7ed; color: #c2410c; }
        .progress-track { background: #F3F4F6; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .progress-fill { background: #4F46E5; height: 100%; transition: width 1s ease-in-out; }
      `}</style>

      <div className="ai-page" style={{ padding: '30px' }}>
        <div className="ai-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#111827' }}>AI Learning Insights</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6B7280' }}>Standardized intelligent guidance for your academic growth</p>
          </div>
          <button className="ai-back-btn" onClick={() => navigate("/student")} style={{ padding: '10px 20px', borderRadius: '12px', background: '#F3F4F6', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><h2>Generating Insights...</h2></div>
        ) : !analysis ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><h2>No data found</h2></div>
        ) : (
          <>
            {/* OVERALL SUGGESTIONS */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiPieChart /> Overall Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="ai-card" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: 'white' }}>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Overall Average</div>
                  <div style={{ fontSize: '48px', fontWeight: 800 }}>{analysis.avgMarks}%</div>
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Course Completion</span>
                      <span>{analysis.overallComp}%</span>
                    </div>
                    <div className="progress-track" style={{ background: 'rgba(255,255,255,0.2)' }}>
                      <div className="progress-fill" style={{ width: `${analysis.overallComp}%`, background: 'white' }}></div>
                    </div>
                  </div>
                </div>
                <div className="ai-card">
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Key Recommendations</h4>
                  {analysis.overallSuggestions.map((s, idx) => (
                    <div key={idx} className={`overall-suggestion-item ${s.type}`}>
                      <span style={{ fontSize: '20px' }}>{s.icon}</span>
                      <span style={{ fontWeight: 600 }}>{s.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SUBJECT WISE CARDS */}
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiBookOpen /> Subject-Wise Analysis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {analysis.subjectDetails.map((sub) => (
                <div key={sub.name} className="ai-card" onClick={() => setSelectedSubject(sub)} style={{ cursor: 'pointer', borderLeft: '6px solid #4F46E5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                     <div style={{ width: '40px', height: '40px', background: '#EEF2FF', color: '#4F46E5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{sub.name.charAt(0)}</div>
                      <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: sub.avgMarks >= 80 ? '#ECFDF5' : sub.avgMarks >= 60 ? '#FEF3C7' : '#FEF2F2', color: sub.avgMarks >= 80 ? '#065F46' : sub.avgMarks >= 60 ? '#92400E' : '#B91C1C' }}>
                        {sub.avgMarks}% Avg Marks
                      </span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: '18px' }}>{sub.name}</h4>
                  <div style={{ margin: '16px 0' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Syllabus Covered</span>
                      <span>{sub.completion}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${sub.completion}%` }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {sub.suggestions.map((s, i) => (
                      <span key={i} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#F3F4F6', color: '#6B7280' }}>
                        {s.title.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* MODAL FOR SUBJECT DETAIL */}
        {selectedSubject && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
            <div className="ai-card" style={{ maxWidth: '650px', width: '90%', position: 'relative', maxHeight: '90vh', overflowY: 'auto', padding: '40px' }}>
               <button onClick={() => setSelectedSubject(null)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: '#F3F4F6', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</button>
               
               <div style={{ marginBottom: '32px' }}>
                 <h2 style={{ margin: '0 0 4px 0', fontSize: '28px' }}>{selectedSubject.name}</h2>
                 <p style={{ margin: 0, color: '#6B7280' }}>Personalized Academic Recommendations</p>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Avg Marks</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{selectedSubject.avgMarks}%</div>
                  </div>
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Completion</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>{selectedSubject.completion}%</div>
                  </div>
                  <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Exam Date</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>{selectedSubject.examDate}</div>
                  </div>
               </div>

               <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <FiTrendingUp style={{ color: '#4F46E5' }} /> AI Recommendations
               </h3>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {selectedSubject.suggestions.length > 0 ? (
                    selectedSubject.suggestions.map((sug, i) => (
                       <AIRecommendationCard key={i} suggestion={sug} />
                    ))
                  ) : (
                    <div style={{ padding: '32px', background: '#F9FAFB', borderRadius: '16px', border: '1px dashed #D1D5DB', textAlign: 'center' }}>
                       <p style={{ margin: 0, color: '#6B7280' }}>No AI suggestions available at the moment.</p>
                    </div>
                  )}
               </div>

               <div style={{ padding: '16px', background: '#F0F9FF', borderRadius: '12px', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                 <FiInfo style={{ color: '#0284C7', marginTop: '2px' }} />
                 <p style={{ margin: 0, fontSize: '13px', color: '#0369A1', lineHeight: 1.5 }}>
                   These suggestions are generated based on your real-time performance and completion data. 
                   Following the action plans can help improve your grades significantly.
                 </p>
               </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AISuggestionsPage;
