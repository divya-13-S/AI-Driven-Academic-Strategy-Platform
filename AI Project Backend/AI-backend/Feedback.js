const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  subject: { type: String, required: true },
  faculty: { type: String },
  teachingRating: { type: Number },
  materialsUseful: { type: String },
  doubtClearing: { type: Number },
  paceOfTeaching: { type: Number },
  overallRating: { type: Number },
  role: { type: String, default: "student", required: true }, // "student" or "faculty"
  status: { type: String, default: "Pending" }, // "Pending" or "Resolved"
  suggestions: { type: String },
  message: { type: String }, // generic message field if role is faculty
}, { 
  timestamps: true,
  collection: "feedbacks"
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);
module.exports = Feedback;

