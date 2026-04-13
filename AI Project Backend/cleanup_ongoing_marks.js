const mongoose = require("mongoose");
const Subject = require("./AI-backend/Subject");
const ExamSchedule = require("./AI-backend/ExamSchedule");

async function cleanupOngoing() {
  try {
    await mongoose.connect("mongodb://localhost:27017/AIuser");
    console.log("Connected to MongoDB");

    const exams = await ExamSchedule.find({});
    const now = new Date();
    const threshold = 24 * 60 * 60 * 1000; // 24 hours in MS

    // Identify exams that are NOT yet "completed + 24 hours"
    const ongoingExams = exams.filter(ex => {
      const examTime = new Date(ex.examDate).getTime();
      return (now.getTime() - examTime) < threshold;
    });
    
    console.log(`Found ${ongoingExams.length} ongoing or future exams (inc. those within 24h of scheduled time).`);

    const marks = await Subject.find({});
    let deletedCount = 0;

    for (let mark of marks) {
      const isOngoing = ongoingExams.some(ex => 
        ex.subject.toLowerCase() === mark.name.toLowerCase() && 
        ex.unit.toLowerCase() === mark.title.toLowerCase()
      );

      if (isOngoing) {
        console.log(`Deleting pre-emptive marks: ${mark.name} | ${mark.title}`);
        await Subject.findByIdAndDelete(mark._id);
        deletedCount++;
      }
    }

    console.log(`\nCleanup complete! Deleted ${deletedCount} pre-emptive marks records.`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

cleanupOngoing();
