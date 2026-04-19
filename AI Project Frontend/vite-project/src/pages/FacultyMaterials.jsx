import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

function FacultyMaterials() {

  const navigate = useNavigate();
  const [materials, setMaterials] = useState({});
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [availableTopics, setAvailableTopics] = useState([]);
  const subject = localStorage.getItem("subject");

  // 🔹 FETCH TOPICS AND MATERIALS
  useEffect(() => {
    const fetchAllMaterials = async () => {
      if (!subject) {
        console.log("No subject found in localStorage");
        setLoading(false);
        return;
      }

      try {
        // First, fetch all topics (default + custom)
        console.log("📚 Fetching topics for subject:", subject);
        const topicsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/topics/${subject}`);
        const topicsData = await topicsRes.json();
        const allTopics = topicsData.topics || [];
        
        console.log("✅ Topics fetched:", allTopics);
        setAvailableTopics(allTopics);

        // Then fetch materials for each topic
        const materialData = {};

        for (const topic of allTopics) {
          try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/materials?subject=${subject}&topic=${topic}`);
            const data = await res.json();
            if (!data.message) {
              materialData[topic] = data;
              console.log(`✅ Material found for ${topic}`);
            } else {
              materialData[topic] = null;
              console.log(`⚠️ No material for ${topic}`);
            }
          } catch (err) {
            console.log("Material fetch error:", err);
            materialData[topic] = null;
          }
        }

        setMaterials(materialData);
      } catch (err) {
        console.error("Error fetching topics:", err);
        setAvailableTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMaterials();
  }, [subject, refreshKey]);

  // 🔹 CONVERT YOUTUBE URL
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
    <Layout>

      <div className="faculty-header">
        <div className="materials-header">
          <div>
            <h2 className="faculty-title">📚 Study Materials</h2>
            <p className="faculty-subject">
              Subject: <span>{subject}</span>
            </p>
          </div>
          <div className="materials-controls">
            {/* <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="material-btn material-btn-refresh"
            >
              🔄 Refresh
            </button> */}
            <button
              onClick={() => navigate("/faculty")}
              className="material-btn material-btn-back"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="loading-message">⏳ Loading materials...</p>
      ) : availableTopics.length === 0 ? (
        <p className="loading-message">No topics found for this subject</p>
      ) : (
        <div className="materials-container">
          <div className="materials-stats">
            📊 Units: {availableTopics.length} | Topics with Materials: {Object.values(materials).filter(m => m !== null).length}
          </div>
          <div className="materials-grid">
            {availableTopics.map((topic, index) => {
              const material = materials[topic];
              return (
              <div
                key={topic}
                className={`material-card ${!material ? 'material-card-empty' : ''}`}
                onClick={() => setExpandedTopic(expandedTopic === topic ? null : topic)}
              >
                <h3 className="material-card-title">Unit {index + 1} - {topic}</h3>

                {material ? (
                  <>
                    {material.content && (
                      <p className="material-card-preview">
                        {material.content.substring(0, 100)}...
                      </p>
                    )}

                    <div className="material-card-meta">
                      {material.videoLink && <span style={{ marginRight: "10px" }}>📺 Video</span>}
                      {material.pdfLink && <span>📄 PDF</span>}
                    </div>

                    {/* EXPANDED VIEW */}
                    {expandedTopic === topic && (
                      <div className="material-expanded">
                        {material.content && (
                          <div className="material-section">
                            <h4>📖 Content</h4>
                            <p className="material-content">
                              {material.content}
                            </p>
                          </div>
                        )}

                        {material.videoLink && (
                          <div className="material-section">
                            <h4>📺 Video Lesson</h4>
                            <iframe
                              src={getEmbedUrl(material.videoLink)}
                              title="Study Video"
                              allowFullScreen
                              className="material-video"
                            ></iframe>
                          </div>
                        )}

                        {material.pdfLink && (
                          <div className="material-section">
                            <h4>📄 Study Notes</h4>
                            <a
                              href={material.pdfLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="material-pdf-link"
                            >
                              View PDF Notes
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{
                    fontSize: "13px",
                    color: "#999",
                    fontStyle: "italic",
                    margin: "10px 0"
                  }}>
                    No materials available yet
                  </p>
                )}
              </div>
            );
            })}
          </div>
        </div>
      )}

    </Layout>
  );
}

export default FacultyMaterials;
