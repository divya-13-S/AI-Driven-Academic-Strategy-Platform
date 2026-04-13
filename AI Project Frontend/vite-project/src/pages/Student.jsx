import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiHome, FiBook, FiCalendar, FiBarChart2, FiPieChart, 
  FiMessageCircle, FiSettings, FiLogOut, FiMenu, FiBell, 
  FiTrash2, FiPlusCircle, FiClock, FiCheckCircle, FiUsers,
  FiChevronRight, FiLock
} from "react-icons/fi";
import AISuggestions from "../components/AISuggestions";

function Student() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [globalSubjects, setGlobalSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [completedUnits, setCompletedUnits] = useState([]);
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState(null);
  const [subjectUnits, setSubjectUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [form, setForm] = useState({
    name: "",
    title: "",
    marks: "",
    exam: ""
  });
  const [feedbackForm, setFeedbackForm] = useState({ subject: "", message: "" });
  const [settingsForm, setSettingsForm] = useState({
    name: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifications: true
  });
  const [examSchedule, setExamSchedule] = useState([]);
  const [viewFeedbackHistory, setViewFeedbackHistory] = useState([]);
  const [selectedUnitDetail, setSelectedUnitDetail] = useState(null);
  const [unitMaterials, setUnitMaterials] = useState(null);
  const [selectedMarksSubject, setSelectedMarksSubject] = useState(null);
  const [selectedMarksTopics, setSelectedMarksTopics] = useState([]);
  const [loadingMarksTopics, setLoadingMarksTopics] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [showExamHistory, setShowExamHistory] = useState(false);

  const fetchSubjects = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await fetch(`http://localhost:8080/subject/${userId}`);
      if (res.ok) {
        setSubjects(await res.json());
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchGlobalSubjects = async () => {
    try {
      const res = await fetch("http://localhost:8080/admin/subjects-overview");
      if (res.ok) {
        setGlobalSubjects(await res.json());
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("http://localhost:8080/announcements?target=student");
      if (res.ok) {
        setAnnouncements(await res.json());
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCompletionData = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await fetch(`http://localhost:8080/completion/${userId}`);
      if (res.ok) {
        setCompletedUnits(await res.json());
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleMarkCompleted = async (subject, topic) => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await fetch("http://localhost:8080/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subject, topic })
      });
      if (res.ok) {
        fetchCompletionData();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 🔹 FETCH TOPICS WHEN SUBJECT CHANGES
  useEffect(() => {
    const fetchTopics = async () => {
      if (!form.name) {
        setAvailableTopics([]);
        return;
      }

      setLoadingTopics(true);
      try {
        const res = await fetch(`http://localhost:8080/topics/${form.name}`);
        const data = await res.json();
        setAvailableTopics(data.topics || []);
      } catch (err) {
        console.log("Error fetching topics:", err);
        setAvailableTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, [form.name]);

  const fetchExamSchedule = async () => {
    try {
      const res = await fetch("http://localhost:8080/exams");
      if (res.ok) {
        const data = await res.json();
        // Filter exams for student's enrolled subjects
        const subjectNames = subjects.map(s => s.name);
        setExamSchedule(data.filter(ex => subjectNames.includes(ex.subject)));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchFeedbackHistory = async () => {
    const studentName = localStorage.getItem("name");
    try {
      const res = await fetch("http://localhost:8080/feedback");
      if (res.ok) {
        const data = await res.json();
        setViewFeedbackHistory(data.filter(f => f.studentName === studentName));
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchGlobalSubjects();
    fetchAnnouncements();
    fetchCompletionData();
  }, []);

  useEffect(() => {
    if (subjects.length > 0) {
      fetchExamSchedule();
    }
  }, [subjects]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === "feedback") {
      fetchFeedbackHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchMarksTopics = async () => {
      if (!selectedMarksSubject) {
        setSelectedMarksTopics([]);
        return;
      }

      setLoadingMarksTopics(true);
      try {
        const res = await fetch(`http://localhost:8080/topics/${selectedMarksSubject}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedMarksTopics(data.topics || []);
        } else {
          setSelectedMarksTopics([]);
        }
      } catch (err) {
        console.log(err);
        setSelectedMarksTopics([]);
      } finally {
        setLoadingMarksTopics(false);
      }
    };

    fetchMarksTopics();
  }, [selectedMarksSubject]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const triggerToast = (msg) => {
    alert(msg); // Placeholder for toast
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const studentName = localStorage.getItem("name");
    try {
      const res = await fetch("http://localhost:8080/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "student",
          studentName,
          suggestions: feedbackForm.message,
          overallRating: 5
        })
      });
      if (res.ok) {
        triggerToast("Feedback sent to admin");
        setFeedbackForm({ subject: "", message: "" });
        fetchFeedbackHistory();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddSubject = async () => {
    if (!form.name || !form.title || !form.marks || !form.exam) {
      alert("Fill all fields");
      return;
    }
    const userId = localStorage.getItem("userId");
    try {
      await fetch("http://localhost:8080/subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: form.name,
          title: form.title,
          marks: form.marks,
          exam: form.exam
        })
      });
      setForm({ name: "", title: "", marks: "", exam: "" });
      fetchSubjects();
      setShowModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleMarkAsRead = async (annId) => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await fetch(`http://localhost:8080/announcements/${annId}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        // Update local state to show the announcement as read
        setAnnouncements(prev => prev.map(ann => 
          ann._id === annId ? { ...ann, readBy: [...(ann.readBy || []), userId] } : ann
        ));
        // No toast as per user request
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    try {
      const res = await fetch(`http://localhost:8080/announcements/${annId}`, { 
        method: "DELETE" 
      });
      if (res.ok) {
        setAnnouncements(prev => prev.filter(ann => ann._id !== annId));
        // No toast as per user request
      }
    } catch (err) {
      console.log(err);
    }
  };

  const renderDashboard = () => {
    const userId = localStorage.getItem("userId");
    
    // Categorize ALL announcements by role, defaulting "Exam" related ones to Faculty
    const facultyAnnouncements = announcements.filter(ann => 
      ann.creatorRole === 'faculty' || 
      ann.subject?.toLowerCase().includes("exam")
    );
    const adminAnnouncements = announcements.filter(ann => 
      (ann.creatorRole === 'admin' || !ann.creatorRole) && 
      !ann.subject?.toLowerCase().includes("exam")
    );

    const isRead = (ann) => ann.readBy?.includes(userId);

    return (
      <div className="fade-in">
        <div className="view-header">
          <h2 className="view-title">Welcome back, {localStorage.getItem("name") || "Student"}!</h2>
          <p className="view-subtitle">Here's an overview of your academic progress and latest updates.</p>
        </div>

        <div className="stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="stat-card" style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s' }}>
            <div style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '16px', borderRadius: '18px' }}><FiBook size={28} /></div>
            <div>
              <h4 style={{ margin: 0, fontSize: '30px', fontWeight: 800, color: '#111827' }}>{[...new Set(subjects.map(s => s.name?.trim()).filter(Boolean))].length}</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Enrolled Subjects</p>
            </div>
          </div>
          <div className="stat-card" style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s' }}>
            <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '16px', borderRadius: '18px' }}><FiCalendar size={28} /></div>
            <div>
              <h4 style={{ margin: 0, fontSize: '30px', fontWeight: 800, color: '#111827' }}>{examSchedule.filter(exam => { const today = new Date(); today.setHours(0,0,0,0); const examD = new Date(exam.examDate); examD.setHours(0,0,0,0); return today < examD; }).length}</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Exams Scheduled by Faculty</p>
            </div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', padding: '30px', borderRadius: '24px', color: 'white', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '18px' }}><FiCheckCircle size={28} /></div>
            <div>
              <h4 style={{ margin: 0, fontSize: '30px', fontWeight: 800 }}>{completedUnits.length}</h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9, fontWeight: 500 }}>Units Completed</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Faculty Updates */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', color: '#111827' }}>
              <FiUsers className="text-primary" /> Faculty Updates
              <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#EEF2FF', color: '#4F46E5', borderRadius: '10px' }}>
                {facultyAnnouncements.filter(a => !isRead(a)).length} New
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {facultyAnnouncements.length > 0 ? facultyAnnouncements.map((ann) => (
                <div key={ann._id} className="announcement-card" style={{ 
                  padding: '20px', 
                  borderRadius: '20px', 
                  border: isRead(ann) ? '1px solid #E5E7EB' : '1px solid #DBEAFE', 
                  backgroundColor: isRead(ann) ? '#FDFDFD' : '#F0F7FF', 
                  position: 'relative',
                  opacity: isRead(ann) ? 0.8 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: isRead(ann) ? '#6B7280' : '#1E40AF', fontSize: '14px', flex: 1 }}>
                      {ann.subject} {isRead(ann) && <span style={{ fontWeight: 400, fontSize: '11px', marginLeft: '8px' }}>(Read)</span>}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!isRead(ann) && (
                        <button 
                          onClick={() => handleMarkAsRead(ann._id)}
                          style={{ 
                            backgroundColor: '#10B981', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            padding: '4px 10px', 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <FiCheckCircle size={14} /> Mark as Read
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteAnnouncement(ann._id)}
                        style={{ 
                          backgroundColor: '#EF4444', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          padding: '4px 6px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Delete Announcement"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{ann.message}</p>
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#9CA3AF' }}>{new Date(ann.createdAt).toLocaleDateString()}</div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF', background: '#F9FAFB', borderRadius: '20px' }}>No faculty updates.</div>
              )}
            </div>
          </div>

          {/* Admin Notices */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', color: '#111827' }}>
              <FiBell className="text-secondary" /> Admin Notices
              <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#FFF7ED', color: '#EA580C', borderRadius: '10px' }}>
                {adminAnnouncements.filter(a => !isRead(a)).length} New
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {adminAnnouncements.length > 0 ? adminAnnouncements.map((ann) => (
                <div key={ann._id} className="announcement-card" style={{ 
                  padding: '20px', 
                  borderRadius: '20px', 
                  border: isRead(ann) ? '1px solid #E5E7EB' : '1px solid #FED7AA', 
                  backgroundColor: isRead(ann) ? '#FDFDFD' : '#FFF7ED', 
                  position: 'relative',
                  opacity: isRead(ann) ? 0.8 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: isRead(ann) ? '#92400E' : '#B45309', fontSize: '14px', flex: 1 }}>
                      {ann.subject} {isRead(ann) && <span style={{ fontWeight: 400, fontSize: '11px', marginLeft: '8px' }}>(Read)</span>}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!isRead(ann) && (
                        <button 
                          onClick={() => handleMarkAsRead(ann._id)}
                          style={{ 
                            backgroundColor: '#F59E0B', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            padding: '4px 10px', 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <FiCheckCircle size={14} /> Mark as Read
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteAnnouncement(ann._id)}
                        style={{ 
                          backgroundColor: '#EF4444', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          padding: '4px 6px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Delete Announcement"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#78350F', lineHeight: '1.5' }}>{ann.message}</p>
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#B45309' }}>{new Date(ann.createdAt).toLocaleDateString()}</div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF', background: '#F9FAFB', borderRadius: '20px' }}>No admin notices.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const fetchSubjectMaterials = async (subjectName) => {
    setSubjectUnits([]);
    setLoadingUnits(true);
    try {
      // Fetch materials for this subject
      const res = await fetch(`http://localhost:8080/materials/subject/${subjectName}`);
      if (res.ok) {
        const data = await res.json();
        setSubjectUnits(data || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingUnits(false);
    }
  };

  const fetchUnitMaterials = async (subject, topic) => {
    console.log('fetchUnitMaterials called with:', { subject, topic });
    setUnitMaterials(null);
    setLoadingMaterials(true);
    try {
      const url = `http://localhost:8080/materials?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}`;
      console.log('Fetching from URL:', url);
      const res = await fetch(url);
      console.log('Response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Received data:', data);
        setUnitMaterials(data.message === "Content coming soon" ? null : data);
        console.log('Set unitMaterials to:', data.message === "Content coming soon" ? null : data);
      } else {
        console.log('Response not ok:', res.statusText);
      }
    } catch (err) {
      console.log('Error fetching unit materials:', err);
    } finally {
      setLoadingMaterials(false);
    }
  };
  const renderMaterialContent = () => {
    if (!selectedUnitDetail) return null;
    const { subject, topic } = selectedUnitDetail;

    return (
      <div className="fade-in">
        <div className="view-header" style={{ marginBottom: '30px' }}>
          <button className="admin-btn-secondary" onClick={() => setSelectedUnitDetail(null)} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiChevronRight style={{ transform: 'rotate(180deg)' }} /> Back to Units
          </button>
          <h2 className="view-title">{topic} Content</h2>
          <p className="view-subtitle">{subject} • Unit Content & Resources</p>
        </div>

        {loadingMaterials ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1px solid #F3F4F6' }}>
            <div style={{ fontSize: '18px', color: '#6B7280', marginBottom: '16px' }}>Loading materials...</div>
            <div style={{ width: '40px', height: '40px', border: '4px solid #F3F4F6', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Video Section */}
              <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#EEF2FF', color: '#4F46E5', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                  <FiPlusCircle size={40} style={{ transform: 'rotate(45deg)' }} /> {/* Mock video icon */}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Video Lecture</h3>
                <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
                  {unitMaterials?.videoLink ? 'Watch the detailed video explanation for ' + topic : 'Video not available for this unit'}
                </p>
                <button 
                  className="admin-btn-primary" 
                  style={{ width: '100%', padding: '14px' }}
                  disabled={!unitMaterials?.videoLink}
                  onClick={() => {
                    console.log('Video button clicked');
                    console.log('unitMaterials:', unitMaterials);
                    console.log('videoLink:', unitMaterials?.videoLink);
                    if (unitMaterials?.videoLink) {
                      console.log('Opening video link in new tab:', unitMaterials.videoLink);
                      window.open(unitMaterials.videoLink, '_blank');
                    } else {
                      console.log('No video link available');
                    }
                    handleMarkCompleted(subject, topic);
                  }}
                >
                  🎥 Play Video
                </button>
              </div>

              {/* PDF Section */}
              <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#FFF7ED', color: '#EA580C', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                  <FiBook size={40} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Study PDF</h3>
                <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
                  {unitMaterials?.pdfLink ? 'Read the unit notes and reference materials' : 'PDF not available for this unit'}
                </p>
                <button 
                  className="admin-btn-secondary" 
                  style={{ width: '100%', padding: '14px' }}
                  disabled={!unitMaterials?.pdfLink}
                  onClick={() => {
                    console.log('PDF button clicked');
                    console.log('unitMaterials:', unitMaterials);
                    console.log('pdfLink:', unitMaterials?.pdfLink);
                    if (unitMaterials?.pdfLink) {
                      console.log('Opening PDF link in new tab:', unitMaterials.pdfLink);
                      window.open(unitMaterials.pdfLink, '_blank');
                    } else {
                      console.log('No PDF link available');
                    }
                    handleMarkCompleted(subject, topic);
                  }}
                >
                  📄 Open PDF
                </button>
              </div>
            </div>

            {!unitMaterials && !loadingMaterials && (
              <div style={{ marginTop: '24px', textAlign: 'center', padding: '20px', background: '#FEF2F2', color: '#EF4444', borderRadius: '12px', border: '1px solid #FEE2E2', fontSize: '14px', fontWeight: 500 }}>
                Note: Specific materials for this unit are being prepared. Click buttons to simulate completion.
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderMaterialsList = () => {
    if (!selectedSubjectDetail) return null;
    const subjectName = selectedSubjectDetail;

    // Get all topics for this subject
    const allTopics = subjectUnits.map(m => m.topic).filter(t => t && !/^Unit\s*\d+(\s*:\s*)?$/i.test(t));
    const uniqueTopics = [...new Set(allTopics)];

    // Calculate completion
    const completedTopics = completedUnits.filter(c => c.subject.toLowerCase() === subjectName.toLowerCase()).map(c => c.topic);
    const completionPercentage = uniqueTopics.length > 0 ? Math.round((completedTopics.length / uniqueTopics.length) * 100) : 0;

    return (
      <div className="fade-in">
        <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <button className="admin-btn-secondary" onClick={() => setSelectedSubjectDetail(null)} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiChevronRight style={{ transform: 'rotate(180deg)' }} /> Back to Subjects
            </button>
            <h2 className="view-title">{subjectName} Units</h2>
            <p className="view-subtitle">Select a unit to access video lectures and PDF notes</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'white', padding: '20px', borderRadius: '18px', border: '1px solid #F3F4F6', minWidth: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>
              <span>Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${completionPercentage}%`, height: '100%', backgroundColor: completionPercentage >= 75 ? '#10B981' : (completionPercentage >= 50 ? '#F59E0B' : '#EF4444'), borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
        </div>

        {loadingUnits ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '18px', color: '#6B7280' }}>Loading units...</div>
          </div>
        ) : uniqueTopics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1px solid #F3F4F6' }}>
            <FiBook size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
            <h3 style={{ color: '#374151' }}>No units available</h3>
            <p style={{ color: '#9CA3AF' }}>Units for this subject are being prepared.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {uniqueTopics.map((topic, index) => {
              const isCompleted = completedTopics.includes(topic);

              return (
                <div 
                  key={topic} 
                  style={{ 
                    background: 'white', 
                    padding: '24px', 
                    borderRadius: '16px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
                    border: '1px solid #F3F4F6',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: isCompleted ? '#F0FDF4' : 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  }}
                  onClick={() => {
                    setSelectedUnitDetail({ subject: subjectName, topic });
                    fetchUnitMaterials(subjectName, topic);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '50%', 
                        backgroundColor: isCompleted ? '#10B981' : '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 700
                      }}>
                        {isCompleted ? <FiCheckCircle /> : index + 1}
                      </div>
                      
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                          Unit {index + 1} - {topic}
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: isCompleted ? '#10B981' : '#6B7280' }}>
                          {isCompleted ? 'Completed' : 'Click to access materials'}
                        </p>
                      </div>
                    </div>

                    <FiChevronRight size={24} style={{ color: '#9CA3AF' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderSubjects = () => {
    if (selectedUnitDetail) return renderMaterialContent();
    if (selectedSubjectDetail) return renderMaterialsList();

    // Show all available subjects from the system, but also include any subjects the student is enrolled in
    const enrolledSubjectNames = [...new Set(subjects.map(s => s.name?.trim()).filter(Boolean))];
    const displaySubjects = [...globalSubjects];

    enrolledSubjectNames.forEach((subjectName) => {
      const normalizedName = subjectName.toLowerCase();
      const alreadyIncluded = displaySubjects.some(sub => sub.subjectName?.trim().toLowerCase() === normalizedName);
      if (!alreadyIncluded) {
        const uniqueUnits = new Set(
          subjects
            .filter(s => s.name?.trim().toLowerCase() === normalizedName)
            .map(s => s.title?.trim().toLowerCase())
            .filter(Boolean)
        );

        displaySubjects.push({
          _id: subjectName,
          subjectName,
          facultyName: "General",
          unitsCount: uniqueUnits.size
        });
      }
    });

    return (
      <div className="fade-in">
        <div className="view-header">
          <h2 className="view-title">My Subjects & Materials</h2>
          <p className="view-subtitle">Select a subject to view your units, marks, and study materials.</p>
        </div>

        {displaySubjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1px solid #F3F4F6' }}>
            <FiBook size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
            <h3 style={{ color: '#374151' }}>No subjects available</h3>
            <p style={{ color: '#9CA3AF' }}>Check back later for newly added subjects.</p>
          </div>
        ) : (
          <div className="subjects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
            {displaySubjects.map((sub) => {
              const subjectName = sub.subjectName;
              const totalUnits = sub.unitsCount || 0;
              const completedCount = completedUnits.filter(c => c.subject.toLowerCase() === subjectName.toLowerCase()).length;
              
              // Calculate correct units count from enrolled subjects
              const enrolledSubjectData = subjects.filter(s => s.name?.trim().toLowerCase() === subjectName.toLowerCase());
              const uniqueUnits = new Set(
                enrolledSubjectData
                  .map(s => s.title?.trim().toLowerCase())
                  .filter(Boolean)
              );
              const correctUnitsCount = 5;
              const correctProgressPercent = correctUnitsCount > 0 ? Math.min(100, Math.round((completedCount / correctUnitsCount) * 100)) : 0;

              return (
                <div 
                  key={sub._id || subjectName} 
                  className="subject-card" 
                  style={{ 
                    background: 'white', 
                    padding: '30px', 
                    borderRadius: '24px', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', 
                    border: '1px solid #F3F4F6', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.borderColor = '#6366F1';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(99, 102, 241, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#F3F4F6';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)';
                  }}
                  onClick={() => {
                    setSelectedSubjectDetail(subjectName);
                    fetchSubjectMaterials(subjectName);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ width: '60px', height: '60px', backgroundColor: '#F5F3FF', color: '#7C3AED', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiBook size={28} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#6366F1', backgroundColor: '#EEF2FF', padding: '4px 12px', borderRadius: '12px' }}>
                        {correctUnitsCount} Units
                      </span>
                    </div>
                  </div>
                  
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 800, color: '#111827' }}>{subjectName}</h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiUsers size={14} /> Faculty: {sub.facultyName || "General"}
                  </p>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                      <span>Progress</span>
                      <span>{correctProgressPercent}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${correctProgressPercent}%`, height: '100%', backgroundColor: correctProgressPercent >= 75 ? '#10B981' : (correctProgressPercent >= 50 ? '#F59E0B' : '#EF4444'), borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6B7280' }}>
                      Click to access video lectures and PDF study materials
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <div style={{
                        padding: '8px 16px',
                        borderRadius: '12px',
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>🎥</span> Videos
                      </div>
                      <div style={{
                        padding: '8px 16px',
                        borderRadius: '12px',
                        background: '#FFF7ED',
                        color: '#EA580C',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>📄</span> PDFs
                      </div>
                    </div>
                  </div>

                  <div style={{ position: 'absolute', right: '20px', bottom: '20px', opacity: 0.1 }}>
                     <FiChevronRight size={40} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderExamSchedule = () => {
    const today = new Date();
    today.setHours(0,0,0,0);

    const filteredSchedule = showExamHistory 
      ? [...examSchedule].sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
      : [...examSchedule]
          .filter(exam => {
            const examD = new Date(exam.examDate);
            examD.setHours(0,0,0,0);
            if (examD >= today) return true; // Upcoming or Ongoing
            const diffTime = today - examD;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 3; // Completed within 3 days
          })
          .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

    return (
      <div className="fade-in">
        <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 className="view-title">{showExamHistory ? "Exam History" : "Upcoming Exams"}</h2>
            <p className="view-subtitle">{showExamHistory ? "All past and current academic assessments" : "Next unit tests and examinations"}</p>
          </div>
          <button 
            onClick={() => setShowExamHistory(!showExamHistory)}
            className="admin-btn-secondary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: 600,
              backgroundColor: showExamHistory ? '#F3F4F6' : 'white',
              border: '1px solid #E5E7EB',
              cursor: 'pointer'
            }}
          >
            <FiClock /> {showExamHistory ? "Back to Current" : "View History"}
          </button>
        </div>
        
        <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid #F3F4F6' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit / Exam Name</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '20px 24px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map((exam) => {
                const examD = new Date(exam.examDate);
                examD.setHours(0,0,0,0);
                
                let statusText = "Completed";
                let statusBg = "#D1FAE5";
                let statusColor = "#065F46";
                
                if (today < examD) {
                  statusText = "Upcoming";
                  statusBg = "#FEF3C7";
                  statusColor = "#92400E";
                } else if (today.getTime() === examD.getTime()) {
                  statusText = "Ongoing";
                  statusBg = "#F3E8FF";
                  statusColor = "#6B21A8";
                }
                
                const isNearest = today < examD && exam._id === [...examSchedule].filter(e => {
                    let ed = new Date(e.examDate); 
                    ed.setHours(0,0,0,0); 
                    return today < ed;
                  }).sort((a,b) => new Date(a.examDate) - new Date(b.examDate))[0]?._id;

                return (
                  <tr key={exam._id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.2s', backgroundColor: isNearest ? '#F8FAFC' : 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isNearest ? '#F8FAFC' : 'transparent'}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366F1' }}></div>
                        <span style={{ fontWeight: 600, color: '#111827' }}>{exam.subject}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', color: '#4B5563', fontSize: '14px' }}>{exam.examName || `Unit ${exam.unit}`}</td>
                    <td style={{ padding: '20px 24px', color: '#111827', fontSize: '14px', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiClock className="text-secondary" /> {new Date(exam.examDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '6px 14px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 700, 
                        backgroundColor: statusBg, 
                        color: statusColor,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        {statusText} {isNearest && "📌"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredSchedule.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ color: '#9CA3AF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <FiCalendar size={40} />
                      <span>{showExamHistory ? "No exam history found" : "No upcoming exams currently scheduled"}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMarks = () => {
    // Unique list of subjects that have marks or are enrolled
    const enrolledSubjects = [...new Set(subjects.map(s => s.name))];
    
    if (selectedMarksSubject) {
      const subjectMarks = subjects
        .filter(s => s.name === selectedMarksSubject && s.marks)
        .sort((a, b) => a.title.localeCompare(b.title));

      const markWithNames = subjectMarks.map((mark) => {
        const unitMatch = (mark.title || '').match(/Unit\s*(\d+)/i);
        const unitNumber = unitMatch ? parseInt(unitMatch[1], 10) : null;
        const topicName = unitNumber && selectedMarksTopics.length >= unitNumber
          ? selectedMarksTopics[unitNumber - 1]
          : null;

        return {
          ...mark,
          displayTitle: unitNumber && topicName
            ? `Unit ${unitNumber} - ${topicName}`
            : mark.title || `Unit ${unitNumber || ''}`
        };
      });

      return (
        <div className="fade-in">
          <div className="view-header" style={{ marginBottom: '30px' }}>
            <button 
              onClick={() => { setSelectedMarksSubject(null); setSelectedMarksTopics([]); }} 
              style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', color: '#4B5563', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <FiChevronRight style={{ transform: 'rotate(180deg)' }} /> Back to Overview
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
                <FiBarChart2 size={24} />
              </div>
              <div>
                <h2 className="view-title" style={{ margin: 0, color: '#374151' }}>{selectedMarksSubject} Performance</h2>
                <p className="view-subtitle" style={{ margin: '4px 0 0 0', color: '#6B7280' }}>Your unit test and exam scores for this subject</p>
              </div>
            </div>
            {loadingMarksTopics && (
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#6366F1', fontSize: '14px', fontWeight: 500 }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid #C7D2FE', borderTop: '2px solid #6366F1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Loading unit details...
              </div>
            )}
          </div>

          {subjectMarks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 40px', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
              <div style={{ width: '64px', height: '64px', background: '#F1F5F9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <span style={{ fontSize: '32px' }}>📄</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>No Marks Published</h3>
              <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>Your faculty hasn't published any marks for this subject yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {markWithNames.map((mark) => {
                 const markStr = String(mark.marks).toUpperCase();
                 const isAbsent = markStr.includes('ABSENT') || markStr.includes('ABS');
                 const displayMark = isAbsent ? 'ABS' : mark.marks;
                 
                  return (
                    <div 
                      key={mark._id} 
                      style={{ 
                        background: 'white', 
                        padding: '0', 
                        borderRadius: '24px', 
                        border: '1px solid #F3F4F6',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ 
                        background: isAbsent 
                          ? 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)' 
                          : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', 
                        padding: '24px', 
                        color: isAbsent ? '#4B5563' : 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: 800, 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em',
                            opacity: 0.8,
                            display: 'block',
                            marginBottom: '4px'
                          }}>
                            {mark.exam}
                          </span>
                          <h4 style={{ 
                            margin: 0, 
                            fontSize: '18px', 
                            fontWeight: 800, 
                            lineHeight: '1.2'
                          }}>
                            {mark.displayTitle}
                          </h4>
                        </div>
                        <div style={{ 
                          width: '64px', 
                          height: '64px', 
                          background: 'rgba(255, 255, 255, 0.2)', 
                          backdropFilter: 'blur(8px)',
                          borderRadius: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                          <span style={{ fontSize: isAbsent ? '14px' : '24px', fontWeight: 900, lineHeight: '1' }}>
                            {displayMark}{!isAbsent && '%'}
                          </span>
                          <span style={{ fontSize: '9px', fontWeight: 700, marginTop: '2px', opacity: 0.9 }}>
                            {isAbsent ? 'ABS' : 'SCORE'}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '4px' }}>Unit Topic</p>
                            <p style={{ margin: 0, fontSize: '14px', color: '#374151', fontWeight: 600 }}>{mark.title}</p>
                          </div>
                          <div style={{ flex: 1, textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '4px' }}>Status</p>
                            <span style={{ 
                              padding: '4px 10px', 
                              borderRadius: '8px', 
                              fontSize: '11px', 
                              fontWeight: 700,
                              background: isAbsent ? '#FEF2F2' : '#F0FDF4',
                              color: isAbsent ? '#EF4444' : '#16A34A',
                              display: 'inline-block'
                            }}>
                              {isAbsent ? 'Absent' : 'Evaluated'}
                            </span>
                          </div>
                        </div>
                        
                        {!isAbsent && (
                          <div style={{ width: '100%', height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${mark.marks}%`, 
                              height: '100%', 
                              background: `linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)`,
                              borderRadius: '4px',
                              transition: 'width 1s ease-out'
                            }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="fade-in">
        <div className="view-header" style={{ marginBottom: '32px' }}>
          <h2 className="view-title" style={{ fontSize: '28px', fontWeight: 800 }}>My Marks Dashboard</h2>
          <p className="view-subtitle" style={{ fontSize: '15px' }}>Track your academic progress, unit test scores, and assessments across all enrolled subjects.</p>
        </div>

        <div className="subjects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
          {enrolledSubjects.length > 0 ? enrolledSubjects.map((subName) => {
            const subjectMarksData = subjects.filter(s => s.name === subName && s.marks);
            const marksCount = subjectMarksData.length;
            
            // Calculate Average Marks for the visual bar
            const totalMarks = subjectMarksData.reduce((acc, m) => {
              const val = parseFloat(m.marks);
              return acc + (isNaN(val) ? 0 : val);
            }, 0);
            const avgMarks = marksCount > 0 ? Math.round(totalMarks / marksCount) : 0;
            
            const latestMarkRaw = marksCount > 0 ? subjectMarksData[marksCount - 1].marks : null;
            let latestDisplayMark = latestMarkRaw;
            if (latestMarkRaw) {
               const markStr = String(latestMarkRaw).toUpperCase();
               if (markStr.includes('ABSENT') || markStr.includes('ABS')) {
                  latestDisplayMark = 'ABS';
               }
            }

            return (
              <div 
                key={subName} 
                className="subject-card" 
                onClick={() => setSelectedMarksSubject(subName)}
                style={{ 
                  background: 'white', 
                  padding: '30px', 
                  borderRadius: '24px', 
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', 
                  border: '1px solid #F3F4F6', 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = '#6366F1';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(99, 102, 241, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#F3F4F6';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#EEF2FF', color: '#6366F1', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiBarChart2 size={28} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#6366F1', backgroundColor: '#EEF2FF', padding: '4px 12px', borderRadius: '12px' }}>
                      {marksCount} Records
                    </span>
                  </div>
                </div>
                
                <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 800, color: '#111827' }}>{subName}</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiClock size={14} /> Latest: {latestDisplayMark || 'N/A'}
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                    <span>Avg Performance</span>
                    <span>{avgMarks}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${avgMarks}%`, height: '100%', backgroundColor: avgMarks >= 80 ? '#10B981' : (avgMarks >= 60 ? '#F59E0B' : '#EF4444'), borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                  </div>
                </div>

                <div style={{ position: 'absolute', right: '30px', bottom: '30px', opacity: 0.15 }}>
                   <FiChevronRight size={48} />
                </div>
              </div>
            );
          }) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', background: 'white', borderRadius: '24px', border: '1px solid #F3F4F6', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
               <div style={{ width: '80px', height: '80px', background: '#F1F5F9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                 <FiBook size={40} style={{ color: '#94A3B8' }} />
               </div>
               <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>No Subjects Available</h3>
               <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>Your enrolled subjects will appear here once faculty assigns them.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFeedback = () => (
    <div className="fade-in">
      <div className="view-header">
        <h2 className="view-title">Student Feedback</h2>
        <p className="view-subtitle">Help us improve your learning experience</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Send a Message</h3>
          <form onSubmit={handleFeedbackSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>What's on your mind?</label>
              <textarea 
                style={{ width: '100%', minHeight: '160px', padding: '16px', borderRadius: '16px', border: '1.5px solid #E5E7EB', outline: 'none', transition: 'border-color 0.2s', fontSize: '15px' }}
                placeholder="Share your thoughts, suggestions, or issues..."
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                required
              />
            </div>
            <button type="submit" className="admin-btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px', fontWeight: 700 }}>Submit Feedback</button>
          </form>
        </div>
        
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Recent History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {viewFeedbackHistory.map((fb) => (
              <div key={fb._id} style={{ padding: '20px', background: 'white', borderRadius: '20px', border: '1px solid #F3F4F6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#1F2937', fontWeight: 500 }}>{fb.suggestions}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{new Date(fb.createdAt).toLocaleDateString()}</span>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: 700,
                    backgroundColor: fb.status === 'Resolved' ? '#D1FAE5' : '#FEF3C7', 
                    color: fb.status === 'Resolved' ? '#065F46' : '#92400E' 
                  }}>
                    {fb.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))}
            {viewFeedbackHistory.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', background: '#F9FAFB', borderRadius: '20px', border: '1.5px dashed #E5E7EB', color: '#9CA3AF' }}>
                No feedback history yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="fade-in">
      <div className="view-header">
        <h2 className="view-title">Account Settings</h2>
        <p className="view-subtitle">Manage your personal information, security, and preferences</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Profile Settings */}
        <div style={{ background: 'white', padding: '28px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiUsers className="text-primary" /> Profile Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Full Name</label>
              <input 
                type="text" 
                className="form-control"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#6B7280' }}
                value={settingsForm.name}
                readOnly
              />
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#9CA3AF' }}>Contact admin to change your legal name.</p>
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Email Address</label>
              <input 
                type="email" 
                className="form-control"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#6B7280' }}
                value={settingsForm.email}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div style={{ background: 'white', padding: '28px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiLock className="text-secondary" /> Security & Password
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="password" 
              className="form-control"
              placeholder="Current Password"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}
              value={settingsForm.currentPassword}
              onChange={(e) => setSettingsForm({...settingsForm, currentPassword: e.target.value})}
            />
            <input 
              type="password" 
              className="form-control"
              placeholder="New Password"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}
              value={settingsForm.newPassword}
              onChange={(e) => setSettingsForm({...settingsForm, newPassword: e.target.value})}
            />
            <button 
              className="admin-btn-primary" 
              style={{ marginTop: '8px', width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 700 }}
              onClick={() => alert("Security features coming soon!")}
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div style={{ background: 'white', padding: '28px', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiBell style={{ color: '#8B5CF6' }} /> Preferences
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '16px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>Push Notifications</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Receive alerts for new exams and marks.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settingsForm.notifications}
                onChange={(e) => setSettingsForm({...settingsForm, notifications: e.target.checked})}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '24px' }}>
            <button 
              className="topbar-logout-btn" 
              style={{ width: '100%', padding: '14px', borderRadius: '12px', justifyContent: 'center', backgroundColor: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2', fontWeight: 700 }}
              onClick={handleLogout}
            >
              <FiLogOut style={{ marginRight: '8px' }} /> Sign Out
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "subjects": return renderSubjects();
      case "exams": return renderExamSchedule();
      case "marks": return renderMarks();
      case "ai": return <AISuggestions userId={localStorage.getItem("userId")} />;
      case "feedback": return renderFeedback();
      case "settings": return renderSettings();
      default: return renderDashboard();
    }
  };



  return (
    <div className="admin-dashboard-container">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">AI</div>
          {!isCollapsed && <span className="brand-text">Student Hub</span>}
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
            <FiHome className="nav-icon" /> {!isCollapsed && "Dashboard"}
          </div>
          <div className={`nav-item ${activeTab === "subjects" ? "active" : ""}`} onClick={() => setActiveTab("subjects")}>
            <FiBook className="nav-icon" /> {!isCollapsed && "Subjects / Materials"}
          </div>
          <div className={`nav-item ${activeTab === "exams" ? "active" : ""}`} onClick={() => setActiveTab("exams")}>
            <FiCalendar className="nav-icon" /> {!isCollapsed && "Exam Schedule"}
          </div>
          <div className={`nav-item ${activeTab === "marks" ? "active" : ""}`} onClick={() => setActiveTab("marks")}>
            <FiBarChart2 className="nav-icon" /> {!isCollapsed && "My Marks"}
          </div>
          <div className={`nav-item ${activeTab === "ai" ? "active" : ""}`} onClick={() => setActiveTab("ai")}>
            <FiPieChart className="nav-icon" /> {!isCollapsed && "AI Suggestions"}
          </div>
          <div className={`nav-item ${activeTab === "feedback" ? "active" : ""}`} onClick={() => setActiveTab("feedback")}>
            <FiMessageCircle className="nav-icon" /> {!isCollapsed && "Feedback"}
          </div>
          <div className={`nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
            <FiSettings className="nav-icon" /> {!isCollapsed && "Settings"}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item logout" onClick={handleLogout}>
            <FiLogOut className="nav-icon" /> {!isCollapsed && "Logout"}
          </div>
        </div>
      </aside>

      <div className="admin-main-layout">
        <header className="admin-topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="icon-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
              <FiMenu />
            </button>
            <h3 className="welcome-text">Student Portal</h3>
          </div>
          <div className="topbar-center">
            <h2 className="platform-title">AI Driven Academic Strategy Platform</h2>
          </div>
          <div className="topbar-right">
            <button className="icon-btn" title="Notifications" style={{ position: 'relative' }}>
              <FiBell />
              {announcements.filter(a => !a.readBy?.includes(localStorage.getItem("userId"))).length > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: '#EF4444', color: 'white', fontSize: '10px', height: '16px', width: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold' }}>
                  {announcements.filter(a => !a.readBy?.includes(localStorage.getItem("userId"))).length}
                </span>
              )}
            </button>
            <div className="user-profile-circle">
              {(localStorage.getItem("name") || "S").charAt(0).toUpperCase()}
            </div>
            <button className="topbar-logout-btn" onClick={handleLogout}>
              <FiLogOut className="logout-icon" /> Logout
            </button>
          </div>
        </header>

        <main className="admin-content-area">
          <div className="content-wrapper">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* MODALS */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Add New Subject</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="form-label">Subject Name</label>
                  <select className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, title: "" })}>
                    <option value="">Select Subject</option>
                    {globalSubjects.map(sub => <option key={sub.subjectName} value={sub.subjectName}>{sub.subjectName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Active Topic</label>
                  <select className="form-control" value={form.title} disabled={!form.name || loadingTopics} onChange={(e) => setForm({ ...form, title: e.target.value })}>
                    <option value="">{loadingTopics ? "Loading..." : "Select Topic"}</option>
                    {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Previous Marks %</label>
                  <input type="number" className="form-control" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Last Exam Date</label>
                  <input type="date" className="form-control" value={form.exam} onChange={(e) => setForm({ ...form, exam: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleAddSubject}>Confirm Enrollment</button>
            </div>
          </div>
        </div>
      )}



      {/* STYLE TOGGLE */}
      <style>{`
           .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
           .switch input { opacity: 0; width: 0; height: 0; }
           .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #D1D5DB; transition: .4s; border-radius: 34px; }
           .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
           input:checked + .slider { background-color: #3B82F6; }
           input:checked + .slider:before { transform: translateX(20px); }
      `}</style>

    </div>
  );
}

export default Student;
