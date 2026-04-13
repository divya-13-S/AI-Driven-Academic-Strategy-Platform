import { useState } from "react";

function AddSubject() {

  const [showModal, setShowModal] = useState(true);

  const [form, setForm] = useState({
    subject: "",
    topic: "",
    examDate: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!form.subject.trim() || !form.topic.trim() || !form.examDate) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    alert("Subject Added Successfully!");
    
    // Reset form
    setForm({
      subject: "",
      topic: "",
      examDate: ""
    });
    setIsSubmitting(false);
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h2>📚 Add Subject</h2>

        <form onSubmit={handleSubmit}>

          <div className="form-section">
            <label className="form-label">Subject Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Mathematics, Physics, Chemistry"
              value={form.subject}
              onChange={(e)=>setForm({...form,subject:e.target.value})}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-section">
            <label className="form-label">Topic</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Algebra, Thermodynamics"
              value={form.topic}
              onChange={(e)=>setForm({...form,topic:e.target.value})}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-section">
            <label className="form-label">Exam Date</label>
            <input
              type="date"
              className="form-control"
              value={form.examDate}
              onChange={(e)=>setForm({...form,examDate:e.target.value})}
              disabled={isSubmitting}
            />
          </div>

          <div className="addsubject-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={()=>setShowModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Subject"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default AddSubject;
