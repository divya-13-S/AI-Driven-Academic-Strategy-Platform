const mongoose = require('mongoose');

async function fixMarks() {
  try {
    await mongoose.connect('mongodb://localhost:27017/AIuser');
    console.log("Connected to database.");

    const db = mongoose.connection.db;

    // 1. Remove 4th and 5th unit from materials and topics as requested
    await db.collection('materials').deleteMany({
      $or: [
        { topic: { $regex: /Unit 4/i } },
        { topic: { $regex: /Unit 5/i } }
      ]
    });
    console.log("Removed 4th and 5th units from materials.");

    // Clear all existing marks 
    await db.collection('subjects').deleteMany({});
    await db.collection('unit_test_marks').deleteMany({});
    console.log("Cleared all existing marks.");

    // Get all scheduled exams
    const scheduledExams = await db.collection('examschedules').find().toArray();
    
    // Get all students
    const students = await db.collection('users').find({ role: { $regex: /^student$/i } }).toArray();

    const dbOperations = [];
    const newDbOperations = [];
    let marksCount = 0;

    for (const exam of scheduledExams) {
      // "don't add for all 6 subjects" -> Assuming typo for "students", pick only 4 or 5 students for each exam
      // so some students literally do not have marks yet for these exams.
      const numStudentsToGrade = Math.floor(Math.random() * 2) + 4; // 4 or 5 students
      const selectedStudents = students.sort(() => 0.5 - Math.random()).slice(0, numStudentsToGrade);

      for (const student of selectedStudents) {
        let marks;
        if (Math.random() < 0.15) {
          marks = "ABS";
        } else {
          marks = String(Math.floor(Math.random() * (100 - 40 + 1)) + 40);
        }

        dbOperations.push({
          insertOne: {
            document: {
              userId: student._id.toString(),
              name: exam.subject,
              title: exam.unit,     // matches scheduled exam "Unit 1"
              exam: exam.examName,  // matches scheduled exam "Unit Test 1"
              marks: marks,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        });

        newDbOperations.push({
          insertOne: {
            document: {
              userId: student._id.toString(),
              studentName: student.name,
              subjectName: exam.subject,
              unitTitle: exam.unit,
              exam: exam.examName,
              marks: marks,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        });

        marksCount++;
      }
    }

    if (dbOperations.length > 0) {
      await db.collection('subjects').bulkWrite(dbOperations);
      await db.collection('unit_test_marks').bulkWrite(newDbOperations);
    }
    
    console.log(`Successfully generated and seeded ${marksCount} marks.`);
    
  } catch (error) {
    console.error("Error formatting and seeding marks:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

fixMarks();
