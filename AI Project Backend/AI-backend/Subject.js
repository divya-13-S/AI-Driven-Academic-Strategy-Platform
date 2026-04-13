const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },        // subject name
  title: { type: String, required: true },       // unit/topic title
  marks: { type: String, default: "" },          // marks obtained
  exam: { type: String, default: "" }            // exam date/reference
}, { 
  timestamps: true,
  collection: "subjects"
});

const Subject = mongoose.model("Subject", SubjectSchema);
module.exports = Subject;