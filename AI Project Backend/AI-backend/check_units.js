const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
    userId: String,
    name: String,        // subject name
    title: String,       // topic
    marks: String,       // previous marks
    exam: String         // exam date
}, { timestamps: true });

const Subject = mongoose.model("Subject", SubjectSchema, "subjects");

async function checkUnits() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        const subjectName = "Physics";
        const records = await Subject.find({ name: subjectName });
        
        console.log("TOTAL RECORDS:", records.length);
        records.forEach(r => {
            console.log(JSON.stringify({
                userId: r.userId,
                title: r.title,
                marks: r.marks
            }));
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkUnits();
