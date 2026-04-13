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

async function checkIds() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        const subjects = await Subject.find({ name: "Physics" });
        const users = await User.find({ role: { $regex: /^student$/i } });
        const userMap = {};
        users.forEach(u => userMap[u._id.toString()] = u.name);

        console.log("--- Physics Subject Records ---");
        subjects.forEach(s => {
            const studentName = userMap[s.userId] || "UNKNOWN";
            console.log(`UserID: ${s.userId}, Name: ${studentName}, Unit: ${s.title}, Marks: ${s.marks}`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkIds();
