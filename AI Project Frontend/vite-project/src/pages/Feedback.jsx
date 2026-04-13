import { useState , useEffect } from "react";
import Layout from "../components/Layout";

function Feedback() {

  const [form, setForm] = useState({
    studentName: "",
    subject: "",
    topic: "",
    faculty: "",
    marksObtained: "",
    materialsUseful: "",
    videoUseful: "",
    teachingRating: "",
    doubtClearing: "",
    paceOfTeaching: "",
    overallRating: "",
    otherSuggestions: ""
  });

    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
  if (showSuccess) {
    const timer = setTimeout(() => {
      setShowSuccess(false);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer); 
  }
}, [showSuccess]);

  const handleSubmit = async () => {

    try {

      const res = await fetch("http://localhost:8080/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      setShowSuccess(true);

      setForm({
        studentName: "",
        subject: "",
        topic: "",
        faculty: "",
        marksObtained: "",
        materialsUseful: "",
        videoUseful: "",
        teachingRating: "",
        doubtClearing: "",
        paceOfTeaching: "",
        overallRating: "",
        otherSuggestions: ""
      });

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout>

      <div className="feedback-container">

        <h2>📝 Student Feedback Form</h2>

        {/* SECTION 1: STUDENT INFORMATION */}
        <div className="feedback-section student-info">
          <h3>👤 STUDENT INFORMATION</h3>

          <input className="feedback-input" placeholder="Your Name *" required
            value={form.studentName}
            onChange={(e)=>setForm({...form, studentName:e.target.value})}
          />

          <input className="feedback-input" placeholder="Subject *" required
            value={form.subject}
            onChange={(e)=>setForm({...form, subject:e.target.value})}
          />

          <input className="feedback-input" placeholder="Topic Studied *" required
            value={form.topic}
            onChange={(e)=>setForm({...form, topic:e.target.value})}
          />

          <input className="feedback-input" placeholder="Faculty Name *" required
            value={form.faculty}
            onChange={(e)=>setForm({...form, faculty:e.target.value})}
          />

          <label className="form-label">📊 Marks Obtained</label>
          <input className="feedback-input" type="number" min="0" max="100" placeholder="Enter marks (0-100)"
            value={form.marksObtained}
            onChange={(e)=>setForm({...form, marksObtained:e.target.value})}
          />
        </div>

        {/* SECTION 2: TEACHING EVALUATION
        <div className="feedback-section teaching-eval">
          <h3>🎓 TEACHING QUALITY EVALUATION</h3>

          <label className="form-label">Overall Teaching Quality (1-5)</label>
          <input className="feedback-input" type="number" min="1" max="5"
            value={form.teachingRating}
            onChange={(e)=>setForm({...form, teachingRating:e.target.value})}
          />

          <label className="form-label">Doubt Clearing Rating (1-5)</label>
          <input className="feedback-input" type="number" min="1" max="5"
            value={form.doubtClearing}
            onChange={(e)=>setForm({...form, doubtClearing:e.target.value})}
          />

          <label className="form-label">Pace of Teaching (1-5)</label>
          <input className="feedback-input" type="number" min="1" max="5"
            value={form.paceOfTeaching}
            onChange={(e)=>setForm({...form, paceOfTeaching:e.target.value})}
          />
        </div> */}

        {/* SECTION 3: MATERIAL & CONTENT FEEDBACK */}
        <div className="feedback-section materials">
          <h3>📚 LEARNING MATERIALS FEEDBACK</h3>

          <label className="form-label">Were the Study Materials Useful?</label>
          <select className="feedback-select"
            value={form.materialsUseful}
            onChange={(e)=>setForm({...form, materialsUseful:e.target.value})}
          >
            <option value="">-- Select an option --</option>
            <option value="Very Useful">✅ Very Useful</option>
            <option value="Somewhat Useful">⭐ Somewhat Useful</option>
            <option value="Not Useful">❌ Not Useful</option>
          </select>

          <label className="form-label">Were the Videos Helpful?</label>
          <select className="feedback-select"
            value={form.videoUseful}
            onChange={(e)=>setForm({...form, videoUseful:e.target.value})}
          >
            <option value="">-- Select an option --</option>
            <option value="Very Helpful">✅ Very Helpful</option>
            <option value="Somewhat Helpful">⭐ Somewhat Helpful</option>
            <option value="Not Helpful">❌ Not Helpful</option>
            <option value="No Video Provided">⊘ No Video Provided</option>
          </select>
        </div>

        {/* SECTION 4: OVERALL & SUGGESTIONS */}
        <div className="feedback-section overall">
          <h3>⭐ OVERALL RATING & SUGGESTIONS</h3>

          <label className="form-label">Overall Rating (1-5)</label>
          <input className="feedback-input" type="number" min="1" max="5"
            value={form.overallRating}
            onChange={(e)=>setForm({...form, overallRating:e.target.value})}
          />

          <label className="form-label">Additional Feedback & Suggestions</label>
          <textarea className="feedback-textarea" placeholder="Share any other suggestions or comments to improve teaching and learning experience..."
            value={form.otherSuggestions}
            onChange={(e)=>setForm({...form, otherSuggestions:e.target.value})}
          />
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          ✓ Submit Feedback
        </button>

        {showSuccess && (
          <div className="success-overlay">
            <div className="success-card">
              <div className="success-icon">✓</div>
              <h3>Submitted Successfully</h3>
              <p>Your response has been recorded.</p>
            </div>
          </div>
        )}
      </div>

    </Layout>
  );
}

export default Feedback;
