import { useState, useEffect } from "react";

function Subjectdetails({ subject, goBack }) {

  const [material, setMaterial] = useState(null);
  const [completed, setCompleted] = useState([]);

  // Fetch material
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/materials?subject=${subject.name}&topic=${subject.title}`)
      .then(res => res.json())
      .then(data => {
        if (!data.message) {
          setMaterial(data);
        } else {
          setMaterial(null);
        }
      })
      .catch(err => console.log(err));
  }, [subject]);

  // Toggle completion
  const toggle = (type) => {
    if (completed.includes(type)) {
      setCompleted(completed.filter(i => i !== type));
    } else {
      setCompleted([...completed, type]);
    }
  };

  // Progress calculation
  const videoDone = completed.includes("video");
  const pdfDone = completed.includes("pdf");
  const progress = (videoDone ? 50 : 0) + (pdfDone ? 50 : 0);

  // Convert YouTube URL
  const getEmbedUrl = (url) => {
    if (!url) return "";

    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }

    if (url.includes("watch?v=")) {
      const id = url.split("watch?v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }

    return url;
  };

  return (
    <div className="page">

      <button className="secondary-btn" onClick={goBack}>
        ← Back
      </button>

      {/* SUBJECT HEADER */}
      <div className="subject-card">
        <h2>{subject.name}</h2>
        <p>{subject.title}</p>
      </div>

      {!material ? (
        <div style={{
          backgroundColor: "#f8f9fa",
          border: "2px solid #dee2e6",
          borderRadius: "8px",
          padding: "30px",
          textAlign: "center",
          marginTop: "20px"
        }}>
          <h3 style={{ color: "#495057", marginBottom: "10px" }}>📚 No Materials Available Yet</h3>
          <p style={{ color: "#6c757d", fontSize: "16px", lineHeight: "1.6" }}>
            The faculty hasn't uploaded any study materials for this topic yet. <br/>
            Please check back later or contact your faculty member.
          </p>
          <svg style={{ width: "60px", height: "60px", margin: "20px auto", opacity: "0.3" }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 16a8 8 0 10-8 0h16z" />
          </svg>
        </div>
      ) : (
        <>
          {/* CONTENT CARD */}
          <div className="card content-card">
            <h3>📚 Study Content</h3>
            <p>{material.content}</p>
          </div>

          {/* VIDEO CARD */}
          {material.videoLink && (
            <div className="card video-card">

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={videoDone}
                  onChange={() => toggle("video")}
                />
                Mark Video Complete
              </label>

              <h3>📺 Video Lesson</h3>

              <iframe
                src={getEmbedUrl(material.videoLink)}
                title="Study Video"
                allowFullScreen
              ></iframe>

            </div>
          )}

          {/* PDF CARD */}
          {material.pdfLink && (
            <div className="card pdf-card">

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={pdfDone}
                  onChange={() => toggle("pdf")}
                />
                Mark Notes Complete
              </label>

              <h3>📄 Study Notes</h3>

              <iframe
                src={material.pdfLink}
                title="PDF Viewer"
              ></iframe>

            </div>
          )}

          {/* PROGRESS */}
          <div className="progress-wrapper">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p>{progress}% completed</p>
          </div>
        </>
      )}

    </div>
  );
}

export default Subjectdetails;
