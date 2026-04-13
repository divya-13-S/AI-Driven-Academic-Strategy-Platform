const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    examTitle: {
        type: String,
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    portionCompleted: {
        type: Number, // percentage (0 - 100)
        required: true
    }
}, { 
    timestamps: true,
    collection: "exams"
});

const Exam = mongoose.model("Exam", examSchema);
module.exports = Exam;

