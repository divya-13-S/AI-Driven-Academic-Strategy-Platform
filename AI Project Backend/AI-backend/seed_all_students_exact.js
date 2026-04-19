const mongoose = require('mongoose');

async function seedMarksExacting() {
  try {
    await mongoose.connect('mongodb://localhost:27017/AIuser');
    console.log("Connected to database.");

    const db = mongoose.connection.db;

    // Clear all existing marks 
    await db.collection('subjects').deleteMany({});
    await db.collection('unit_test_marks').deleteMany({});
    console.log("Cleared all existing marks.");

    // Get all scheduled exams
    const scheduledExams = await db.collection('examschedules').find().toArray();
    // Filter to just unit 1, 2, 3 (although they mostly are)
    const targetExams = scheduledExams.filter(e => 
      e.unit.includes("Unit 1") || e.unit.includes("Unit 2") || e.unit.includes("Unit 3")
    );
    
    // Get ALL students
    const students = await db.collection('users').find({ role: { $regex: /^student$/i } }).toArray();
    console.log(`Found ${students.length} students. They will ALL be graded.`);

    const dbOperations = [];
    const newDbOperations = [];
    let marksCount = 0;

    for (const exam of targetExams) {
      
      // We want distinct marks for all students for this exam.
      // E.g., one ABS, one < 30, and others > 30.
      
      const examMarksPool = [];
      
      // 1. Give one student an ABS
      examMarksPool.push("ABS");
      
      // 2. Give one student a mark below 30
      examMarksPool.push(String(Math.floor(Math.random() * 20) + 10)); // 10 to 29
      
      // 3. For the remaining students (4 more), give distinct marks between 30 and 100
      let usedMarks = new Set();
      while (examMarksPool.length < students.length) {
        let mark = Math.floor(Math.random() * 70) + 31; // 31 to 100
        if (!usedMarks.has(mark)) {
          usedMarks.add(mark);
          examMarksPool.push(String(mark));
        }
      }
      
      // Shuffle the pool so it's assigned randomly to students
      examMarksPool.sort(() => 0.5 - Math.random());

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const marks = examMarksPool[i];

        dbOperations.push({
          insertOne: {
            document: {
              userId: student._id.toString(),
              name: exam.subject,
              title: exam.unit,     
              exam: exam.examName,  
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
    console.log(`Marks include distinct scores for each student per exam, including guaranteed ABS and < 30 marks.`);

  } catch (error) {
    console.error("Error formatting and seeding marks:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

seedMarksExacting();
