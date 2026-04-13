const mongoose = require("mongoose");
const Subject = require("./AI-backend/Subject");
const ExamSchedule = require("./AI-backend/ExamSchedule");

async function auditMarks() {
  try {
    await mongoose.connect("mongodb://localhost:27017/AIuser");
    console.log("Connected to MongoDB\n");

    const exams = await ExamSchedule.find({});
    const marks = await Subject.find({});

    console.log(`Found ${exams.length} exams and ${marks.length} marks records.`);

    const completedExams = exams.filter(ex => new Date(ex.examDate) < new Date());
    console.log(`${completedExams.length} exams are completed (past dates).`);

    const unwantedMarks = [];
    const validMarks = [];

    for (let mark of marks) {
      // Find if there's a matching completed exam
      const match = completedExams.find(ex => 
        ex.subject.toLowerCase() === mark.name.toLowerCase() && 
        ex.unit.toLowerCase() === mark.title.toLowerCase()
      );

      if (match) {
        validMarks.push(mark);
      } else {
        unwantedMarks.push(mark);
      }
    }

    console.log(`\nAnalysis:`);
    console.log(`- Valid Marks (matched to completed exams): ${validMarks.length}`);
    console.log(`- Unwanted Marks (no match or future exam): ${unwantedMarks.length}`);

    if (unwantedMarks.length > 0) {
      console.log("\nUnwanted marks details:");
      unwantedMarks.forEach(m => console.log(`  - ${m.name} | ${m.title} | Marks: ${m.marks}`));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

auditMarks();
