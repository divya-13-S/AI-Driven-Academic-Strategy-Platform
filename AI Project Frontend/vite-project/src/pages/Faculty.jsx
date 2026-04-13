import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiLayers, FiPlusCircle, FiPieChart, FiCalendar, FiTrendingUp, FiTarget, FiMessageCircle, FiSettings, FiLogOut, FiBell, FiMenu, FiTrash2, FiBarChart2, FiUsers, FiLock } from "react-icons/fi";
import StudentAnalysisModal from "../components/StudentAnalysisModal";

function Faculty() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [activeView, setActiveView] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [totalStudentCount, setTotalStudentCount] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [readAnnouncements, setReadAnnouncements] = useState(() => {
    const saved = localStorage.getItem("readAnnouncements");
    return saved ? JSON.parse(saved) : [];
  });
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [materials, setMaterials] = useState([]);
  const [marksUnit, setMarksUnit] = useState([]);
  const [marksExam, setMarksExam] = useState("");
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [marksStudents, setMarksStudents] = useState([]);
  const [allSubjectMarks, setAllSubjectMarks] = useState([]);
  const [studentNamesMap, setStudentNamesMap] = useState({});
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [scheduledExams, setScheduledExams] = useState([]);
  const [allScheduledExams, setAllScheduledExams] = useState([]);
  const [examForm, setExamForm] = useState({ unit: [], examName: "", examDate: "" });
  const [examDateWarning, setExamDateWarning] = useState("");
  const [progressData, setProgressData] = useState([]);
  const [globalSubjects, setGlobalSubjects] = useState([]);
  const [selectedProgressSubject, setSelectedProgressSubject] = useState(localStorage.getItem("subject") || "");
  const [selectedStudentPerf, setSelectedStudentPerf] = useState(null);
  const [selectedAnalysisStudent, setSelectedAnalysisStudent] = useState(null);
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ subject: "", message: "" });
  const [submittedFeedback, setSubmittedFeedback] = useState([]);
  const [settingsForm, setSettingsForm] = useState({
    name: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notificationsEnabled: true
  });

  const [materialForm, setMaterialForm] = useState({
    topic: "",
    content: "",
    videoLink: "",
    pdfLink: ""
  });
  const [newTopicForm, setNewTopicForm] = useState({
    topicName: ""
  });
  const [showParentNotification, setShowParentNotification] = useState(false);
  const [notificationStudentName, setNotificationStudentName] = useState("");
  const subject = localStorage.getItem("subject");
  const userEmail = localStorage.getItem("email") || localStorage.getItem("userId") || "faculty";
  const [notifiedStudents, setNotifiedStudents] = useState(() => {
    const stored = localStorage.getItem(`notifiedStudents_${subject}`);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("readAnnouncements", JSON.stringify(readAnnouncements));
  }, [readAnnouncements]);

  useEffect(() => {
    if (subject) {
      localStorage.setItem(`notifiedStudents_${subject}`, JSON.stringify(notifiedStudents));
    }
  }, [notifiedStudents, subject]);

  const triggerToast = (msg, type = "info") => {
    setToast({ message: msg, type: type });
    setTimeout(() => setToast({ message: "", type: "info" }), 3000);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      if (!subject) return;
      try {
        const res = await fetch(`http://localhost:8080/faculty/students/${subject}`);
        const data = await res.json();
        if (Array.isArray(data)) setStudents(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchStudents();
  }, [subject]);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!subject) return;
      try {
        const res = await fetch(`http://localhost:8080/topics/${subject}`);
        const data = await res.json();
        setAvailableTopics(sortTopics(data.topics || []));
      } catch (err) {
        console.log(err);
      }
    };
    fetchTopics();
    const interval = setInterval(fetchTopics, 10000); 
    return () => clearInterval(interval);
  }, [subject]);

  const fetchMaterials = async () => {
    if (!subject) return;
    try {
      const res = await fetch(`http://localhost:8080/materials/subject/${subject}`);
      if (res.ok) {
        const data = await res.json();
        setMaterials(data || []);
      }
    } catch (err) {
      console.log("Error fetching materials:", err);
    }
  };

  useEffect(() => {
    if (activeView === "upload") {
      fetchMaterials();
    }
  }, [activeView, subject]);

  const fetchScheduledExams = async () => {
    if (!subject) return;
    try {
      const res = await fetch(`http://localhost:8080/exam-schedule/${encodeURIComponent(subject)}`);
      if (res.ok) {
        setScheduledExams(await res.json());
      }
      
      const allRes = await fetch(`http://localhost:8080/exams`);
      if (allRes.ok) {
        setAllScheduledExams(await allRes.json());
      }
    } catch (err) {
      console.log("Error fetching scheduled exams:", err);
    }
  };

  useEffect(() => {
    if (activeView === "exams" || activeView === "marks") {
      fetchScheduledExams();
    }
  }, [activeView, subject]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("http://localhost:8080/announcements?target=faculty");
        if (res.ok) setAnnouncements(await res.json());
      } catch (err) {
        console.log(err);
      }
    };
    fetchAnnouncements();
  }, []);

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

  const fetchProgressData = async () => {
    if (!selectedProgressSubject) return;
    try {
      const res = await fetch(`http://localhost:8080/faculty/student-progress/${selectedProgressSubject}`);
      if (res.ok) {
        setProgressData(await res.json());
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchGlobalSubjects();
  }, []);

  useEffect(() => {
    if (activeView === "progress") {
      fetchProgressData();
    }
  }, [activeView, selectedProgressSubject]);

  useEffect(() => {
    const fetchTotalStudents = async () => {
      try {
        const res = await fetch("http://localhost:8080/students/count");
        const data = await res.json();
        if (data && typeof data.count === 'number') setTotalStudentCount(data.count);
      } catch (err) {
        console.log(err);
      }
    };
    fetchTotalStudents();
    const interval = setInterval(fetchTotalStudents, 10000); 
    return () => clearInterval(interval);
  }, []);

  const handleOpenAnnouncement = (ann) => {
    setSelectedAnnouncement(ann);
    if (!readAnnouncements.includes(ann._id)) {
      setReadAnnouncements(prev => [...prev, ann._id]);
    }
  };

  const handleMarkAsRead = (id) => {
    if (!readAnnouncements.includes(id)) {
      setReadAnnouncements(prev => [...prev, id]);
    }
    setSelectedAnnouncement(null);
  };

  const unreadCount = announcements.filter(ann => !readAnnouncements.includes(ann._id)).length;

  const sortTopics = (topics) => {
    return [...topics].sort((a, b) => {
      const aMatch = a.match(/^Unit\s*(\d+)/i);
      const bMatch = b.match(/^Unit\s*(\d+)/i);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      return a.localeCompare(b);
    });
  };

  const handleAddTopic = async () => {
    if (!subject) return;
    const topicName = newTopicForm.topicName.trim();
    if (!topicName) {
      alert("Please enter a topic name");
      return;
    }

    if (availableTopics.length >= 5) {
      alert("Only 5 units are allowed per subject");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topicName,
          createdBy: userEmail
        })
      });
      if (response.ok) {
        triggerToast("Unit added successfully!");
        setNewTopicForm({ topicName: "" });
        setShowAddTopicModal(false);
        const topicsRes = await fetch(`http://localhost:8080/topics/${subject}`);
        const topicsData = await topicsRes.json();
        setAvailableTopics(sortTopics(topicsData.topics || []));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteUnit = async (unitName) => {
    try {
      const res = await fetch(`http://localhost:8080/admin/units/delete-unit`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectName: subject, unitName })
      });
      if (res.ok) {
        setAvailableTopics(availableTopics.filter(t => t !== unitName));
        triggerToast("Unit deleted successfully!");
      }
    } catch (err) {
      console.log(err);
      triggerToast("Error deleting unit");
    }
  };

  const openAddUnitModal = () => {
    setNewTopicForm({ topicName: "" });
    setShowAddTopicModal(true);
  };

  const handleAddMaterial = async () => {
    if (!materialForm.topic || !materialForm.content) return;
    try {
      const response = await fetch("http://localhost:8080/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic: materialForm.topic,
          content: materialForm.content,
          videoLink: materialForm.videoLink || null,
          pdfLink: materialForm.pdfLink || null
        })
      });
      if (response.ok) {
        triggerToast("Material added successfully!");
        setMaterialForm({ topic: "", content: "", videoLink: "", pdfLink: "" });
        fetchMaterials();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      const res = await fetch(`http://localhost:8080/materials/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerToast("Material deleted");
        fetchMaterials();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleExamDateChange = (dateStr) => {
    setExamForm({ ...examForm, examDate: dateStr });
    const conflict = allScheduledExams.find(ex => new Date(ex.examDate).toISOString().split('T')[0] === dateStr);
    if (conflict) {
      setExamDateWarning(`This date is already booked for another exam (${conflict.subject} - ${conflict.examName}).`);
    } else {
      setExamDateWarning("");
    }
  };

  const handleScheduleExam = async () => {
    if (examDateWarning) {
      triggerToast("Cannot schedule on an already booked date", "error");
      return;
    }
    if (examForm.unit.length === 0 || !examForm.examName || !examForm.examDate) {
      triggerToast("Please fill all exam details", "error");
      return;
    }
    
    try {
      const res = await fetch("http://localhost:8080/exam-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          unit: examForm.unit.join(', '),
          examName: examForm.examName,
          examDate: examForm.examDate
        })
      });
      if (res.ok) {
        triggerToast("Exam scheduled successfully!", "success");
        setExamForm({ unit: [], examName: "", examDate: "" });
        setExamDateWarning("");
        fetchScheduledExams();
      } else {
        triggerToast("Failed to schedule exam", "error");
      }
    } catch (err) {
      console.log(err);
      triggerToast("Error scheduling exam", "error");
    }
  };

  const handleDeleteExam = async (id) => {
    if(!window.confirm("Are you sure you want to delete this scheduled exam?")) return;
    try {
      const res = await fetch(`http://localhost:8080/exam-schedule/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerToast("Exam deleted successfully", "success");
        fetchScheduledExams();
      }
    } catch (err) {
      console.log(err);
      triggerToast("Error deleting exam", "error");
    }
  };

  const fetchAllMarksForSubject = async () => {
    if (!subject) return;
    try {
      const res = await fetch(`http://localhost:8080/faculty/students/${encodeURIComponent(subject)}`);
      const data = res.ok ? await res.json() : [];
      setAllSubjectMarks(data);

      const sRes = await fetch("http://localhost:8080/students/all");
      if (sRes.ok) {
        const sData = await sRes.json();
        const map = {};
        sData.forEach(s => map[s._id] = s.name);
        setStudentNamesMap(map);
      }
    } catch (err) {
      console.error("Fetch all marks error:", err);
    }
  };

  useEffect(() => {
    if (activeView === 'marks' || activeView === 'progress') {
      fetchAllMarksForSubject();
    }
  }, [activeView, subject]);

  const loadStudentsForMarks = async () => {
    if (!subject) {
      triggerToast("Subject not found. Please log in again.", "error");
      return;
    }
    if (!marksExam) {
      triggerToast("Please select an exam", "info");
      return;
    }
    if (marksUnit.length === 0) {
      triggerToast("No units associated with this exam", "info");
      return;
    }
    const unitString = [...marksUnit].sort().join(", ");
    setLoadingMarks(true);
    try {
      const studentsRes = await fetch("http://localhost:8080/students/all");
      const studentsData = await studentsRes.json();
      const marksRes = await fetch(`http://localhost:8080/faculty/students/${encodeURIComponent(subject)}`);
      const existingMarks = await marksRes.json();

      const studentsWithMarks = studentsData.map(student => {
        const found = existingMarks.find(m =>
          (m.userId === student._id || m.studentId === student._id) &&
          m.title === unitString
        );
        return {
          studentId: student._id,
          name: student.name,
          marks: found ? found.marks : "",
          attendance: found ? (found.marks === "Absent" ? "Absent" : "Present") : null
        };
      });

      setMarksStudents(studentsWithMarks.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error("Load Students Error:", err);
    } finally {
      setLoadingMarks(false);
    }
  };

  const handleMarkChange = (studentId, value) => {
    setMarksStudents(prev => prev.map(s =>
      s.studentId === studentId ? { ...s, marks: value } : s
    ));
  };

  const handleAttendanceChange = (studentId, status) => {
    setMarksStudents(prev => prev.map(s =>
      s.studentId === studentId ? { ...s, attendance: status, marks: status === "Present" ? s.marks : "" } : s
    ));
  };

  const saveAllMarks = async () => {
    if (marksUnit.length === 0 || marksStudents.length === 0) {
      triggerToast("No marks to save");
      return;
    }
    const unitString = [...marksUnit].sort().join(", ");
    for (const s of marksStudents) {
      if (s.attendance === null) {
        triggerToast(`Please mark attendance for ${s.name}`, "error");
        return;
      }
      if (s.attendance === "Present" && s.marks !== "" && (isNaN(s.marks) || s.marks < 0 || s.marks > 100)) {
        triggerToast(`Invalid marks for ${s.name}. Please enter 0-100.`);
        return;
      }
    }
    try {
      const res = await fetch("http://localhost:8080/students/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject,
          unit: unitString,
          exam: marksExam,
          marksData: marksStudents.map(s => ({
            studentId: s.studentId,
            marks: s.attendance === "Present" ? (s.marks === "" ? "0" : s.marks.toString()) : "Absent"
          }))
        })
      });
      if (!res.ok) throw new Error("Save failed");
      triggerToast("Marks saved successfully", "success");
      setMarksStudents([]);
      setMarksUnit([]);
      setMarksExam("");
      fetchAllMarksForSubject();
    } catch (err) {
      triggerToast(`Save error: ${err.message}`, "error");
    }
  };

  const handleLogout = () => {
    const keysToPreserve = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("readAnnouncements") || key.startsWith("notifiedStudents") || key.startsWith("adminReadNotifications"))) {
        keysToPreserve.push({ key, value: localStorage.getItem(key) });
      }
    }
    localStorage.clear();
    keysToPreserve.forEach(item => localStorage.setItem(item.key, item.value));
    navigate("/");
  };

  const groupedProgressData = useMemo(() => {
    if (!allSubjectMarks || allSubjectMarks.length === 0) return [];
    const studentMap = {};
    allSubjectMarks.forEach(m => {
      const studentId = m.userId;
      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          studentId: studentId,
          studentName: m.studentName || studentNamesMap[m.userId] || "Unknown Student",
          marksHistory: [],
          totalSecured: 0,
          totalMax: 0,
          absentCount: 0
        };
      }
      studentMap[studentId].marksHistory.push(m);
      if (m.marks === 'Absent') {
        studentMap[studentId].absentCount += 1;
        studentMap[studentId].totalMax += 100;
      } else {
        const val = parseFloat(m.marks);
        if (!isNaN(val)) {
          studentMap[studentId].totalSecured += val;
          studentMap[studentId].totalMax += 100;
        }
      }
    });
    return Object.values(studentMap).map(s => ({
      ...s,
      overallPercentage: s.totalMax > 0 ? ((s.totalSecured / s.totalMax) * 100).toFixed(1) : "0.0"
    }));
  }, [allSubjectMarks, studentNamesMap]);

  const renderDashboard = () => (
    <div className="view-content fade-in">
      <div className="view-header">
        <h2 className="view-title">Dashboard Overview</h2>
        <p className="view-subtitle">Quick summary of academic activity for {subject}</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: '#DBEAFE', color: '#1E3A8A' }}>
            <FiPieChart />
          </div>
          <div>
            <p className="stat-value">{totalStudentCount}</p>
            <p className="stat-label">Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
            <FiLayers />
          </div>
          <div>
            <p className="stat-value">{availableTopics.length}</p>
            <p className="stat-label">Subject Units</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: '#F3E8FF', color: '#6B21A8' }}>
            <FiBell />
          </div>
          <div>
            <p className="stat-value">{unreadCount}</p>
            <p className="stat-label">New Announcements</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '28px', marginTop: '32px' }}>
        <div className="faculty-card" style={{ marginTop: 0 }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><FiBell style={{ color: '#F59E0B' }} /> Recent Announcements</h3>
          <div className="recent-activity-list">
            {announcements.length > 0 ? announcements.slice(0, 5).map(ann => (
              <div 
                key={ann._id} 
                className="activity-item" 
                style={{ opacity: readAnnouncements.includes(ann._id) ? 0.6 : 1, cursor: 'pointer' }}
                onClick={() => handleOpenAnnouncement(ann)}
              >
                <div className="activity-icon feedback"><FiMessageCircle /></div>
                <div className="activity-details">
                  <p className="activity-text">
                    <strong>{ann.subject}</strong>: {ann.message.substring(0, 60)}{ann.message.length > 60 ? '...' : ''}
                    {!readAnnouncements.includes(ann._id) && (
                      <span style={{ marginLeft: '10px', fontSize: '10px', backgroundColor: '#3B82F6', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>NEW</span>
                    )}
                  </p>
                  <p className="activity-time">{new Date(ann.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )) : <p className="activity-text">No announcements found.</p>}
          </div>
        </div>

        <div className="faculty-card" style={{ marginTop: 0 }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><FiLayers style={{ color: '#3B82F6' }} /> Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <button className="admin-btn-primary" onClick={() => setActiveView("upload")}>➕ Upload New Resource</button>
            <button className="admin-btn-secondary" onClick={() => setActiveView("units")}>📚 Manage Units</button>
            <button className="admin-btn-secondary" onClick={() => setActiveView("progress")}>📊 View Student Progress</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUnits = () => (
    <div className="view-content fade-in">
      <div className="admin-header">
        <div>
          <h2>Subject Units</h2>
          <p className="admin-header-desc">Manage curriculum units for {subject}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="stat-card" style={{ padding: '8px 20px', minWidth: 'auto', marginBottom: 0 }}>
            <p className="stat-value" style={{ fontSize: '20px' }}>{availableTopics.length}</p>
            <p className="stat-label" style={{ fontSize: '12px' }}>Total Units</p>
          </div>
          <button className="admin-btn-primary" onClick={openAddUnitModal}>Add New Unit</button>
        </div>
      </div>

      <div className="search-filter-box">
        <h3 className="card-title" style={{ marginBottom: '20px' }}>Available Units</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {availableTopics.map(topic => (
            <div 
              key={topic} 
              style={{ padding: '24px 20px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px', position: 'relative' }}
            >
              <button 
                onClick={() => handleDeleteUnit(topic)} 
                style={{ position: 'absolute', top: '10px', right: '10px', border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: '16px' }}
                title="Delete Unit"
              >
                <FiTrash2 />
              </button>
              <span style={{ fontWeight: '700', color: '#111827', textAlign: 'center', fontSize: '16px' }}>{topic}</span>
            </div>
          ))}
          {availableTopics.length === 0 && (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#6B7280' }}>No units added yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="view-content fade-in">
      <div className="view-header">
        <h2 className="view-title">Upload Resources</h2>
        <p className="view-subtitle">Share materials and study notes with your students</p>
      </div>

      <div className="search-filter-box" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="form-label">Select Unit <span style={{ color: '#EF4444' }}>*</span></label>
            <select 
              className="form-select" 
              value={materialForm.topic} 
              onChange={e => setMaterialForm({ ...materialForm, topic: e.target.value })}
            >
              <option value="">-- Choose a Unit --</option>
              {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Study Content / Key Notes <span style={{ color: '#EF4444' }}>*</span></label>
            <textarea 
              className="form-control" 
              style={{ height: '150px' }} 
              value={materialForm.content} 
              onChange={e => setMaterialForm({ ...materialForm, content: e.target.value })} 
              placeholder="Paste important notes or a summary here..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label className="form-label">Video Resource Link</label>
              <input 
                className="form-control" 
                type="text" 
                value={materialForm.videoLink} 
                onChange={e => setMaterialForm({ ...materialForm, videoLink: e.target.value })} 
                placeholder="https://youtube.com/..." 
              />
            </div>
            <div>
              <label className="form-label">PDF Notes Link</label>
              <input 
                className="form-control" 
                type="text" 
                value={materialForm.pdfLink} 
                onChange={e => setMaterialForm({ ...materialForm, pdfLink: e.target.value })} 
                placeholder="https://drive.google.com/..." 
              />
            </div>
          </div>

          <button className="admin-btn-primary" onClick={handleAddMaterial} style={{ padding: '16px', fontSize: '15px' }}>
            Submit Resource to Student Portal
          </button>
        </div>
      </div>

      <div className="search-filter-box" style={{ maxWidth: '800px', marginTop: '32px' }}>
        <h3 className="card-title" style={{ marginBottom: '20px' }}>Recently Added Resources</h3>
        {materials.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>No resources uploaded yet for this subject.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Array.from(new Set(materials.map(m => m.topic))).map(topicName => (
              <div key={topicName} className="resource-group-card" style={{ border: '1px solid #EAE8E1', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#F9FAFB', padding: '12px 20px', borderBottom: '1px solid #EAE8E1', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                   <span>{topicName}</span>
                </div>
                <div style={{ padding: '16px' }}>
                  {materials.filter(m => m.topic === topicName).map(m => (
                    <div key={m._id} style={{ position: 'relative', background: '#FFFFFF', padding: '16px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #EAE8E1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <button 
                        onClick={() => handleDeleteMaterial(m._id)} 
                        style={{ position: 'absolute', top: '12px', right: '12px', color: '#EF4444', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      >
                        <FiTrash2 />
                      </button>
                      <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px', paddingRight: '30px' }}>
                        {m.content}
                      </p>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        {m.videoLink && (
                          <a href={m.videoLink} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>
                             🎥 Video Resource
                          </a>
                        )}
                        {m.pdfLink && (
                          <a href={m.pdfLink} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#DC2626', fontWeight: 600, textDecoration: 'none' }}>
                             📄 PDF Notes
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderMarks = () => (
    <div className="view-content fade-in">
      <div className="view-header">
        <h2 className="view-title">Students Performance Overview</h2>
        <p className="view-subtitle">Record and track unit-wise marks for {subject}</p>
      </div>

      <div className="search-filter-box" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Active Subject</label>
            <input className="form-control" value={subject} readOnly style={{ backgroundColor: '#F9FAFB' }} />
          </div>
          <div>
            <label className="form-label">Select Exam / Unit</label>
            <select 
              className="form-select" 
              value={marksExam} 
              onChange={e => {
                setMarksExam(e.target.value);
                const ex = scheduledExams.find(x => x.examName === e.target.value);
                if (ex) setMarksUnit(ex.unit.split(',').map(u => u.trim()));
              }}
            >
              <option value="">-- Choose Exam --</option>
              {scheduledExams
                .filter(ex => {
                  const now = new Date();
                  const examTime = new Date(ex.examDate).getTime();
                  // Allow marks entry as soon as the exam date is reached
                  return (now.getTime() >= examTime);
                })
                .map(ex => (
                <option key={ex._id} value={ex.examName}>{ex.examName} ({ex.unit})</option>
              ))}
            </select>
            {scheduledExams.length > 0 && scheduledExams.filter(ex => {
              const now = new Date();
              const examTime = new Date(ex.examDate).getTime();
              return (now.getTime() >= examTime);
            }).length === 0 && (
              <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '6px' }}>Marks can only be added after an exam is completed.</p>
            )}
          </div>
          <button className="admin-btn-primary" onClick={loadStudentsForMarks} disabled={loadingMarks} style={{ padding: '12px' }}>
            {loadingMarks ? "Loading..." : "Load Student List"}
          </button>
        </div>
      </div>

      {marksStudents.length > 0 && (
        <div className="search-filter-box" style={{ padding: 0, overflow: 'hidden', marginBottom: '40px' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #EAE8E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Entry Form: {marksExam}</h4>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Total Students: {marksStudents.length}</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #EAE8E1' }}>
              <tr>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#4B5563' }}>Student Name</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', color: '#4B5563' }}>Attendance</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#4B5563' }}>Marks (0-100)</th>
              </tr>
            </thead>
            <tbody>
              {marksStudents.map(s => (
                <tr key={s.studentId} style={{ borderBottom: '1px solid #EAE8E1' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => handleAttendanceChange(s.studentId, "Present")}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: s.attendance === 'Present' ? '#10B981' : 'white', color: s.attendance === 'Present' ? 'white' : '#374151', cursor: 'pointer', fontWeight: 600 }}
                      >
                        P
                      </button>
                      <button 
                        onClick={() => handleAttendanceChange(s.studentId, "Absent")}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: s.attendance === 'Absent' ? '#EF4444' : 'white', color: s.attendance === 'Absent' ? 'white' : '#374151', cursor: 'pointer', fontWeight: 600 }}
                      >
                        A
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ maxWidth: '120px', textAlign: 'center' }}
                      value={s.marks} 
                      onChange={e => handleMarkChange(s.studentId, e.target.value)} 
                      disabled={s.attendance !== 'Present'}
                      placeholder={s.attendance === 'Absent' ? "ABS" : "Enter"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#F9FAFB' }}>
            <button className="admin-btn-primary" onClick={saveAllMarks} style={{ minWidth: '150px' }}>
              Submit Marks to Portal
            </button>
          </div>
        </div>
      )}

      {allSubjectMarks.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '24px', color: '#111827' }}>Unit-Wise Performance History</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {[...new Set(allSubjectMarks.map(m => m.title))].map(unit => (
              <div key={unit} className="search-filter-box" style={{ borderTop: '4px solid #3B82F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0 }}>{unit}</h4>
                  <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Results</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {allSubjectMarks.filter(m => m.title === unit).map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                      <span style={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}>
                        {m.studentName || studentNamesMap[m.userId] || "Unknown Student"}
                      </span>
                      <span style={{ 
                        fontWeight: 700, 
                        color: m.marks === 'Absent' ? '#EF4444' : (parseInt(m.marks) >= 75 ? '#10B981' : (parseInt(m.marks) >= 50 ? '#3B82F6' : '#F59E0B')),
                        fontSize: '14px'
                      }}>
                        {m.marks === 'Absent' ? 'ABS' : `${m.marks}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderExams = () => (
    <div className="view-content fade-in">
      <div className="view-header">
        <h2 className="view-title">Exam Scheduling</h2>
        <p className="view-subtitle">Plan and notify students about upcoming assessments</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
        <div className="search-filter-box" style={{ height: 'fit-content' }}>
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Schedule New Exam</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="form-label">Target Units (Select Multiple)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                {availableTopics.map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: examForm.unit.includes(t) ? '#EEF2FF' : '#F9FAFB', border: `1px solid ${examForm.unit.includes(t) ? '#6366F1' : '#E5E7EB'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input 
                      type="checkbox" 
                      style={{ cursor: 'pointer' }}
                      checked={examForm.unit.includes(t)} 
                      onChange={e => setExamForm({ ...examForm, unit: e.target.checked ? [...examForm.unit, t] : examForm.unit.filter(u => u !== t) })} 
                    />
                    {t}
                  </label>
                ))}
                {availableTopics.length === 0 && <span style={{ color: '#9CA3AF', fontSize: '13px' }}>No units available to schedule.</span>}
              </div>
            </div>

            <div>
              <label className="form-label">Exam Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={examForm.examName} 
                onChange={e => setExamForm({ ...examForm, examName: e.target.value })} 
                placeholder="e.g., Monthly Test, Mid-Term"
              />
            </div>

            <div>
              <label className="form-label">Scheduled Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={examForm.examDate} 
                onChange={e => handleExamDateChange(e.target.value)} 
              />
              <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Note: Each exam must be scheduled on a unique date across all subjects to prevent student overlap.</p>
              {examDateWarning && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '6px' }}>⚠️ {examDateWarning}</p>}
            </div>

            <button className="admin-btn-primary" onClick={handleScheduleExam} style={{ padding: '14px', marginTop: '10px' }}>
              Broadcast Schedule
            </button>
          </div>
        </div>

        <div className="search-filter-box" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #EAE8E1' }}>
            <h3 className="card-title">Existing Schedules</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#F9FAFB' }}>
              <tr>
                <th style={{ padding: '16px 20px', textAlign: 'left', color: '#4B5563' }}>Exam</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', color: '#4B5563' }}>Units Covered</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', color: '#4B5563' }}>Date</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', color: '#4B5563' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {scheduledExams.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>No exams scheduled.</td>
                </tr>
              ) : (
                scheduledExams.map(ex => (
                  <tr key={ex._id} style={{ borderBottom: '1px solid #EAE8E1' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{ex.examName}</td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#6B7280' }}>{ex.unit}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', background: '#F3F4F6', borderRadius: '6px', fontSize: '13px' }}>
                        {new Date(ex.examDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteExam(ex._id)} 
                        style={{ color: '#EF4444', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px' }}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStudentProgress = () => (
    <div className="view-content fade-in">
      <div className="view-header">
        <h2 className="view-title">Student Academic Progress</h2>
        <p className="view-subtitle">Monitor detailed performance history for {subject}</p>
      </div>

      <div className="search-filter-box" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>Active Subject: {subject}</h4>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>Total Students Evaluated: {groupedProgressData.length}</div>
        </div>
      </div>

      {groupedProgressData.length === 0 ? (
        <div className="search-filter-box" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
          No marks data recorded yet for {subject}.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {groupedProgressData.map((student, idx) => (
            <div 
              key={idx} 
              className="faculty-card" 
              style={{ cursor: 'pointer', transition: 'transform 0.2s', marginTop: 0 }}
              onClick={() => {
                setSelectedStudentPerf(student);
                setShowPerfModal(true);
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="user-profile-circle" style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                    {student.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>{student.studentName}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>{student.marksHistory.length} Exams Recorded</p>
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #EAE8E1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#4B5563', fontWeight: 500 }}>Overall Score</span>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: 700,
                    color: parseFloat(student.overallPercentage) >= 75 ? '#10B981' : (parseFloat(student.overallPercentage) >= 50 ? '#3B82F6' : '#EF4444')
                  }}>
                    {student.overallPercentage}%
                  </span>
                </div>
                <div className="progress-bar-small" style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${Math.min(100, parseFloat(student.overallPercentage))}%`,
                      backgroundColor: parseFloat(student.overallPercentage) >= 75 ? '#10B981' : (parseFloat(student.overallPercentage) >= 50 ? '#3B82F6' : '#EF4444')
                    }} 
                  />
                </div>
                {student.absentCount > 0 && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#EF4444', fontWeight: 600 }}>
                    ⚠️ Absent for {student.absentCount} exam(s)
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPlaceholder = (title) => (
    <div className="view-content fade-in">
      <div className="view-header">
        <h2 className="view-title">{title}</h2>
      </div>
      <div className="faculty-card" style={{ textAlign: 'center', padding: '100px 20px', color: '#9CA3AF' }}>
         <FiSettings style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }} />
         <p style={{ fontSize: '18px', fontWeight: 500 }}>The {title} module is currently under engineering.</p>
         <p>Check back soon for advanced {title.toLowerCase()} analytics.</p>
      </div>
    </div>
  );

  const renderStudentPerformanceModal = () => {
    if (!showPerfModal || !selectedStudentPerf) return null;
    const student = selectedStudentPerf;

    return (
      <div className="admin-modal-overlay" onClick={() => setShowPerfModal(false)}>
        <div className="admin-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
          <div className="admin-modal-header">
            <div>
              <h3 style={{ margin: 0 }}>{student.studentName}'s Performance</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280', fontWeight: 'normal' }}>
                Detailed academic record for {subject}
              </p>
            </div>
            <button className="admin-modal-close" onClick={() => setShowPerfModal(false)}>×</button>
          </div>
          
          <div className="admin-modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #EAE8E1', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Overall Score</p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '28px', 
                  fontWeight: 800,
                  color: parseFloat(student.overallPercentage) >= 75 ? '#10B981' : (parseFloat(student.overallPercentage) >= 50 ? '#3B82F6' : '#EF4444')
                }}>
                  {student.overallPercentage}%
                </p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #EAE8E1', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600 }}>Exams Attended</p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#111827' }}>
                  {student.marksHistory.length - student.absentCount} <span style={{ fontSize: '16px', color: '#9CA3AF' }}>/ {student.marksHistory.length}</span>
                </p>
              </div>
            </div>

            <h4 style={{ margin: '0 0 16px 0', color: '#374151' }}>Unit-Wise Test Breakdown</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
              {student.marksHistory.map((m, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#111827' }}>{m.exam || "Not Specified"}</h5>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>{m.title || "N/A"}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 700,
                      backgroundColor: m.marks === 'Absent' ? '#FEE2E2' : (parseInt(m.marks) >= 75 ? '#D1FAE5' : (parseInt(m.marks) >= 50 ? '#DBEAFE' : '#FEF3C7')),
                      color: m.marks === 'Absent' ? '#991B1B' : (parseInt(m.marks) >= 75 ? '#065F46' : (parseInt(m.marks) >= 50 ? '#1E40AF' : '#92400E'))
                    }}>
                      {m.marks === 'Absent' ? 'Absent' : `${parseFloat(m.marks).toFixed(1)} / 100`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="admin-modal-footer">
            <button className="admin-btn-secondary" onClick={() => setShowPerfModal(false)}>Close Summary</button>
          </div>
        </div>
      </div>
    );
  };

  const handleSendToParents = (studentName) => {
    triggerToast(`Notification sent to parents of ${studentName}`, "success");
    setNotifiedStudents(prev => {
      if (!prev.includes(studentName)) return [...prev, studentName];
      return prev;
    });
  };

  const getAISuggestion = (marks) => {
    if (marks === "Absent") return { text: "Critical: Absent", isPoor: true };
    const m = parseFloat(marks);
    if (isNaN(m)) return { text: "Unknown", isPoor: false };
    if (m < 50) return { text: "Poor performance", isPoor: true };
    if (m < 75) return { text: "Average progress", isPoor: false };
    return { text: "Good progress", isPoor: false };
  };

  const renderAISuggestions = () => {
    return (
      <div className="view-content fade-in">
        <div className="view-header">
          <h2 className="view-title">AI Performance Analysis</h2>
          <p className="view-subtitle">Automated overall insights and recommendations for {subject}</p>
        </div>

        <div className="search-filter-box" style={{ padding: 0, overflow: 'hidden', marginTop: '20px' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #EAE8E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Subject Analysis: {subject}</h4>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>Total Students: {groupedProgressData.length}</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #EAE8E1' }}>
              <tr>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#4B5563' }}>Student Name</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#4B5563' }}>Overall Score</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#4B5563' }}>Upcoming Exam</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#4B5563' }}>Materials Completion</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#4B5563' }}>AI Suggestion</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#4B5563' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {groupedProgressData.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                    No analysis data available yet.
                  </td>
                </tr>
              ) : (
                groupedProgressData.map((student, idx) => {
                  const studentName = student.studentName;
                  const suggestion = getAISuggestion(student.overallPercentage);
                  
                  // Calculate upcoming exam based on scheduledExams
                  const nextExam = scheduledExams
                    .filter(ex => new Date(ex.examDate) >= new Date())
                    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))[0];
                  
                  const upcomingExamDate = nextExam ? new Date(nextExam.examDate).toLocaleDateString() : "None Scheduled";
                  const materialsCompletion = "In Progress"; // Placeholder property
                  
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #EAE8E1', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#F9FAFB' } }}>
                      <td style={{ padding: '16px 24px', fontWeight: 600, color: '#111827' }}>{studentName}</td>
                      <td style={{ padding: '16px 24px', color: '#4B5563', fontWeight: 600 }}>{student.overallPercentage}%</td>
                      <td style={{ padding: '16px 24px', color: '#4B5563', fontSize: '13px' }}>{upcomingExamDate}</td>
                      <td style={{ padding: '16px 24px', color: '#4B5563', fontSize: '13px' }}>{materialsCompletion}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          display: 'inline-block', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                          backgroundColor: suggestion.isPoor ? '#FEE2E2' : (suggestion.text === 'Average progress' ? '#FEF3C7' : '#D1FAE5'),
                          color: suggestion.isPoor ? '#991B1B' : (suggestion.text === 'Average progress' ? '#92400E' : '#065F46')
                        }}>
                          {suggestion.text}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {suggestion.isPoor ? (
                            <button 
                              className="admin-btn-primary" 
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '12px', 
                                backgroundColor: notifiedStudents.includes(studentName) ? '#9CA3AF' : '#EF4444', 
                                border: 'none',
                                cursor: notifiedStudents.includes(studentName) ? 'not-allowed' : 'pointer'
                              }}
                              disabled={notifiedStudents.includes(studentName)}
                              onClick={() => handleSendToParents(studentName)}
                            >
                              {notifiedStudents.includes(studentName) ? 'Notification Sent' : 'Send to Parents'}
                            </button>
                          ) : (
                            <span style={{ padding: '6px 12px', color: '#9CA3AF', fontSize: '14px', width: '120px', textAlign: 'center' }}>-</span>
                          )}
                          <button 
                            className="admin-btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => setSelectedAnalysisStudent({ 
                              marks: student.overallPercentage, 
                              title: "All Units", 
                              exam: upcomingExamDate, 
                              studentName: studentName 
                            })}
                          >
                            AI Recommendation
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const fetchFeedback = async () => {
    try {
      const res = await fetch("http://localhost:8080/feedback");
      if (res.ok) {
        const data = await res.json();
        const myFeedback = data.filter(f => f.role === 'faculty' && f.faculty === (localStorage.getItem("name") || "Faculty"));
        setSubmittedFeedback(myFeedback);
      }
    } catch (err) {
      console.log("Error fetching feedback:", err);
    }
  };

  useEffect(() => {
    if (activeView === "feedback") {
      fetchFeedback();
    }
  }, [activeView]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.message) {
      triggerToast("Feedback message is required", "error");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "faculty",
          faculty: localStorage.getItem("name") || "Faculty",
          subject: feedbackForm.subject || "General Inquiry",
          message: feedbackForm.message,
          teachingRating: 5,
          overallRating: 5,
        })
      });
      if (res.ok) {
        triggerToast("Feedback sent to admin", "success");
        setFeedbackForm({ subject: "", message: "" });
        fetchFeedback();
      }
    } catch (err) {
      console.log(err);
      triggerToast("Failed to send feedback", "error");
    }
  };

  const renderFeedback = () => {
    return (
      <div className="view-content fade-in">
        <div className="view-header">
          <h2 className="view-title">Feedback & Support</h2>
          <p className="view-subtitle">Communicate directly with the system administrators</p>
        </div>

        <div className="metrics-grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
          
          {/* Submit Feedback Form */}
          <div className="metric-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Send New Feedback</h3>
            
            <form onSubmit={handleFeedbackSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#4B5563' }}>Subject (Optional)</label>
                <input 
                  type="text" 
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                  placeholder="E.g., System Bug, Missing Feature"
                  value={feedbackForm.subject}
                  onChange={(e) => setFeedbackForm({...feedbackForm, subject: e.target.value})}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#4B5563' }}>Message *</label>
                <textarea 
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', minHeight: '120px', resize: 'vertical' }}
                  placeholder="Describe your feedback, request, or issue here..."
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                  required
                ></textarea>
              </div>

              <button type="submit" className="admin-btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                <FiMessageCircle style={{ marginRight: '8px' }} /> Submit Feedback
              </button>
            </form>
          </div>

          {/* Feedback History */}
          <div className="metric-card" style={{ padding: '24px', backgroundColor: '#F9FAFB' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Previous Submissions</h3>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {submittedFeedback.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed #D1D5DB' }}>
                  <FiMessageCircle style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>You haven't submitted any feedback yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {submittedFeedback.map(fb => (
                    <div key={fb._id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #EAE8E1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>{fb.subject}</span>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '2px 8px', 
                          borderRadius: '10px', 
                          backgroundColor: fb.status === 'Resolved' ? '#D1FAE5' : '#FEF3C7',
                          color: fb.status === 'Resolved' ? '#065F46' : '#92400E',
                          fontWeight: 500
                        }}>
                          {fb.status || "Pending"}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#4B5563', margin: '0 0 10px 0', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {fb.message}
                      </p>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'right' }}>
                        {new Date(fb.createdAt).toLocaleDateString()} at {new Date(fb.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="view-content fade-in">
        <div className="view-header">
          <h2 className="view-title">Settings</h2>
          <p className="view-subtitle">Manage your account preferences and security</p>
        </div>

        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          
          {/* Profile Settings */}
          <div className="metric-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUsers style={{ color: '#3B82F6' }} /> Profile Settings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>Full Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>Email Address</label>
                <input 
                  type="email" 
                  className="form-control"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                />
              </div>
              <button 
                className="admin-btn-primary" 
                style={{ marginTop: '8px', width: 'fit-content' }}
                onClick={() => triggerToast("Profile updated successfully!", "success")}
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="metric-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiLock style={{ color: '#F59E0B' }} /> Security
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="password" 
                className="form-control"
                placeholder="Current Password"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                value={settingsForm.currentPassword}
                onChange={(e) => setSettingsForm({...settingsForm, currentPassword: e.target.value})}
              />
              <input 
                type="password" 
                className="form-control"
                placeholder="New Password"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                value={settingsForm.newPassword}
                onChange={(e) => setSettingsForm({...settingsForm, newPassword: e.target.value})}
              />
              <input 
                type="password" 
                className="form-control"
                placeholder="Confirm New Password"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                value={settingsForm.confirmPassword}
                onChange={(e) => setSettingsForm({...settingsForm, confirmPassword: e.target.value})}
              />
              <button 
                className="admin-btn-primary" 
                style={{ marginTop: '8px', width: 'fit-content', backgroundColor: '#F59E0B', border: 'none' }}
                onClick={() => triggerToast("Password updated successfully!", "success")}
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Notifications & Account */}
          <div className="metric-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBell style={{ color: '#8B5CF6' }} /> Preferences
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#374151' }}>Enable Notifications</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Real-time alerts for student activity.</p>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={settingsForm.notificationsEnabled}
                  onChange={(e) => setSettingsForm({...settingsForm, notificationsEnabled: e.target.checked})}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#EF4444', marginBottom: '16px' }}>Account Actions</h3>
              <button 
                className="topbar-logout-btn" 
                style={{ width: '100%', padding: '12px', justifyContent: 'center', backgroundColor: '#FEF2F2', color: '#EF4444' }}
                onClick={handleLogout}
              >
                <FiLogOut style={{ marginRight: '8px' }} /> Logout from Account
              </button>
            </div>
          </div>

        </div>

        {/* CSS for Toggle Switch */}
        <style>{`
          .switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
          }
          .switch input { 
            opacity: 0;
            width: 0;
            height: 0;
          }
          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #D1D5DB;
            transition: .4s;
          }
          .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
          }
          input:checked + .slider {
            background-color: #3B82F6;
          }
          input:checked + .slider:before {
            transform: translateX(20px);
          }
          .slider.round {
            border-radius: 34px;
          }
          .slider.round:before {
            border-radius: 50%;
          }
        `}</style>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard": return renderDashboard();
      case "units": return renderUnits();
      case "upload": return renderUpload();
      case "marks": return renderMarks();
      case "exams": return renderExams();
      case "progress": return renderStudentProgress();
      case "suggestions": return renderAISuggestions();
      case "feedback": return renderFeedback();
      case "settings": return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="admin-dashboard-container">
      <aside className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">AI</div>
          {!isCollapsed && <span className="brand-text">Faculty Portal</span>}
        </div>
        
        <nav className="sidebar-nav">
          <div className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')} title="Dashboard">
            <FiHome className="nav-icon" /> {!isCollapsed && "Dashboard"}
          </div>
          <div className={`nav-item ${activeView === 'units' ? 'active' : ''}`} onClick={() => setActiveView('units')} title="Syllabus Units">
            <FiLayers className="nav-icon" /> {!isCollapsed && "Syllabus Units"}
          </div>
          <div className={`nav-item ${activeView === 'upload' ? 'active' : ''}`} onClick={() => setActiveView('upload')} title="Study Materials">
            <FiPlusCircle className="nav-icon" /> {!isCollapsed && "Study Materials"}
          </div>
          <div className={`nav-item ${activeView === 'marks' ? 'active' : ''}`} onClick={() => setActiveView('marks')} title="Grading & Marks">
            <FiPieChart className="nav-icon" /> {!isCollapsed && "Grading & Marks"}
          </div>
          <div className={`nav-item ${activeView === 'exams' ? 'active' : ''}`} onClick={() => setActiveView('exams')} title="Exam Planner">
            <FiCalendar className="nav-icon" /> {!isCollapsed && "Exam Planner"}
          </div>
          <div className={`nav-item ${activeView === 'progress' ? 'active' : ''}`} onClick={() => setActiveView('progress')} title="Student Progress">
            <FiBarChart2 className="nav-icon" /> {!isCollapsed && "Student Progress"}
          </div>
          <div className={`nav-item ${activeView === 'suggestions' ? 'active' : ''}`} onClick={() => setActiveView('suggestions')} title="AI Analysis">
            <FiTrendingUp className="nav-icon" /> {!isCollapsed && "AI Analysis"}
          </div>
          <div className={`nav-item ${activeView === 'feedback' ? 'active' : ''}`} onClick={() => setActiveView('feedback')} title="Feedback">
            <FiMessageCircle className="nav-icon" /> {!isCollapsed && "Feedback"}
          </div>
          <div className={`nav-item ${activeView === 'settings' ? 'active' : ''}`} onClick={() => setActiveView('settings')} title="Settings">
            <FiSettings className="nav-icon" /> {!isCollapsed && "Settings"}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item logout" onClick={handleLogout} title="Logout">
            <FiLogOut className="nav-icon" /> {!isCollapsed && "Logout"}
          </div>
        </div>
      </aside>

      <div className="admin-main-layout">
        <header className="admin-topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="icon-btn" onClick={() => setIsCollapsed(!isCollapsed)} title="Toggle Sidebar">
              <FiMenu />
            </button>
            <h3 className="welcome-text">Welcome, {localStorage.getItem("name") || "Faculty"}</h3>
          </div>

          <div className="topbar-center">
            <h2 className="platform-title">AI Driven Academic Strategy Platform</h2>
          </div>

          <div className="topbar-right">
            <button className="icon-btn" title="Notifications" onClick={() => setActiveView("dashboard")} style={{ position: 'relative' }}>
              <FiBell />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: '#EF4444', color: 'white', fontSize: '10px', height: '16px', width: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold' }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="user-profile-circle" title="Faculty Profile">
              {localStorage.getItem("name") ? localStorage.getItem("name").charAt(0).toUpperCase() : "F"}
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

      {selectedAnnouncement && (
        <div className="admin-modal-overlay" onClick={() => setSelectedAnnouncement(null)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{selectedAnnouncement.subject}</h3>
              <button className="admin-modal-close" onClick={() => setSelectedAnnouncement(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <p style={{ lineHeight: '1.6', color: '#374151' }}>{selectedAnnouncement.message}</p>
              <div style={{ marginTop: '20px', fontSize: '12px', color: '#6B7280' }}>
                Broadcast Date: {new Date(selectedAnnouncement.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="admin-modal-footer">
              {!readAnnouncements.includes(selectedAnnouncement._id) && (
                <button className="admin-btn-primary" onClick={() => handleMarkAsRead(selectedAnnouncement._id)}>
                  Mark as Read
                </button>
              )}
              <button className="admin-btn-secondary" onClick={() => setSelectedAnnouncement(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showAddTopicModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddTopicModal(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Add Topic</h3>
              <button className="admin-modal-close" onClick={() => setShowAddTopicModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <label className="form-label">Unit Title / Description</label>
              <input 
                type="text" 
                className="form-control"
                value={newTopicForm.topicName} 
                onChange={e => setNewTopicForm({ topicName: e.target.value })} 
                placeholder="e.g., Organic Chemistry Basics"
                autoFocus
              />
              <p style={{ marginTop: '12px', fontSize: '12px', color: '#6B7280' }}>
                This will create a new tracking module for your students in {subject}.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setShowAddTopicModal(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleAddTopic}>Create Unit</button>
            </div>
          </div>
        </div>
      )}

      {renderStudentPerformanceModal()}

      {selectedAnalysisStudent && (
        <StudentAnalysisModal 
          student={selectedAnalysisStudent} 
          subject={subject} 
          onClose={() => setSelectedAnalysisStudent(null)} 
        />
      )}

      {toast.message && (
        <div className={`toast ${toast.type}`} style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: toast.type === 'success' ? '#10B981' : '#3B82F6', color: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '10px' }}>
          {toast.type === 'success' ? '✅' : 'ℹ️'} {toast.message}
        </div>
      )}
    </div>
  );
}

export default Faculty;
