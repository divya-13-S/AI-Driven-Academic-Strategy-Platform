const mongoose = require("mongoose");
const Subject = require("./AI-backend/Subject");

async function investigate() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        console.log("\n--- Subject (Student) Collection (Detailed) ---");
        const allStudentSubs = await Subject.find({});
        console.log(`Total Student Sub entries: ${allStudentSubs.length}`);
        
        allStudentSubs.forEach(s => {
            console.log(`ID: ${s._id}, User: ${s.userId}, Subject: "${s.name}", Unit: "${s.title}", Marks: "${s.marks}", Exam: "${s.exam}"`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
investigate();
