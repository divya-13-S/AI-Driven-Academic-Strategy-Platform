const mongoose = require("mongoose");

const examScheduleSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    examName: {
        type: String,
        required: true
    },
    examDate: {
        type: Date,
        required: true
    }
}, { 
    timestamps: true,
    collection: "examschedules"
});

const ExamSchedule = mongoose.model("ExamSchedule", examScheduleSchema);
module.exports = ExamSchedule;

