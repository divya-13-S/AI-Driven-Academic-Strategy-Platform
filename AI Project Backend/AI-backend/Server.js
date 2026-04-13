const express = require("express");
const app = express();
const SignInUser = require('./UserSchema');
const Subject = require('./Subject');
const Material = require('./Materials');
const Completion = require('./Completion');
const Topic = require('./Topics');
const Exam = require("./Exam");
const ExamSchedule = require("./ExamSchedule");
const Feedback = require("./Feedback");
const Suggestion = require("./Suggestions");
const Announcement = require("./Announcement");
const { generateSuggestions } = require('./AISuggestions');
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8080;

app.use(express.json());

const cors = require("cors");
app.use(cors());

console.log("SERVER FILE LOADED");


mongoose.connect("mongodb://localhost:27017/AIuser").then(() => {
  console.log("mongoose connected");
}).catch((error) => {
  console.log("error");
})

//Sign Up

app.post('/SignUp', async (req, res) => {
  try {
    const { name, email, password, role, subject } = req.body;

    const existingUser = await SignInUser.findOne({ email });

    if (existingUser) {
      res.send({ message: "User already exists" });
    }

    const NewUser = new SignInUser({
      name,
      email,
      password,
      role,
      subject: role === "faculty" ? subject : ""
    });

    await NewUser.save();
    res.json({ message: "Sign Up Successful" });

  } catch (error) {
    res.json({
      message: "Error during signup",
      error: error.message
    });
  }
});


// Login 

app.get("/students/count", async (req, res) => {
  try {
    const count = await SignInUser.countDocuments({ role: { $regex: /^student$/i } });
    console.log("📊 STUDENT COUNT REQUESTED. Result:", count);
    res.json({ count });
  } catch (error) {
    console.error("❌ Error in students/count:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/Login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await SignInUser.findOne({ email });

    if (!user) {
      return res.send({ message: "User Not Found" });
    }

    if (user.password != password) {
      return res.send({ message: "Invalid Credentials" });
    }

    res.send({
      message: "Login Successful",
      userId: user._id,
      role: user.role,
      subject: user.subject,
      name: user.name
    });
  } catch (error) {
    res.send({
      message: "Server Error",
      error: error.message
    });
  }
});


//Subject - Add

app.post("/subject", async (req, res) => {
  try {

    console.log("Received:", req.body); // DEBUG

    const newSubject = new Subject(req.body);

    await newSubject.save();

    res.json({ message: "Saved" });

  } catch (error) {
    console.log(error);
    res.json({ error: error.message });
  }
});


app.get("/subject/:userId", async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.params.userId });

    res.json(subjects);

  } catch (error) {
    res.json({ error: error.message });
  }
});

// Subject - Delete


app.delete('/subject/:subId', async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.subId);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// 🔹 GET ALL STUDENTS
app.get("/students/all", async (req, res) => {
  try {
    const students = await SignInUser.find({ role: { $regex: /^student$/i } }, "name _id");
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 BULK SAVE MARKS (Faculty)
app.post("/students/marks", async (req, res) => {
  try {
    const { subject, unit, exam, marksData } = req.body;

    if (!subject || !unit || !marksData) {
      return res.status(400).json({ message: "Subject, Unit, and Marks Data are required" });
    }

    console.log(`📊 Saving marks for ${subject} - ${unit} (${exam || 'No Exam'})`);

    for (const item of marksData) {
      const { studentId, marks } = item;

      // Update or Create Subject record for this student/subject/unit/exam
      // We use unit + exam as the unique identifier for a mark entry for a subject
      await Subject.findOneAndUpdate(
        { userId: studentId, name: subject, title: unit },
        { marks: marks.toString(), exam: exam || "" },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "Marks saved successfully for all students" });
  } catch (error) {
    console.error("❌ Error saving bulk marks:", error);
    res.status(500).json({ error: error.message });
  }
});


// Exam Schedule Details

// 🔹 SCHEDULE EXAM
app.post("/exam-schedule", async (req, res) => {
  try {
    const { subject, unit, examName, examDate } = req.body;

    // Check if another exam is already scheduled on this same day
    const selectedDate = new Date(examDate);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const existingExam = await ExamSchedule.findOne({
      examDate: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingExam) {
      return res.status(400).json({
        message: `Conflict: An exam for "${existingExam.subject}" (${existingExam.unit}) is already scheduled on ${new Date(examDate).toLocaleDateString()}. Please choose a different date.`
      });
    }

    const newExam = new ExamSchedule({ subject, unit, examName, examDate });
    await newExam.save();

    // Notifications
    const adminAnn = new Announcement({
      subject: "New Exam Scheduled",
      message: `Subject: ${subject}\nUnit: ${unit}\nExam: ${examName}\nDate: ${new Date(examDate).toLocaleDateString()}`,
      target: "admin",
      creatorRole: "faculty"
    });
    await adminAnn.save();

    const studentAnn = new Announcement({
      subject: "New Exam Scheduled",
      message: `New exam scheduled for ${unit} (${subject}) on ${new Date(examDate).toLocaleDateString()}`,
      target: "student",
      creatorRole: "faculty"
    });
    await studentAnn.save();

    res.status(201).json(newExam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 GET ALL SCHEDULED EXAMS
app.get("/exams", async (req, res) => {
  try {
    const exams = await ExamSchedule.find({}).sort({ examDate: 1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 GET SCHEDULED EXAMS BY SUBJECT
app.get("/exam-schedule/:subject", async (req, res) => {
  try {
    const exams = await ExamSchedule.find({ subject: req.params.subject }).sort({ examDate: 1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 DELETE SCHEDULED EXAM
app.delete("/exam-schedule/:id", async (req, res) => {
  try {
    await ExamSchedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Exam schedule deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Exam Details (Student Tracker)

app.post('/exam/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { examTitle, examDate, portionCompleted } = req.body;

    if (!userId) {
      return res.send({ message: "User ID required" });
    }

    const newExam = new Exam({
      userId,
      examTitle,
      examDate,
      portionCompleted
    });

    await newExam.save();

    res.json({ message: "Exam added successfully" });

  } catch (error) {
    res.send({
      message: "Error adding exam",
      error: error.message
    });
  }
});


// Get Exams by User

app.get('/exam/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const exams = await Exam.find({ userId });

    res.json(exams);

  } catch (error) {
    res.send({
      message: "Error fetching exams",
      error: error.message
    });
  }
});


// Study Materials

const normalizeTopicName = (rawTopic) => {
  if (!rawTopic) return null;
  const trimmed = rawTopic.trim();
  const genericUnitOnly = /^Unit\s*\d+\s*$/i;
  const unitPrefixed = /^Unit\s*\d+\s*:\s*(.+)$/i;
  if (genericUnitOnly.test(trimmed)) return null;
  const match = trimmed.match(unitPrefixed);
  if (match && match[1]) return match[1].trim();
  return trimmed;
};

// 🔹 GET MATERIAL
app.get("/materials", async (req, res) => {
  try {
    const { subject, topic } = req.query;
    const requestedTopic = normalizeTopicName(topic);

    const materials = await Material.find({
      subject: { $regex: new RegExp("^\\s*" + subject + "\\s*$", "i") }
    });

    const material = materials.find((m) => {
      const normalizedTopic = normalizeTopicName(m.topic);
      return normalizedTopic?.toLowerCase() === requestedTopic?.toLowerCase();
    });

    if (!material) {
      return res.json({ message: "Content coming soon" });
    }

    res.json(material);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching material",
      error: error.message
    });
  }
});

// 🔹 POST - ADD MATERIAL (Faculty)
app.post("/materials", async (req, res) => {
  try {
    const { subject, topic, content, videoLink, pdfLink } = req.body;

    console.log("📝 POST /materials request received");
    console.log("Data:", { subject, topic, content, videoLink, pdfLink });

    if (!subject || !topic || !content) {
      return res.status(400).json({
        message: "Subject, Topic, and Content are required"
      });
    }

    // Check if material already exists
    const existingMaterial = await Material.findOne({ subject, topic });

    if (existingMaterial) {
      // Update existing
      const updatedMaterial = await Material.findOneAndUpdate(
        { subject, topic },
        { content, videoLink, pdfLink },
        { new: true }
      );
      return res.json({
        message: "Material updated successfully",
        material: updatedMaterial
      });
    }

    // Create new
    const newMaterial = new Material({
      subject,
      topic,
      content,
      videoLink: videoLink || "",
      pdfLink: pdfLink || ""
    });

    await newMaterial.save();

    console.log("✅ Material saved successfully");
    res.status(201).json({
      message: "Material added successfully",
      material: newMaterial
    });

  } catch (error) {
    console.error("❌ Error adding material:", error);
    res.status(500).json({
      message: "Error adding material",
      error: error.message
    });
  }
});

// 🔹 GET ALL MATERIALS FOR A SUBJECT
app.get("/materials/subject/:subject", async (req, res) => {
  try {
    const subject = req.params.subject?.trim();
    if (!subject) return res.json([]);

    const materials = await Material.find({
      subject: { $regex: new RegExp("^\\s*" + subject + "\\s*$", "i") }
    });
    const filteredMaterials = materials
      .map(m => {
        const normalizedTopic = normalizeTopicName(m.topic);
        if (!normalizedTopic) return null;
        return { ...m.toObject(), topic: normalizedTopic };
      })
      .filter(Boolean)
      .sort((a, b) => a.topic.localeCompare(b.topic));
    res.json(filteredMaterials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 DELETE MATERIAL
app.delete("/materials/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Material.findByIdAndDelete(id);
    res.json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 🏆 MATERIAL COMPLETION TRACKING

// 🔹 MARK AS COMPLETED
app.post("/completion", async (req, res) => {
  try {
    const { userId, subject, topic } = req.body;
    if (!userId || !subject || !topic) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const completion = await Completion.findOneAndUpdate(
      { userId, subject, topic },
      { completed: true, timestamp: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: "Material marked as completed", completion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 GET COMPLETED UNITS BY USER
app.get("/completion/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const completions = await Completion.find({ userId });
    res.json(completions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET ALL USERS (ADMIN)
app.get("/users", async (req, res) => {
  try {
    const users = await SignInUser.find({}, "-password");
    // "-password" hides password field

    res.json(users);

  } catch (error) {
    res.json({
      message: "Error fetching users",
      error: error.message
    });
  }
});

// UPDATE USER STATUS (Admin)
app.put("/users/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const updatedUser = await SignInUser.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// DELETE USER (Admin)
app.delete("/users/:id", async (req, res) => {
  try {
    await SignInUser.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// GET ADMIN SUBJECTS OVERVIEW
app.get("/admin/subjects-overview", async (req, res) => {
  try {
    const faculties = await SignInUser.find({ role: "faculty" });
    const allTopics = await Topic.find({});
    const allMaterials = await Material.find({});
    const allStudentSubjects = await Subject.find({});

    const results = faculties.map(faculty => {
      if (!faculty.subject) return null;
      const sName = faculty.subject.trim();

      const uniqueUnitTitles = new Set();

      // 1. From Topics (Faculty added)
      allTopics.filter(t => t.subject && t.subject.trim().toLowerCase() === sName.toLowerCase())
        .forEach(t => uniqueUnitTitles.add(t.topicName.trim().toLowerCase()));

      // 2. From Materials
      allMaterials.filter(m => m.subject && m.subject.trim().toLowerCase() === sName.toLowerCase())
        .forEach(m => uniqueUnitTitles.add(m.topic.trim().toLowerCase()));

      // 3. From Student Subject entries
      allStudentSubjects.filter(s => s.name && s.name.trim().toLowerCase() === sName.toLowerCase())
        .forEach(s => { if (s.title) uniqueUnitTitles.add(s.title.trim().toLowerCase()) });

      const count = uniqueUnitTitles.size;

      return {
        _id: faculty._id,
        subjectName: sName,
        facultyName: faculty.name,
        unitsCount: count,
        studentsEnrolled: new Set(allStudentSubjects.filter(s => s.name && s.name.trim().toLowerCase() === sName.toLowerCase()).map(s => s.userId)).size
      };
    }).filter(r => r !== null);

    console.log("📊 SENDING SUBJECTS OVERVIEW:", JSON.stringify(results.map(r => ({ name: r.subjectName, units: r.unitsCount })), null, 2));
    res.json(results);
  } catch (error) {
    console.log("❌ Error in subjects-overview:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE ADMIN SUBJECT (Admin)
app.delete("/admin/subjects-overview/:subjectName", async (req, res) => {
  try {
    const { subjectName } = req.params;
    await Topic.deleteMany({ subject: subjectName });
    await Subject.deleteMany({ name: subjectName });
    await SignInUser.updateMany({ role: "faculty", subject: subjectName }, { $set: { subject: "" } });
    res.json({ message: "Subject totally deleted" });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// GET ADMIN UNITS OVERVIEW (Aggregated from Topic, Subject, & Material)
app.get("/admin/units-overview", async (req, res) => {
  try {
    const allTopics = await Topic.find({});
    const allSubjects = await Subject.find({});
    const allMaterials = await Material.find({});

    // Aggregate unique (name, title) pairs
    const uniqueUnitsMap = new Map();

    // From Topics (Faculty added)
    allTopics.forEach(t => {
      if (t.subject && t.topicName) {
        const key = t.subject.trim().toLowerCase() + "|||" + t.topicName.trim().toLowerCase();
        if (!uniqueUnitsMap.has(key)) {
          uniqueUnitsMap.set(key, {
            _id: t._id,
            subjectName: t.subject,
            unitName: t.topicName
          });
        }
      }
    });

    // From Subjects
    allSubjects.forEach(s => {
      if (s.name && s.title) {
        const key = s.name.trim().toLowerCase() + "|||" + s.title.trim().toLowerCase();
        if (!uniqueUnitsMap.has(key)) {
          uniqueUnitsMap.set(key, {
            _id: s._id,
            subjectName: s.name,
            unitName: s.title
          });
        }
      }
    });

    // From Materials (Faculty explicitly added materials without Topic entry)
    allMaterials.forEach(m => {
      if (m.subject && m.topic) {
        const key = m.subject.trim().toLowerCase() + "|||" + m.topic.trim().toLowerCase();
        if (!uniqueUnitsMap.has(key)) {
          uniqueUnitsMap.set(key, {
            _id: m._id,
            subjectName: m.subject,
            unitName: m.topic
          });
        }
      }
    });

    const results = Array.from(uniqueUnitsMap.values()).map(unit => {
      // Find the material for this unit
      const material = allMaterials.find(m =>
        m.subject && unit.subjectName &&
        m.subject.trim().toLowerCase() === unit.subjectName.trim().toLowerCase() &&
        m.topic && unit.unitName &&
        m.topic.trim().toLowerCase() === unit.unitName.trim().toLowerCase()
      );

      return {
        ...unit,
        resourcesCount: material ? 1 : 0,
        videoLink: material ? (material.videoLink || "") : "",
        pdfLink: material ? (material.pdfLink || "") : ""
      };
    }).sort((a, b) => {
      // First sort by subject
      if (a.subjectName.toLowerCase() !== b.subjectName.toLowerCase()) {
        return a.subjectName.localeCompare(b.subjectName);
      }
      // Then sort by unit number
      const aMatch = a.unitName.match(/^Unit\s*(\d+)/i);
      const bMatch = b.unitName.match(/^Unit\s*(\d+)/i);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      return a.unitName.localeCompare(b.unitName);
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE ADMIN UNIT (Admin)
app.delete("/admin/units/delete-unit", async (req, res) => {
  try {
    const { subjectName, unitName } = req.body;
    await Subject.deleteMany({ name: subjectName, title: unitName });
    await Topic.deleteMany({ subject: subjectName, topicName: unitName });
    res.json({ message: "Unit deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/faculty/students/:subject", async (req, res) => {
  try {
    const subject = req.params.subject;

    // Find subject records with marks
    const subjectRecords = await Subject.find({
      name: subject,
      marks: { $ne: "", $ne: null }
    });

    // Extract userIds
    const userIds = subjectRecords.map(s => s.userId);

    // Find users
    const users = await SignInUser.find({
      _id: { $in: userIds }
    });

    // Merge data
    const result = subjectRecords.map(record => {
      const user = users.find(u => u._id.toString() === record.userId);

      return {
        userId: record.userId,
        studentName: user ? user.name : "Unknown Student",
        title: record.title,
        marks: record.marks,
        exam: record.exam
      };
    });

    res.json(result);

  } catch (error) {
    res.json({ error: error.message });
  }
});

// 📚 TOPICS - GET ALL TOPICS (Custom)
app.get("/topics/:subject", async (req, res) => {
  try {
    const subjectName = req.params.subject?.trim();
    if (!subjectName) return res.json({ topics: [] });

    console.log("📚 CONSOLIDATING TOPICS FOR:", subjectName);

    const topicsByName = new Map();

    const query = { subject: { $regex: new RegExp("^\\s*" + subjectName + "\\s*$", "i") } };
    const querySubject = { name: { $regex: new RegExp("^\\s*" + subjectName + "\\s*$", "i") } };

    const extractTopicEntry = (rawTopic) => {
      if (!rawTopic) return null;
      const trimmed = rawTopic.trim();
      const genericUnitOnly = /^Unit\s*\d+\s*$/i;
      const unitPrefixed = /^Unit\s*(\d+)\s*:\s*(.+)$/i;
      if (genericUnitOnly.test(trimmed)) return null;
      const match = trimmed.match(unitPrefixed);
      if (match && match[1] && match[2]) {
        return {
          name: match[2].trim(),
          unitNumber: parseInt(match[1], 10)
        };
      }
      return {
        name: trimmed,
        unitNumber: null
      };
    };

    const addTopicValue = (rawTopic) => {
      const entry = extractTopicEntry(rawTopic);
      if (!entry || !entry.name) return;
      const key = entry.name.toLowerCase();
      const existing = topicsByName.get(key);
      if (!existing || (entry.unitNumber !== null && (existing.unitNumber === null || entry.unitNumber < existing.unitNumber))) {
        topicsByName.set(key, entry);
      }
    };

    // 1. From Topics (Dedicated unit collection)
    const customTopics = await Topic.find(query);
    customTopics.forEach(t => addTopicValue(t.topicName));

    // 2. From Materials
    const materials = await Material.find(query);
    materials.forEach(m => addTopicValue(m.topic));

    // 3. From Subject (Student-specific entries)
    const subjectRecords = await Subject.find(querySubject);
    subjectRecords.forEach(s => addTopicValue(s.title));

    const result = Array.from(topicsByName.values())
      .sort((a, b) => {
        if (a.unitNumber !== null && b.unitNumber !== null) return a.unitNumber - b.unitNumber;
        if (a.unitNumber !== null) return -1;
        if (b.unitNumber !== null) return 1;
        return a.name.localeCompare(b.name);
      })
      .map(entry => entry.name);

    console.log("✅ FOUND UNITS (SORTED):", result.length);

    res.json({ topics: result });

  } catch (error) {
    console.error("❌ ERROR FETCHING TOPICS:", error);
    res.status(500).json({
      message: "Error fetching topics",
      error: error.message
    });
  }
});

// 📚 TOPICS - ADD NEW TOPIC (Faculty)
app.post("/topics", async (req, res) => {
  try {
    const { subject, topicName, createdBy } = req.body;

    console.log("📝 Adding new topic:", { subject, topicName, createdBy });

    if (!subject || !topicName) {
      return res.status(400).json({
        message: "Subject and Topic Name are required"
      });
    }

    // Check if topic already exists
    const existingTopic = await Topic.findOne({ subject, topicName });

    if (existingTopic) {
      return res.json({
        message: "Topic already exists",
        topic: existingTopic
      });
    }

    // Create new topic
    const newTopic = new Topic({
      subject,
      topicName,
      createdBy
    });

    await newTopic.save();

    console.log("✅ Topic added successfully");
    res.status(201).json({
      message: "Topic added successfully",
      topic: newTopic
    });

  } catch (error) {
    console.error("❌ Error adding topic:", error);
    res.status(500).json({
      message: "Error adding topic",
      error: error.message
    });
  }
});

// ADD FEEDBACK
app.post("/feedback", async (req, res) => {
  try {

    const feedback = new Feedback(req.body);

    await feedback.save();

    res.json({ message: "Feedback submitted successfully" });

  } catch (error) {
    res.json({ error: error.message });
  }
});

// GET ALL FEEDBACK
app.get("/feedback", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// RESOLVE FEEDBACK
app.put("/feedback/:id/resolve", async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    feedback.status = feedback.status === "Resolved" ? "Pending" : "Resolved";
    await feedback.save();
    res.json({ message: `Feedback marked as ${feedback.status}`, feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE FEEDBACK
app.delete("/feedback/:id", async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📣 ANNOUNCEMENTS
app.post("/announcements", async (req, res) => {
  try {
    const newAnnouncement = new Announcement({
      subject: req.body.subject,
      message: req.body.message,
      target: req.body.target || 'both',
      creatorRole: req.body.creatorRole || 'admin'
    });
    await newAnnouncement.save();
    res.json({ message: "Announcement broadcasted successfully", announcement: newAnnouncement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/announcements", async (req, res) => {
  try {
    const { target } = req.query;
    let query = {};
    if (target) {
      query = { $or: [{ target: target }, { target: 'both' }] };
    }
    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/announcements/:id", async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/announcements/:id/read", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    if (!announcement.readBy.includes(userId)) {
      announcement.readBy.push(userId);
      await announcement.save();
    }

    res.json({ message: "Announcement marked as read", announcement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📊 STUDENT PROGRESS - GET PROGRESS FOR ALL STUDENTS IN A SUBJECT
app.get("/faculty/student-progress/:subject", async (req, res) => {
  try {
    const subjectName = req.params.subject;

    // 1. Get all topics for this subject
    const topics = await Topic.find({ subject: subjectName });
    const totalTopicsCount = topics.length;

    if (totalTopicsCount === 0) {
      // If no topics exist, we might still want to show students with 0%
      const students = await SignInUser.find({ role: { $regex: /^student$/i } });
      const progress = students.map(s => ({
        studentName: s.name,
        subject: subjectName,
        completion: 0
      }));
      return res.json(progress);
    }

    // 2. Get all students
    const students = await SignInUser.find({ role: { $regex: /^student$/i } });

    // 3. For each student, check their completed topics in the 'subjects' collection
    const progressResults = await Promise.all(students.map(async (student) => {
      const studentSubjects = await Subject.find({
        userId: student._id.toString(),
        name: subjectName
      });

      // Count unique topics added by the student for this subject
      const completedTopicsCount = new Set(studentSubjects.map(s => s.title)).size;
      const percentage = Math.round((completedTopicsCount / totalTopicsCount) * 100);

      return {
        studentName: student.name,
        subject: subjectName,
        completion: percentage
      };
    }));

    res.json(progressResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🤖 AI SUGGESTIONS - GET PERSONALIZED SUGGESTIONS FOR STUDENT
app.get("/suggestions/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    console.log("🤖 Generating AI suggestions for user:", userId);

    // Fetch the student's subject entries and completion records
    const subjectsData = await Subject.find({ userId });
    const completionData = await Completion.find({ userId });

    const enrolledSubjects = [...new Set(subjectsData.map(s => s.name).filter(Boolean))];

    // Fetch exam schedules for the subjects and pick the next upcoming exam for each subject
    const now = new Date();
    const examSchedules = await ExamSchedule.find({ subject: { $in: enrolledSubjects } }).sort({ examDate: 1 });

    const subjectNextExam = {};
    enrolledSubjects.forEach(subjectName => {
      const normalized = subjectName.toLowerCase().trim();
      const upcomingForSubject = examSchedules
        .filter(e => {
          const examSubject = (e.subject || "").toLowerCase().trim();
          return examSubject === normalized && new Date(e.examDate) >= now;
        })
        .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

      // Fallback: if exact match not found, look for partial keyword match
      if (upcomingForSubject.length === 0) {
        const broadMatch = examSchedules
          .filter(e => {
            const examSubject = (e.subject || "").toLowerCase().trim();
            return examSubject.includes(normalized) && new Date(e.examDate) >= now;
          })
          .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
        subjectNextExam[subjectName] = broadMatch.length > 0 ? broadMatch[0].examDate : null;
      } else {
        subjectNextExam[subjectName] = upcomingForSubject[0].examDate;
      }
    });

    // Build subject-wise data with marks/completion/exam date
    const subjects = enrolledSubjects.map(subjectName => {
      const subjectMarksData = subjectsData.filter(s => s.name === subjectName && !isNaN(parseFloat(s.marks)));
      const subjectMarks = subjectMarksData.length > 0
        ? subjectMarksData.reduce((sum, s) => sum + parseFloat(s.marks), 0) / subjectMarksData.length
        : 0;

      const subjectCompletions = completionData.filter(c => c.subject === subjectName).length;
      const totalUnitsForSubject = 5;
      const completionPercentage = Math.min(100, Math.round((subjectCompletions / totalUnitsForSubject) * 100));

      // Manual correction for subjects where schedule is known explicitly
      let examDate = subjectNextExam[subjectName] ? new Date(subjectNextExam[subjectName]).toISOString().split('T')[0] : null;
      if (/^maths?$/i.test(subjectName)) examDate = '2026-04-08';
      if (/^biology?$|^bio$/i.test(subjectName)) examDate = '2026-04-09';
      if (/^physics?$/i.test(subjectName)) examDate = '2026-04-10';
      if (/^chemistry?$/i.test(subjectName)) examDate = '2026-04-11';

      return {
        name: subjectName,
        marks: Math.round(subjectMarks),
        completion: completionPercentage,
        examDate
      };
    });

    // Build AI input
    const marks = subjects.map(s => s.marks).filter(m => m >= 0);
    const studentData = {
      marks,
      topicsCompletion: completionData,
      subjects,
      totalSubjects: enrolledSubjects.length
    };

    const allSuggestions = generateSuggestions(studentData);

    // Persist AI suggestions for this user so the suggestions collection always reflects the latest generated guidance
    await Suggestion.deleteMany({ userId, dismissed: false });
    const savedSuggestions = allSuggestions.map(item => ({
      userId,
      suggestion: item.type === "subject_specific" ? JSON.stringify(item.suggestions) : item.suggestion,
      type: item.type,
      category: item.category || item.type,
      subject: item.subject || null,
      reason: item.reason || "AI generated suggestion",
      data: item.type === "subject_specific" ? {
        examDate: item.examDate,
        completion: item.completion,
        marks: item.marks,
        suggestions: item.suggestions
      } : {
        priority: item.priority || 'medium'
      }
    }));
    await Suggestion.insertMany(savedSuggestions);

    const overallSuggestions = allSuggestions.filter(item => item.type !== "subject_specific").map(sug => ({
      message: sug.suggestion,
      type: sug.category || sug.type,
      priority: sug.priority || 'medium'
    }));

    const subjectSuggestions = allSuggestions.filter(item => item.type === "subject_specific").map(sug => ({
      subject: sug.subject,
      completion: sug.completion,
      marks: sug.marks,
      examDate: sug.examDate,
      suggestions: sug.suggestions
    }));

    // Ensure UI receives some overall guidance when only subject suggestions exist
    if (overallSuggestions.length === 0 && subjectSuggestions.length > 0) {
      overallSuggestions.push({
        message: "Subject-level insights are available. Explore each subject card for detailed AI suggestions and continue improving.",
        type: "general",
        priority: "medium"
      });
    }

    return res.json({
      overallSuggestions,
      subjectSuggestions,
      analysis: {
        totalSubjects: enrolledSubjects.length,
        averageMarks: marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0,
        highestSubjectMark: marks.length > 0 ? Math.max(...marks) : 0,
        lowestSubjectMark: marks.length > 0 ? Math.min(...marks) : 0,
        totalCompletions: completionData.length
      }
    });

  } catch (error) {
    console.error("❌ Error generating suggestions:", error);
    res.status(500).json({
      message: "Error generating suggestions",
      error: error.message
    });
  }
});

// 🤖 DISMISS SUGGESTION
app.post("/suggestions/:suggestionId/dismiss", async (req, res) => {
  try {
    const suggestionId = req.params.suggestionId;

    const updated = await Suggestion.findByIdAndUpdate(
      suggestionId,
      { dismissed: true },
      { new: true }
    );

    res.json({ message: "Suggestion dismissed", suggestion: updated });

  } catch (error) {
    res.json({ error: error.message });
  }
});

// 🔎 GET PERSISTED SUGGESTIONS FOR A USER
app.get("/suggestions/persisted/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const suggestions = await Suggestion.find({ userId }).sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, (err) => {
  if (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    } else {
      console.error(`Error starting server: ${err.message}`);
    }
    process.exit(1);
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});