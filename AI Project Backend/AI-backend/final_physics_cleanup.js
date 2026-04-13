const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
    userId: String,
    name: String,
    title: String,
    marks: String
}, { collection: "subjects" });

const Subject = mongoose.model("Subject", SubjectSchema);

async function finalCleanup() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        const result = await Subject.deleteMany({ name: "Physics" });
        console.log(`Deleted ${result.deletedCount} Physics records.`);

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

finalCleanup();
