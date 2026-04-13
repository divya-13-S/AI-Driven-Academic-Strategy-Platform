import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiBook, FiLayers, FiMessageCircle, FiMessageSquare, FiTarget, FiPieChart, FiSettings, FiLogOut, FiLock, FiSun, FiAlertTriangle, FiBell, FiSearch, FiMenu, FiEye, FiSlash, FiTrash2, FiPlusCircle } from "react-icons/fi";

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewUserModal, setViewUserModal] = useState(null);
  const [subjectsOverview, setSubjectsOverview] = useState([]);
  const [unitsOverview, setUnitsOverview] = useState([]);
  const [unitSearchTerm, setUnitSearchTerm] = useState("");
  const [editUnitModal, setEditUnitModal] = useState(null);
  const [materialForm, setMaterialForm] = useState({ content: "", videoLink: "", pdfLink: "" });
  const [adminFeedbacks, setAdminFeedbacks] = useState([]);
  const [viewFeedbackModal, setViewFeedbackModal] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [recentActivity, setRecentActivity] = useState({
    latestUser: null,
    latestSubject: null,
    latestFeedback: null
  });
  const [announcementForm, setAnnouncementForm] = useState({ subject: "", message: "", target: "both" });
  const [adminAnnouncements, setAdminAnnouncements] = useState([]);
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem("adminReadNotifications");
    return saved ? JSON.parse(saved) : [];
  });

  // SETTINGS STATE
  const [settingsForm, setSettingsForm] = useState({
    name: localStorage.getItem("name") || "Admin",
    email: localStorage.getItem("email") || "admin@platform.com",
    currentPassword: "",
    newPassword: "",
    enableNotifications: true,
    enableStudentRegistration: true,
    enableFacultyRegistration: true,
    enableFeedbackSubmission: true,
    enableAnnouncements: true
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSubjectsOverview = async () => {
    try {
      const res = await fetch("http://localhost:8080/admin/subjects-overview");
      if (res.ok) {
        setSubjectsOverview(await res.json());
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUnitsOverview = async () => {
    try {
      const res = await fetch("http://localhost:8080/admin/units-overview");
      if (res.ok) {
        setUnitsOverview(await res.json());
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("http://localhost:8080/feedback");
      if (res.ok) {
        setAdminFeedbacks(await res.json());
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("http://localhost:8080/announcements");
      if (res.ok) {
        setAdminAnnouncements(await res.json());
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSubjectsOverview();
    fetchUnitsOverview();
    fetchFeedbacks();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    localStorage.setItem("adminReadNotifications", JSON.stringify(readNotifications));
  }, [readNotifications]);

  const adminNotifications = adminAnnouncements.filter(ann => ann.target === "admin");
  const sentAnnouncements = adminAnnouncements.filter(ann => ann.target !== "admin");
  const unreadCount = adminNotifications.filter(ann => !readNotifications.includes(ann._id)).length;

  // Update Recent Activity whenever base data changes
  useEffect(() => {
    const sortedUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const sortedSubjects = [...subjectsOverview].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const sortedFeedbacks = [...adminFeedbacks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setRecentActivity({
      latestUser: sortedUsers[0] || null,
      latestSubject: sortedSubjects[0] || null,
      latestFeedback: sortedFeedbacks[0] || null
    });
  }, [users, subjectsOverview, adminFeedbacks]);

  const students = users.filter(user => user.role === "student");
  const faculties = users.filter(user => user.role === "faculty");
  const admins = users.filter(user => user.role === "admin");

  const filteredUsers = users
    .filter(user => {
      // Exclude admins from the User Management dashboard table
      if (user.role === "admin") return false;

      if (filterRole !== "all" && user.role !== filterRole) return false;
      return (
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

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

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = (currentStatus || "Active") === "Active" ? "Deactivated" : "Active";
      const res = await fetch(`http://localhost:8080/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to completely remove this user record? This cannot be undone.")) return;
    try {
      const res = await fetch(`http://localhost:8080/users/${userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleViewUser = (user) => {
    setViewUserModal(user);
  };

  const handleDeleteUnit = async (unitId, unitName, subjectName) => {
    try {
      const res = await fetch(`http://localhost:8080/admin/units/delete-unit`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectName, unitName })
      });
      if (res.ok) {
        setUnitsOverview(unitsOverview.filter(u => !(u.subjectName === subjectName && u.unitName === unitName)));
        triggerToast("Unit deleted successfully!");
      }
    } catch (err) {
      console.log(err);
      triggerToast("Error deleting unit");
    }
  };

  const handleEditUnit = async (unit) => {
    try {
      const res = await fetch(`http://localhost:8080/materials?subject=${encodeURIComponent(unit.subjectName)}&topic=${encodeURIComponent(unit.unitName)}`);
      if (res.ok) {
        const data = await res.json();
        setMaterialForm({
          content: data.content || "",
          videoLink: data.videoLink || "",
          pdfLink: data.pdfLink || ""
        });
      } else {
        setMaterialForm({ content: "", videoLink: "", pdfLink: "" });
      }
    } catch (err) {
      console.log(err);
      setMaterialForm({ content: "", videoLink: "", pdfLink: "" });
    }
    setEditUnitModal(unit);
  };

  const handleSaveMaterial = async () => {
    try {
      const res = await fetch("http://localhost:8080/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: editUnitModal.subjectName,
          topic: editUnitModal.unitName,
          ...materialForm
        })
      });
      if (res.ok) {
        triggerToast("Material saved successfully!");
        setEditUnitModal(null);
        fetchUnitsOverview(); // refresh resource counts
      }
    } catch (err) {
      console.log(err);
      triggerToast("Error saving material");
    }
  };

  const handleResolveFeedback = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/feedback/${id}/resolve`, { method: "PUT" });
      if (res.ok) {
        const { feedback } = await res.json();
        setAdminFeedbacks(adminFeedbacks.map(f => f._id === id ? { ...f, status: feedback.status } : f));
        if (feedback.status === "Resolved") {
          const personName = feedback.studentName || feedback.faculty || "student";
          triggerToast(`Message sent to ${personName}`);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteFeedback = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/feedback/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAdminFeedbacks(adminFeedbacks.filter(f => f._id !== id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcementForm.subject.trim() || !announcementForm.message.trim()) {
      triggerToast("Please fill in both subject and message");
      return;
    }
    setIsSendingAnnouncement(true);
    try {
      const res = await fetch("http://localhost:8080/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...announcementForm, creatorRole: "admin" })
      });
      if (res.ok) {
        triggerToast("Announcement broadcasted successfully!");
        setAnnouncementForm({ subject: "", message: "", target: "both" });
        fetchAnnouncements();
      }
    } catch (err) {
      console.log(err);
      triggerToast("Failed to send announcement");
    } finally {
      setIsSendingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`http://localhost:8080/announcements/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setAdminAnnouncements(adminAnnouncements.filter(ann => ann._id !== id));
        triggerToast("Message deleted successfully");
      }
    } catch (err) {
      console.log(err);
      triggerToast("Failed to delete message");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <div className="admin-header">
              <div>
                <h2>Admin Overview</h2>
                <p className="admin-header-desc">Platform statistics and recent ecosystem activity</p>
              </div>
            </div>

            <div className="stat-cards">
              <div className="stat-card">
                <div className="stat-card-icon" style={{ backgroundColor: '#DBEAFE', color: '#1E3A8A' }}>
                  <FiUsers />
                </div>
                <div>
                  <p className="stat-value">{students.length}</p>
                  <p className="stat-label">Total Students</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                  <FiUsers />
                </div>
                <div>
                  <p className="stat-value">{faculties.length}</p>
                  <p className="stat-label">Total Faculty</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon" style={{ backgroundColor: '#F3E8FF', color: '#6B21A8' }}>
                  <FiBook />
                </div>
                <div>
                  <p className="stat-value">{subjectsOverview.length}</p>
                  <p className="stat-label">Total Subjects</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon" style={{ backgroundColor: '#FFE4E6', color: '#BE123C' }}>
                  <FiLayers />
                </div>
                <div>
                  <p className="stat-value">{unitsOverview.length}</p>
                  <p className="stat-label">Total Units</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '28px', marginTop: '32px' }}>
              {/* Platform Overview */}
              <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiPieChart style={{ color: '#3B82F6' }} /> Platform Overview
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                    <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Total Users</p>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{users.length}</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                    <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Total Feedback</p>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{adminFeedbacks.length}</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                    <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Avg Rating</p>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                      {adminFeedbacks.length > 0 
                        ? (() => {
                            const rated = adminFeedbacks.filter(f => f.overallRating !== undefined);
                            if (rated.length === 0) return "0.0";
                            return (rated.reduce((acc, curr) => acc + (Number(curr.overallRating) || 0), 0) / rated.length).toFixed(1);
                          })() 
                        : "0.0"}/5
                    </p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                    <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>System Status</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#10B981' }}>● Operational</p>
                  </div>
                </div>
              </div>

              {/* User Distribution */}
              <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiUsers style={{ color: '#8B5CF6' }} /> User Distribution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
                     <span style={{ fontWeight: 600 }}>Students: {students.length}</span>
                     <span style={{ fontWeight: 600 }}>Faculty: {faculties.length}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${(students.length / users.length) * 100 || 0}%`, height: '100%', backgroundColor: '#6366F1' }}></div>
                    <div style={{ width: `${(faculties.length / users.length) * 100 || 0}%`, height: '100%', backgroundColor: '#F59E0B' }}></div>
                  </div>
                </div>
              </div>

              {/* Feedback Summary */}
              <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiMessageSquare style={{ color: '#F59E0B' }} /> Feedback Tracking
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #FEF3C7', backgroundColor: '#FFFBEB', borderRadius: '12px' }}>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#92400E' }}>
                      {adminFeedbacks.filter(f => f.status === "Pending" || !f.status).length}
                    </p>
                    <p style={{ fontSize: '13px', color: '#B45309', fontWeight: 600 }}>Pending</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #D1FAE5', backgroundColor: '#ECFDF5', borderRadius: '12px' }}>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: '#065F46' }}>
                      {adminFeedbacks.filter(f => f.status === "Resolved").length}
                    </p>
                    <p style={{ fontSize: '13px', color: '#047857', fontWeight: 600 }}>Resolved</p>
                  </div>
                </div>
              </div>

              {/* System Connectivity */}
              <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiSettings style={{ color: '#6B7280' }} /> System Connectivity
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Database Connection</span>
                    <span style={{ fontWeight: 600, color: '#10B981' }}>Active</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>API Performance</span>
                    <span style={{ fontWeight: 600, color: '#10B981' }}>Optimized</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>AI Engine Status</span>
                    <span style={{ fontWeight: 600, color: '#10B981' }}>Ready</span>
                  </li>
                </ul>
              </div>
            </div>
          </>
        );

      case "users":
        return (
          <>
            <div className="admin-header">
              <div>
                <h2>User Management</h2>
                <p className="admin-header-desc">Search, filter, and manage all platform accounts.</p>
              </div>
            </div>

            <div className="search-filter-box">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="search-select"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="faculty">Faculties</option>
                </select>
                <button
                  className="search-btn"
                  onClick={() => { setSearchTerm(""); setFilterRole("all"); }}
                >
                  Reset
                </button>
              </div>
              <p className="search-info">Showing {filteredUsers.length} of {users.length} users</p>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="empty-message" style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                {users.length === 0 ? "No users registered yet" : "No users match your search"}
              </div>
            ) : (
              <div className="search-filter-box" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '13px', textTransform: 'uppercase' }}>
                    <tr>
                      <th style={{ padding: '16px 24px', fontWeight: 600 }}>Name</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600 }}>Email</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600 }}>Role</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} style={{ borderBottom: '1px solid #EAE8E1', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#F9FAFB' } }}>
                        <td style={{ padding: '16px 24px', fontWeight: 500, color: '#1F2937' }}>{user.name}</td>
                        <td style={{ padding: '16px 24px', color: '#6B7280' }}>{user.email}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, backgroundColor: user.role === 'admin' ? '#FEE2E2' : user.role === 'faculty' ? '#FEF3C7' : '#E0E7FF', color: user.role === 'admin' ? '#991B1B' : user.role === 'faculty' ? '#92400E' : '#3730A3', textTransform: 'capitalize' }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            backgroundColor: (user.status || "Active") === "Active" ? '#D1FAE5' : '#FEE2E2',
                            color: (user.status || "Active") === "Active" ? '#065F46' : '#991B1B',
                            fontWeight: 600
                          }}>
                            {user.status || "Active"}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleViewUser(user)} title="View User" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#3B82F6', fontSize: '18px', padding: 0 }}>
                              <FiEye />
                            </button>
                            <button onClick={() => handleToggleStatus(user._id, user.status)} title="Toggle Account Status" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#F59E0B', fontSize: '18px', padding: 0 }}>
                              <FiSlash />
                            </button>
                            <button onClick={() => handleDeleteUser(user._id)} title="Delete User" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444', fontSize: '18px', padding: 0 }}>
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        );

      case "subjects":
        return (
          <>
            <div className="admin-header">
              <div>
                <h2>Subjects</h2>
                <p className="admin-header-desc">Monitor global curriculum subjects securely.</p>
              </div>
            </div>
            <div className="search-filter-box" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '13px', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Subject Name</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Faculty Name</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Number of Units</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Students Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectsOverview.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#6B7280' }}>
                        No subjects found in the system.
                      </td>
                    </tr>
                  ) : (
                    subjectsOverview.map((sub) => (
                      <tr key={sub.subjectName} style={{ borderBottom: '1px solid #EAE8E1', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#F9FAFB' } }}>
                        <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1F2937' }}>{sub.subjectName}</td>
                        <td style={{ padding: '16px 24px', color: '#6B7280' }}>{sub.facultyName}</td>
                        <td style={{ padding: '16px 24px', color: '#6B7280' }}>5 Units</td>
                        <td style={{ padding: '16px 24px', color: '#6B7280' }}>{sub.studentsEnrolled} Students</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      case "units":
        const filteredUnits = unitsOverview.filter(unit =>
          unit.subjectName?.toLowerCase().includes(unitSearchTerm.toLowerCase()) ||
          unit.unitName?.toLowerCase().includes(unitSearchTerm.toLowerCase())
        );

        return (
          <>
            <div className="admin-header">
              <div>
                <h2>Units</h2>
                <p className="admin-header-desc">Manage modules and units mapped to subjects.</p>
              </div>
            </div>

            <div className="search-filter-box" style={{ padding: '16px', borderBottom: '1px solid #EAE8E1' }}>
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by subject or unit title..."
                  value={unitSearchTerm}
                  onChange={(e) => setUnitSearchTerm(e.target.value)}
                  style={{ width: '100%', maxWidth: '400px' }}
                />
              </div>
            </div>

            <div className="search-filter-box" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '13px', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Subject Name</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Unit Name (Title)</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Video Resource</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>PDF Resource</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#6B7280' }}>
                        {unitsOverview.length === 0 ? "No units found in the system." : "No units matching your search."}
                      </td>
                    </tr>
                  ) : (
                    filteredUnits.map((unit) => (
                      <tr key={unit._id} style={{ borderBottom: '1px solid #EAE8E1', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#F9FAFB' } }}>
                        <td style={{ padding: '16px 24px', color: '#6B7280' }}>{unit.subjectName}</td>
                        <td style={{ padding: '16px 24px', fontWeight: 500, color: '#1F2937' }}>{unit.unitName}</td>
                        <td style={{ padding: '16px 24px' }}>
                          {unit.videoLink ? (
                            <a href={unit.videoLink} target="_blank" rel="noreferrer" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: '500' }}>
                              🎥 View Video
                            </a>
                          ) : (
                            <span style={{ color: '#9CA3AF', fontSize: '13px' }}>Not Available</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {unit.pdfLink ? (
                            <a href={unit.pdfLink} target="_blank" rel="noreferrer" style={{ color: '#EF4444', textDecoration: 'none', fontWeight: '500' }}>
                              📄 View PDF
                            </a>
                          ) : (
                            <span style={{ color: '#9CA3AF', fontSize: '13px' }}>Not Available</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleEditUnit(unit)} title="Edit Materials" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#10B981', fontSize: '18px', padding: 0 }}>
                              <FiSettings />
                            </button>
                            <button onClick={() => handleDeleteUnit(unit._id, unit.unitName, unit.subjectName)} title="Delete Unit" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444', fontSize: '18px', padding: 0 }}>
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      case "student-feedback":
        const studentFeedbacks = adminFeedbacks.filter(f => f.role !== 'faculty');
        return (
          <>
            <div className="admin-header">
              <div>
                <h2>Student Feedback</h2>
                <p className="admin-header-desc">Review operational and course feedback submitted by students.</p>
              </div>
            </div>
            <div className="search-filter-box" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '13px', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Message</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentFeedbacks.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#6B7280' }}>
                        No student feedback found.
                      </td>
                    </tr>
                  ) : (
                    studentFeedbacks.map((item) => (
                      <tr key={item._id} style={{ borderBottom: '1px solid #EAE8E1', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#F9FAFB' } }}>
                        <td style={{ padding: '16px 24px', fontWeight: 500 }}>{item.studentName || 'Anonymous'}</td>
                        <td style={{ padding: '16px 24px', color: '#374151' }}>
                          {item.suggestions || item.message || `Rated ${item.overallRating}/5 for ${item.faculty}`}
                        </td>
                        <td style={{ padding: '16px 24px', color: '#6B7280' }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                            backgroundColor: item.status === 'Resolved' ? '#DEF7EC' : '#FDE8E8',
                            color: item.status === 'Resolved' ? '#03543F' : '#9B1C1C'
                          }}>
                            {item.status || 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button onClick={() => setViewFeedbackModal(item)} title="View Full Details" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6366F1', fontSize: '18px', padding: 0 }}>
                              <FiEye />
                            </button>
                            <button onClick={() => handleResolveFeedback(item._id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#10B981', fontSize: '14px', fontWeight: 500, textDecoration: 'underline' }}>
                              {item.status === 'Resolved' ? 'Mark Pending' : 'Mark Resolved'}
                            </button>
                            <button onClick={() => handleDeleteFeedback(item._id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444', fontSize: '14px', fontWeight: 500, textDecoration: 'underline' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      case "faculty-feedback":
        const facultyFeedbacks = adminFeedbacks.filter(f => f.role === 'faculty');
        return (
          <>
            <div className="admin-header">
              <div>
                <h2>Faculty Feedback</h2>
                <p className="admin-header-desc">Review operational feedback submitted by faculty members.</p>
              </div>
            </div>
            <div className="search-filter-box" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '13px', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Subject</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Message</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyFeedbacks.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#6B7280' }}>
                        No faculty feedback found.
                      </td>
                    </tr>
                  ) : (
                    facultyFeedbacks.map((item) => (
                      <tr key={item._id} style={{ borderBottom: '1px solid #EAE8E1', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#F9FAFB' } }}>
                        <td style={{ padding: '16px 24px', fontWeight: 500 }}>{item.studentName || item.faculty || 'Anonymous'}</td>
                        <td style={{ padding: '16px 24px', fontWeight: 500, color: '#4B5563' }}>{item.subject || 'General Inquiry'}</td>
                        <td style={{ padding: '16px 24px', color: '#374151', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.message || item.suggestions || 'No message provided'}
                        </td>
                        <td style={{ padding: '16px 24px', color: '#6B7280' }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                            backgroundColor: item.status === 'Resolved' ? '#DEF7EC' : '#FDE8E8',
                            color: item.status === 'Resolved' ? '#03543F' : '#9B1C1C'
                          }}>
                            {item.status || 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button onClick={() => setViewFeedbackModal(item)} title="View Full Details" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6366F1', fontSize: '18px', padding: 0 }}>
                              <FiEye />
                            </button>
                            <button onClick={() => handleResolveFeedback(item._id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#10B981', fontSize: '14px', fontWeight: 500, textDecoration: 'underline' }}>
                              {item.status === 'Resolved' ? 'Mark Pending' : 'Mark Resolved'}
                            </button>
                            <button onClick={() => handleDeleteFeedback(item._id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444', fontSize: '14px', fontWeight: 500, textDecoration: 'underline' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      case "announcements":
        return (
          <>
            <div className="admin-header">
              <div>
                <h2>Broadcasting System</h2>
                <p className="admin-header-desc">Compose and dispatch official announcements to the entire academic ecosystem.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: 'calc(100vh - 250px)' }}>
              
              {/* TOP ROW: Two Boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: '350px' }}>
                {/* SENT HISTORY */}
                <div style={{
                  backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #E5E7EB'
                }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6', backgroundColor: '#F9FAFB' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>Sent Announcements</h3>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {sentAnnouncements.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
                        <FiBell style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }} />
                        <p style={{ fontSize: '14px' }}>No announcements sent yet.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {sentAnnouncements.map((ann, idx) => (
                          <div key={idx} style={{ padding: '16px', border: '1px solid #F3F4F6', borderRadius: '8px', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start' }}>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ann.subject}</h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                <button 
                                  onClick={() => handleDeleteAnnouncement(ann._id)}
                                  style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '2px', display: 'flex' }}
                                  title="Delete Announcement"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ann.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SYSTEM MESSAGES */}
                <div style={{
                  backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #E5E7EB'
                }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>System Messages</h3>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {adminNotifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
                        <FiBell style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }} />
                        <p style={{ fontSize: '14px' }}>No new messages.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {adminNotifications.map((ann) => {
                          const isRead = readNotifications.includes(ann._id);
                          return (
                            <div 
                              key={ann._id} 
                              style={{ 
                                padding: '16px', 
                                border: '1px solid #F3F4F6', 
                                borderRadius: '12px', 
                                backgroundColor: isRead ? 'white' : '#F0F7FF',
                                boxShadow: isRead ? 'none' : '0 2px 4px rgba(59, 130, 246, 0.1)',
                                position: 'relative',
                                borderLeft: isRead ? '1px solid #F3F4F6' : '4px solid #3B82F6',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ 
                                    width: '8px', height: '8px', borderRadius: '50%', 
                                    backgroundColor: isRead ? '#D1D5DB' : '#3B82F6' 
                                  }}></div>
                                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: isRead ? 600 : 700, color: '#111827' }}>
                                    {ann.subject}
                                  </h4>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                  <button 
                                    onClick={() => handleDeleteAnnouncement(ann._id)}
                                    style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '2px', display: 'flex' }}
                                    title="Delete Message"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <p style={{ margin: '0 0 12px 16px', fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>{ann.message}</p>
                              <div style={{ marginLeft: '16px', display: 'flex', gap: '12px' }}>
                                {!isRead && (
                                  <button
                                    onClick={() => setReadNotifications([...readNotifications, ann._id])}
                                    style={{
                                      border: '1px solid #3B82F6', background: '#3B82F6', color: 'white', 
                                      fontSize: '11px', fontWeight: 600, cursor: 'pointer', 
                                      padding: '4px 12px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    Mark as read
                                  </button>
                                )}
                                <span style={{ 
                                  fontSize: '11px', color: isRead ? '#10B981' : '#6B7280', 
                                  display: 'flex', alignItems: 'center', fontWeight: 600
                                }}>
                                  {isRead ? '✓ Read' : '● Unread'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: EMAIL COMPOSER STYLE */}
              <div style={{
                backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #E5E7EB', height: '400px'
              }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6', backgroundColor: '#F9FAFB' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiMessageSquare style={{ color: '#3B82F6' }} /> New Announcement
                  </h3>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
                      <span style={{ minWidth: '60px', color: '#6B7280', fontSize: '14px', fontWeight: 500 }}>To:</span>
                      <select
                        value={announcementForm.target}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, target: e.target.value })}
                        style={{ border: 'none', outline: 'none', fontSize: '14px', color: '#1E40AF', fontWeight: 600, backgroundColor: '#DBEAFE', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        <option value="both">All (Students & Faculty)</option>
                        <option value="student">Students Only</option>
                        <option value="faculty">Faculty Only</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
                      <span style={{ minWidth: '60px', color: '#6B7280', fontSize: '14px', fontWeight: 500 }}>From:</span>
                      <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>System Administrator</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
                      <span style={{ minWidth: '60px', color: '#6B7280', fontSize: '14px', fontWeight: 500 }}>Subject:</span>
                      <input
                        type="text"
                        placeholder="Enter announcement subject..."
                        value={announcementForm.subject}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, subject: e.target.value })}
                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#111827', fontWeight: 500 }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <textarea
                      style={{
                        flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: '15px', lineHeight: 1.6, color: '#374151', minHeight: '120px'
                      }}
                      placeholder="Write your announcement content here. This message will be broadcasted to all users immediately upon sending..."
                      value={announcementForm.message}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#F9FAFB' }}>
                  <button
                    className="admin-btn-primary"
                    onClick={handleSendAnnouncement}
                    disabled={isSendingAnnouncement}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, transition: 'all 0.2s'
                    }}
                  >
                    {isSendingAnnouncement ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <span>Send Announcement</span>
                        <FiLogOut style={{ transform: 'rotate(-90deg)', fontSize: '14px' }} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        );

      case "settings":
        return (
          <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="admin-header" style={{ marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '28px', color: '#111827', fontWeight: 700 }}>Settings</h2>
                <p className="admin-header-desc" style={{ fontSize: '16px', color: '#6B7280' }}>Manage your account and system preferences</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              {/* SECTION 2: Profile Settings */}
              <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiUsers style={{ color: '#3B82F6' }} /> Profile Settings
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Admin Name</label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Email Address</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                    />
                  </div>
                  <button
                    className="admin-btn-primary"
                    style={{ marginTop: '8px', width: 'fit-content', padding: '10px 24px' }}
                    onClick={() => triggerToast("Profile updated successfully!")}
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* SECTION 3: Security */}
              <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiLock style={{ color: '#F59E0B' }} /> Security
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={settingsForm.currentPassword}
                      onChange={(e) => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="password"
                      placeholder="New Password"
                      value={settingsForm.newPassword}
                      onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={settingsForm.confirmPassword}
                      onChange={(e) => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                    />
                  </div>
                  <button
                    className="admin-btn-primary"
                    style={{ marginTop: '8px', width: 'fit-content', padding: '10px 24px', backgroundColor: '#F59E0B' }}
                    onClick={() => triggerToast("Password updated securely!")}
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* SECTION 4: Notifications */}
              <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiBell style={{ color: '#8B5CF6' }} /> Notifications
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#374151' }}>Enable Notifications</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Receive real-time alerts for platform activities.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settingsForm.enableNotifications}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableNotifications: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#374151' }}>Enable Announcements</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Receive alerts when new global announcements are posted.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settingsForm.enableAnnouncements}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableAnnouncements: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 5: System Control */}
              <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiSettings style={{ color: '#10B981' }} /> System Control
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>Enable Student Registration</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settingsForm.enableStudentRegistration}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableStudentRegistration: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>Enable Faculty Registration</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settingsForm.enableFacultyRegistration}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableFacultyRegistration: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>Enable Feedback Submission</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settingsForm.enableFeedbackSubmission}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableFeedbackSubmission: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>Enable Announcements</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settingsForm.enableAnnouncements}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableAnnouncements: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 6: Account Actions */}
              <div style={{ gridColumn: 'span 2', backgroundColor: '#FFF5F5', padding: '28px', borderRadius: '16px', border: '1px solid #FEB2B2' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#C53030', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiAlertTriangle /> Account Actions
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#742A2A' }}>Terminate Session or Account</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#9B2C2C' }}>Once deleted, account data cannot be recovered.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleLogout}
                      style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: 'white', border: '1px solid #D1D5DB', color: '#374151', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Logout
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete your admin account? This action is irreversible.")) {
                          triggerToast("Account deletion request initiated...");
                        }
                      }}
                      style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#E53E3E', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* TOGGLE SWITCH STYLES */}
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
                -webkit-transition: .4s;
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
                -webkit-transition: .4s;
                transition: .4s;
              }
              input:checked + .slider {
                background-color: #3B82F6;
              }
              input:focus + .slider {
                box-shadow: 0 0 1px #3B82F6;
              }
              input:checked + .slider:before {
                -webkit-transform: translateX(20px);
                -ms-transform: translateX(20px);
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

      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">AI</div>
          {!isCollapsed && <span className="brand-text">AI Strategy</span>}
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")} title="Dashboard"
          >
            <FiHome className="nav-icon" /> {!isCollapsed && "Dashboard"}
          </div>
          <div
            className={`nav-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")} title="User Management"
          >
            <FiUsers className="nav-icon" /> {!isCollapsed && "User Management"}
          </div>
          <div
            className={`nav-item ${activeTab === "subjects" ? "active" : ""}`}
            onClick={() => setActiveTab("subjects")} title="Subjects"
          >
            <FiBook className="nav-icon" /> {!isCollapsed && "Subjects"}
          </div>
          <div
            className={`nav-item ${activeTab === "units" ? "active" : ""}`}
            onClick={() => setActiveTab("units")} title="Units"
          >
            <FiLayers className="nav-icon" /> {!isCollapsed && "Units"}
          </div>
          <div
            className={`nav-item ${activeTab === "student-feedback" ? "active" : ""}`}
            onClick={() => setActiveTab("student-feedback")} title="Student Feedback"
          >
            <FiMessageCircle className="nav-icon" /> {!isCollapsed && "Student Feedback"}
          </div>
          <div
            className={`nav-item ${activeTab === "faculty-feedback" ? "active" : ""}`}
            onClick={() => setActiveTab("faculty-feedback")} title="Faculty Feedback"
          >
            <FiMessageSquare className="nav-icon" /> {!isCollapsed && "Faculty Feedback"}
          </div>
          <div
            className={`nav-item ${activeTab === "announcements" ? "active" : ""}`}
            onClick={() => setActiveTab("announcements")} title="Announcements"
          >
            <FiTarget className="nav-icon" /> {!isCollapsed && "Announcements"}
          </div>
          <div
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")} title="Settings"
          >
            <FiSettings className="nav-icon" /> {!isCollapsed && "Settings"}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item logout" onClick={handleLogout} title="Logout">
            <FiLogOut className="nav-icon" /> {!isCollapsed && "Logout"}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="admin-main-layout">

        {/* TOP NAVBAR */}
        <header className="admin-topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="icon-btn" onClick={() => setIsCollapsed(!isCollapsed)} title="Toggle Sidebar">
              <FiMenu />
            </button>
            <h3 className="welcome-text">Welcome, {localStorage.getItem("name") || "Admin"}</h3>
          </div>

          <div className="topbar-center">
            <h2 className="platform-title">AI-Driven Academic Strategy Platform</h2>
          </div>

          <div className="topbar-right">
            <button className="icon-btn" title="Notifications" style={{ position: 'relative' }}>
              <FiBell />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: '#EF4444', color: 'white', fontSize: '10px', height: '16px', width: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold' }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="user-profile-circle" title="Admin Profile">
              {localStorage.getItem("name") ? localStorage.getItem("name").charAt(0).toUpperCase() : "A"}
            </div>
            <button className="topbar-logout-btn" onClick={handleLogout}>
              <FiLogOut className="logout-icon" /> Logout
            </button>
          </div>
        </header>

        {/* DYNAMIC CONTENT AREA */}
        <main className="admin-content-area">
          <div className="content-wrapper">
            {renderContent()}
          </div>
        </main>
      </div>

      {viewUserModal && (
        <div className="admin-modal-overlay" onClick={() => setViewUserModal(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>User Profile Details</h3>
              <button className="admin-modal-close" onClick={() => setViewUserModal(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-modal-row">
                <span className="admin-modal-label">Name:</span>
                <span className="admin-modal-value">{viewUserModal.name}</span>
              </div>
              <div className="admin-modal-row">
                <span className="admin-modal-label">Email:</span>
                <span className="admin-modal-value">{viewUserModal.email}</span>
              </div>
              <div className="admin-modal-row">
                <span className="admin-modal-label">Role:</span>
                <span className="admin-modal-value" style={{ textTransform: 'capitalize' }}>{viewUserModal.role}</span>
              </div>
              {viewUserModal.role === "faculty" && (
                <div className="admin-modal-row">
                  <span className="admin-modal-label">Subject:</span>
                  <span className="admin-modal-value">{viewUserModal.subject || "N/A"}</span>
                </div>
              )}
              <div className="admin-modal-row">
                <span className="admin-modal-label">Status:</span>
                <span className={`admin-modal-badge ${(viewUserModal.status || "Active") === "Active" ? "active" : "deactivated"}`}>
                  {viewUserModal.status || "Active"}
                </span>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setViewUserModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {editUnitModal && (
        <div className="admin-modal-overlay" onClick={() => setEditUnitModal(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ width: '500px' }}>
            <div className="admin-modal-header">
              <h3>Edit Material for {editUnitModal.unitName}</h3>
              <button className="admin-modal-close" onClick={() => setEditUnitModal(null)}>×</button>
            </div>
            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label className="modal-label" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <strong style={{ fontSize: '14px', color: '#374151' }}>Study Content *</strong>
                <textarea
                  value={materialForm.content}
                  onChange={(e) => setMaterialForm({ ...materialForm, content: e.target.value })}
                  placeholder="Enter study notes or description..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', minHeight: '100px', resize: 'vertical' }}
                />
              </label>
              <label className="modal-label" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <strong style={{ fontSize: '14px', color: '#374151' }}>YouTube Video Link</strong>
                <input
                  type="text"
                  value={materialForm.videoLink}
                  onChange={(e) => setMaterialForm({ ...materialForm, videoLink: e.target.value })}
                  placeholder="https://youtu.be/..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </label>
              <label className="modal-label" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <strong style={{ fontSize: '14px', color: '#374151' }}>PDF Study Notes Link</strong>
                <input
                  type="text"
                  value={materialForm.pdfLink}
                  onChange={(e) => setMaterialForm({ ...materialForm, pdfLink: e.target.value })}
                  placeholder="https://... (PDF link)"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </label>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setEditUnitModal(null)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSaveMaterial}>Save Material</button>
            </div>
          </div>
        </div>
      )}

      {viewFeedbackModal && (
        <div className="admin-modal-overlay" onClick={() => setViewFeedbackModal(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ width: '500px' }}>
            <div className="admin-modal-header">
              <h3>{viewFeedbackModal.role === 'faculty' ? 'Faculty Feedback' : 'Student Feedback'} Details</h3>
              <button className="admin-modal-close" onClick={() => setViewFeedbackModal(null)}>×</button>
            </div>
            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EAE8E1', paddingBottom: '8px' }}>
                <span style={{ color: '#6B7280', fontWeight: '500' }}>Name:</span>
                <span style={{ color: '#1F2937', fontWeight: '500' }}>{viewFeedbackModal.studentName || viewFeedbackModal.faculty || 'Anonymous'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EAE8E1', paddingBottom: '8px' }}>
                <span style={{ color: '#6B7280', fontWeight: '500' }}>{viewFeedbackModal.role === 'faculty' ? 'Subject:' : 'Course Group:'}</span>
                <span style={{ color: '#1F2937', fontWeight: '500' }}>{viewFeedbackModal.subject || 'N/A'}</span>
              </div>

              {viewFeedbackModal.role !== 'faculty' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                    <span style={{ color: '#6B7280', fontWeight: '500' }}>Faculty Name:</span>
                    <span style={{ color: '#1F2937', fontWeight: '600' }}>{viewFeedbackModal.faculty || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                    <span style={{ color: '#6B7280', fontWeight: '500' }}>Marks Obtained:</span>
                    <span style={{ color: '#10B981', fontWeight: '600' }}>{viewFeedbackModal.marksObtained ? `${viewFeedbackModal.marksObtained}%` : 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                    <span style={{ color: '#6B7280', fontWeight: '500' }}>Video Resources:</span>
                    <span style={{ color: '#1F2937' }}>{viewFeedbackModal.videoUseful || viewFeedbackModal.materialsUseful || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                    <span style={{ color: '#6B7280', fontWeight: '500' }}>PDF Resources:</span>
                    <span style={{ color: '#1F2937' }}>{viewFeedbackModal.pdfUseful || viewFeedbackModal.materialsUseful || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #EAE8E1' }}>
                    <span style={{ color: '#6B7280', fontWeight: '500' }}>Overall Rating:</span>
                    <span style={{ color: '#F59E0B', fontWeight: '600' }}>{viewFeedbackModal.overallRating || 0}/5 ⭐</span>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: '#6B7280', fontWeight: '500' }}>Suggestions & Feedback Body</span>
                <span style={{ display: 'block', padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '4px', border: '1px solid #EAE8E1', whiteSpace: 'pre-wrap', color: '#374151' }}>
                  {viewFeedbackModal.suggestions || viewFeedbackModal.message || 'No additional comments provided.'}
                </span>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setViewFeedbackModal(null)}>Close Viewer</button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          backgroundColor: '#10B981', color: '#ffffff',
          padding: '16px 24px', borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          zIndex: 9999, fontWeight: 500, fontSize: '15px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>✓</span> {toastMessage}
        </div>
      )}

    </div>
  );
}

export default Admin;
