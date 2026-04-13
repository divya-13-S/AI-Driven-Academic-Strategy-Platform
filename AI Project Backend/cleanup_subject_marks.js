const mongoose = require("mongoose");
const Subject = require("./AI-backend/Subject");
const ExamSchedule = require("./AI-backend/ExamSchedule");

async function cleanupMarks() {
  try {
    await mongoose.connect("mongodb://localhost:27017/AIuser");
    console.log("Connected to MongoDB");

    const exams = await ExamSchedule.find({});
    const completedExams = exams.filter(ex => new Date(ex.examDate) < new Date());
    
    console.log(`Found ${completedExams.length} completed exams.`);

    const marks = await Subject.find({});
    let deletedCount = 0;

    for (let mark of marks) {
      const match = completedExams.find(ex => 
        ex.subject.toLowerCase() === mark.name.toLowerCase() && 
        ex.unit.toLowerCase() === mark.title.toLowerCase()
      );

      if (!match) {
        console.log(`Deleting unwanted mark: ${mark.name} | ${mark.title}`);
        await Subject.findByIdAndDelete(mark._id);
        deletedCount++;
      }
    }

    console.log(`\nCleanup complete! Deleted ${deletedCount} unwanted marks records.`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

cleanupMarks();
