const mongoose = require("mongoose");
const Subject = require("./AI-backend/Subject");
const ExamSchedule = require("./AI-backend/ExamSchedule");

async function cleanup() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        const targetSubject = "Physics";

        // 1. Delete non-Physics Subject records (marks/enrollments)
        const subResult = await Subject.deleteMany({ name: { $ne: targetSubject } });
        console.log(`Deleted ${subResult.deletedCount} non-${targetSubject} marks/enrollment records.`);

        // 2. Delete non-Physics Exam Schedules
        const examResult = await ExamSchedule.deleteMany({ subject: { $ne: targetSubject } });
        console.log(`Deleted ${examResult.deletedCount} non-${targetSubject} exam schedules.`);

        console.log("Cleanup complete.");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
cleanup();
