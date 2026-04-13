const mongoose = require("mongoose");
const ExamSchedule = require("./AI-backend/ExamSchedule");

async function rectifyExams() {
  try {
    await mongoose.connect("mongodb://localhost:27017/AIuser");
    console.log("Connected to MongoDB");

    const exams = await ExamSchedule.find({}).sort({ examDate: 1 });
    console.log(`Found ${exams.length} exams. Processing overlaps...\n`);

    const usedDates = new Set();
    const updates = [];

    for (let exam of exams) {
      let currentDate = new Date(exam.examDate);
      currentDate.setHours(0, 0, 0, 0);
      let dateKey = currentDate.toISOString().split('T')[0];

      if (usedDates.has(dateKey)) {
        console.log(`Overlap found for "${exam.subject} - ${exam.examName}" on ${dateKey}.`);
        
        // Find next available date
        let nextDate = new Date(currentDate);
        while (usedDates.has(nextDate.toISOString().split('T')[0])) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
        
        let newDateKey = nextDate.toISOString().split('T')[0];
        console.log(`  -> Moving to ${newDateKey}`);
        
        updates.push({
          id: exam._id,
          newDate: nextDate
        });
        
        usedDates.add(newDateKey);
      } else {
        usedDates.add(dateKey);
      }
    }

    if (updates.length > 0) {
      console.log(`\nApplying ${updates.length} updates...`);
      for (let update of updates) {
        await ExamSchedule.findByIdAndUpdate(update.id, { examDate: update.newDate });
      }
      console.log("Database successfully rectified!");
    } else {
      console.log("No overlaps found. Database is already clean.");
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

rectifyExams();
