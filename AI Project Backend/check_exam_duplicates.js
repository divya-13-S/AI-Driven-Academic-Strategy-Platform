const mongoose = require("mongoose");
const ExamSchedule = require("./AI-backend/ExamSchedule");

async function checkDuplicates() {
  try {
    await mongoose.connect("mongodb://localhost:27017/AIuser");
    console.log("Connected to MongoDB\n");

    const exams = await ExamSchedule.find({}).sort({ examDate: 1 });
    const dates = {};

    exams.forEach(ex => {
      const dateStr = new Date(ex.examDate).toLocaleDateString();
      if (!dates[dateStr]) dates[dateStr] = [];
      dates[dateStr].push(`${ex.subject} - ${ex.examName} (${ex.unit})`);
    });

    console.log("Exam Schedule Overlap Check:");
    let overlapFound = false;
    for (const [date, list] of Object.entries(dates)) {
      if (list.length > 1) {
        overlapFound = true;
        console.log(`\n📅 ${date}:`);
        list.forEach(item => console.log(`  - ${item}`));
      }
    }

    if (!overlapFound) {
      console.log("No overlapping dates found.");
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkDuplicates();
