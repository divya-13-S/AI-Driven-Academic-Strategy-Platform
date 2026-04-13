const mongoose = require("mongoose");

const completionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    completed: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now }
}, { 
    timestamps: true,
    collection: "completions"
});

// Compound index to ensure uniqueness per student/subject/topic
completionSchema.index({ userId: 1, subject: 1, topic: 1 }, { unique: true });

const Completion = mongoose.model("Completion", completionSchema);
module.exports = Completion;

