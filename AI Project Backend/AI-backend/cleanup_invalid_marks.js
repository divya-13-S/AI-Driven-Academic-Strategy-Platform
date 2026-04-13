const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    role: String
}, { collection: "users" });

const SubjectSchema = new mongoose.Schema({
    userId: String,
    name: String,
    title: String,
    marks: String
}, { collection: "subjects" });

const User = mongoose.model("User", UserSchema);
const Subject = mongoose.model("Subject", SubjectSchema);

async function cleanup() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        const subjects = await Subject.find({});
        const users = await User.find({ role: { $regex: /^student$/i } });
        const validUserIds = new Set(users.map(u => u._id.toString()));

        let deletedCount = 0;

        for (const s of subjects) {
            const isInvalidId = !validUserIds.has(s.userId);
            const isEmptyMarks = !s.marks || s.marks.trim() === "";

            if (isInvalidId || isEmptyMarks) {
                console.log(`Deleting invalid record: Unit: ${s.title}, Marks: ${s.marks}, UserID: ${s.userId} (Invalid: ${isInvalidId}, Empty Marks: ${isEmptyMarks})`);
                await Subject.findByIdAndDelete(s._id);
                deletedCount++;
            }
        }

        console.log(`Cleanup complete. Deleted ${deletedCount} records.`);
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

cleanup();
