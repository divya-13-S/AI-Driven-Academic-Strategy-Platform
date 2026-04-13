const mongoose = require("mongoose");

async function debug() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        const User = mongoose.model("User", new mongoose.Schema({ name: String, role: String }, { collection: "users" }));
        const Subject = mongoose.model("Subject", new mongoose.Schema({ userId: String, name: String, title: String, marks: String }, { collection: "subjects" }));

        const users = await User.find({ role: { $regex: /^student$/i } });
        console.log("--- USERS ---");
        users.forEach(u => console.log(`${u._id.toString()} | ${u.name}`));

        const subjects = await Subject.find({ name: "Physics" });
        console.log("--- SUBJECTS ---");
        subjects.forEach(s => console.log(`${s.userId} | ${s.title} | ${s.marks}`));

        await mongoose.connection.close();
    } catch (err) { console.error(err); }
}
debug();
