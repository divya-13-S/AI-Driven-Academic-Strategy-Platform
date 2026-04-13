const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  target: { type: String, enum: ['student', 'faculty', 'both', 'admin'], default: 'both' },
  creatorRole: { type: String, enum: ['faculty', 'admin'], default: 'admin' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { 
  timestamps: true,
  collection: "announcements"
});

const Announcement = mongoose.model("Announcement", AnnouncementSchema);
module.exports = Announcement;

