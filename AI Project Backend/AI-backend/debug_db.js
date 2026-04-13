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

async function debug() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        const users = await User.find({ role: { $regex: /^student$/i } });
        console.log("STUDENT USERS IN DB:", users.length);
        users.forEach(u => console.log(`User ID: ${u._id.toString()}, Name: ${u.name}`));

        const subjects = await Subject.find({ name: "Physics" });
        console.log("PHYSICS SUBJECT RECORDS:", subjects.length);
        subjects.forEach(s => {
            console.log(`Subject UserID: ${s.userId}, Unit: ${s.title}, Marks: ${s.marks}`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

debug();
