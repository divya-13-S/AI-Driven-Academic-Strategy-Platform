import { useEffect, useState } from "react";
import Layout from "../components/Layout";

function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    fetch("http://localhost:8080/feedback")
      .then(res => res.json())
      .then(data => setFeedbacks(data))
      .catch(err => console.log(err));
  }, []);

  const calculateStats = () => {
    if (feedbacks.length === 0) return { avgTeaching: 0, avgOverall: 0, avgDoubt: 0, avgPace: 0 };
    
    const avgTeaching = (feedbacks.reduce((sum, f) => sum + (parseInt(f.teachingRating) || 0), 0) / feedbacks.length).toFixed(1);
    const avgOverall = (feedbacks.reduce((sum, f) => sum + (parseInt(f.overallRating) || 0), 0) / feedbacks.length).toFixed(1);
    const avgDoubt = (feedbacks.reduce((sum, f) => sum + (parseInt(f.doubtClearing) || 0), 0) / feedbacks.length).toFixed(1);
    const avgPace = (feedbacks.reduce((sum, f) => sum + (parseInt(f.paceOfTeaching) || 0), 0) / feedbacks.length).toFixed(1);
    
    return { avgTeaching, avgOverall, avgDoubt, avgPace };
  };

  const filteredFeedbacks = feedbacks
    .filter(f => 
      f.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.faculty?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "highest") return (b.overallRating || 0) - (a.overallRating || 0);
      if (sortBy === "lowest") return (a.overallRating || 0) - (b.overallRating || 0);
      return 0;
    });

  const StarRating = ({ rating, maxRating = 5 }) => {
    return (
      <div className="stars">
        {[...Array(maxRating)].map((_, i) => (
          <span key={i} className={i < rating ? "star" : "star-empty"}>★</span>
        ))}
        <span style={{ marginLeft: "8px" }}>{rating}/{maxRating}</span>
      </div>
    );
  };

  const getQualityClass = (rating) => {
    if (rating >= 4) return "high";
    if (rating >= 3) return "medium";
    return "low";
  };

  const stats = calculateStats();

  return (
    <Layout>
      <div className="feedback-page">
        
        {/* HEADER */}
        <div className="feedback-header">
          <h2>Student Feedback Dashboard</h2>
          <p className="feedback-header-desc">View and analyze all student feedback</p>
        </div>

        {/* STATISTICS */}
        {feedbacks.length > 0 && (
          <div className="stat-cards">
            <div className="stat-card blue">
              <p className="stat-label">Total Feedback</p>
              <p className="stat-value">{feedbacks.length}</p>
            </div>
            <div className="stat-card orange">
              <p className="stat-label">Avg Teaching Quality</p>
              <p className="stat-value">{stats.avgTeaching}/5</p>
            </div>
            <div className="stat-card green">
              <p className="stat-label">Avg Overall Rating</p>
              <p className="stat-value">{stats.avgOverall}/5</p>
            </div>
            <div className="stat-card cyan">
              <p className="stat-label">Avg Doubt Clearing</p>
              <p className="stat-value">{stats.avgDoubt}/5</p>
            </div>
          </div>
        )}

        {/* SEARCH AND FILTERS */}
        <div className="search-filter-box">
          <div className="search-container" style={{ gridTemplateColumns: "1fr auto" }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search by student name, subject, or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="search-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="latest">Latest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
          <p className="search-info">Showing {filteredFeedbacks.length} of {feedbacks.length} feedback</p>
        </div>


        {/* FEEDBACK CARDS */}
        {filteredFeedbacks.length === 0 ? (
          <div className="empty-message">
            {feedbacks.length === 0 ? "No feedback available yet" : "No feedback matches your search"}
          </div>
        ) : (
          <div className="feedback-cards">
            {filteredFeedbacks.map((item) => (
              <div key={item._id} className={`feedback-card ${getQualityClass(item.overallRating)}`}>
                
                {/* HEADER */}
                <div className="feedback-card-header">
                  <div className="feedback-card-title">
                    <h3>{item.studentName}</h3>
                    <p className="feedback-card-meta">{item.subject} • {item.topic}</p>
                  </div>
                  <div className="feedback-card-rating">
                    <div className="material-box" style={{ marginBottom: "5px", width: "70px", marginLeft: "auto" }}>
                      {item.overallRating}/5 ⭐
                    </div>
                    <small style={{ color: "#999" }}>{new Date(item.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>

                {/* BODY */}
                <div className="feedback-card-body">
                  {/* BASIC INFO */}
                  <div className="feedback-section">
                    <div className="ratings-grid">
                      <div>
                        <p className="feedback-label">Faculty</p>
                        <p className="feedback-value">{item.faculty}</p>
                      </div>
                      <div>
                        <p className="feedback-label">Marks Obtained</p>
                        <p className="feedback-value">{item.marksObtained || "N/A"}%</p>
                      </div>
                    </div>
                  </div>

                  {/* RATINGS */}
                  <div className="feedback-section">
                    <p className="feedback-label" style={{ marginBottom: "10px" }}>Teaching Ratings</p>
                    <div className="ratings-grid">
                      <div className="rating-item">
                        <p className="feedback-label">Teaching Quality</p>
                        <StarRating rating={item.teachingRating || 0} />
                      </div>
                      <div className="rating-item">
                        <p className="feedback-label">Doubt Clearing</p>
                        <StarRating rating={item.doubtClearing || 0} />
                      </div>
                      <div className="rating-item">
                        <p className="feedback-label">Teaching Pace</p>
                        <StarRating rating={item.paceOfTeaching || 0} />
                      </div>
                    </div>
                  </div>

                  {/* MATERIALS FEEDBACK */}
                  <div className="feedback-section">
                    <p className="feedback-label" style={{ marginBottom: "10px" }}>Materials & Content</p>
                    <div className="material-feedback">
                      <div className={`material-box ${item.materialsUseful?.includes("Very") ? "good" : item.materialsUseful?.includes("Not") ? "bad" : item.materialsUseful?.includes("Somewhat") ? "medium" : "none"}`}>
                        📚 Materials: {item.materialsUseful || "N/A"}
                      </div>
                      <div className={`material-box ${item.videoUseful?.includes("Very") ? "good" : item.videoUseful?.includes("Not") ? "bad" : item.videoUseful?.includes("Somewhat") ? "medium" : "none"}`}>
                        🎥 Videos: {item.videoUseful || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* SUGGESTIONS */}
                  {item.otherSuggestions && (
                    <div className="feedback-section">
                      <p className="feedback-label">Student Suggestions</p>
                      <div className="suggestions-box">
                        <p>{item.otherSuggestions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AdminFeedback;
