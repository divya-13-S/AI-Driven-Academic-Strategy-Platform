const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    suggestion: { type: String, required: true },
    type: { type: String }, // "overall_performance", "overall_completion", "subject_specific", etc.
    category: { type: String },
    subject: { type: String },
    reason: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
    shownAt: { type: Date, default: Date.now },
    dismissed: { type: Boolean, default: false }
}, { 
    timestamps: true,
    collection: "suggestions"
});

module.exports = mongoose.model("Suggestion", suggestionSchema);

