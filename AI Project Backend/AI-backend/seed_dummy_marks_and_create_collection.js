const mongoose = require('mongoose');
const Subject = require('./Subject'); // This is where current marks and enrollments are stored

// Schema for the new DB collection for unit test marks
const UnitTestMarkSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  studentName: { type: String, required: true },
  subjectName: { type: String, required: true },
  unitTitle: { type: String, required: true },
  exam: { type: String, default: 'Unit Test' },
  marks: { type: String, required: true },
}, { 
  timestamps: true,
  collection: "unit_test_marks"
});

const UnitTestMark = mongoose.model("UnitTestMark", UnitTestMarkSchema);

async function seedMarks() {
  try {
    // Connect to the main database
    await mongoose.connect('mongodb://localhost:27017/AIuser');
    console.log("Connected to AIuser database.");

    // Retrieve all students
    const usersCollection = mongoose.connection.db.collection('users');
    const students = await usersCollection.find({ role: { $regex: /^student$/i } }).toArray();
    console.log(`Found ${students.length} students.`);

    // Retrieve all materials (units)
    const materialsCollection = mongoose.connection.db.collection('materials');
    const materials = await materialsCollection.find({}).toArray();
    
    // Group units by subject
    const subjectUnits = [];
    materials.forEach(m => {
      subjectUnits.push({
        subject: m.subject,
        topic: m.topic
      });
    });
    console.log(`Found ${subjectUnits.length} total units across subjects.`);

    // Clear existing marks in subjects to ensure clean slate (as they were empty anyway)
    await Subject.deleteMany({});
    await UnitTestMark.deleteMany({});
    console.log("Cleared existing marks.");

    let marksCount = 0;
    const dbOperations = [];
    const newDbOperations = [];

    // Assign dummy marks
    for (const student of students) {
      for (const unit of subjectUnits) {
        // Randomly assign absolute (10% chance) or random marks (40-100)
        let marks;
        if (Math.random() < 0.1) {
          marks = "ABS";
        } else {
          marks = String(Math.floor(Math.random() * (100 - 40 + 1)) + 40);
        }

        // Add to the standard Subject collection so the Frontend works as is
        dbOperations.push({
          insertOne: {
            document: {
              userId: student._id.toString(),
              name: unit.subject,
              title: unit.topic,
              marks: marks,
              exam: "Unit Test",
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        });

        // Add to the dedicated unit_test_marks collection (the requested "db for this marks")
        newDbOperations.push({
          insertOne: {
            document: {
              userId: student._id.toString(),
              studentName: student.name,
              subjectName: unit.subject,
              unitTitle: unit.topic,
              exam: "Unit Test",
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
      await mongoose.connection.db.collection('subjects').bulkWrite(dbOperations);
      await mongoose.connection.db.collection('unit_test_marks').bulkWrite(newDbOperations);
      console.log(`Successfully generated and seeded ${marksCount} marks across all students and subjects.`);
      console.log(`Stored marks in 'subjects' collection for UI compatibility.`);
      console.log(`Stored all unit test marks in newly created 'unit_test_marks' database collection.`);
    }

  } catch (error) {
    console.error("Error seeding marks:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

seedMarks();
