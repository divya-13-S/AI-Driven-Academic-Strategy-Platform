const mongoose = require("mongoose");

async function debug() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        const User = mongoose.model("User", new mongoose.Schema({ name: String, role: String }, { collection: "users" }));
        const Subject = mongoose.model("Subject", new mongoose.Schema({ userId: String, name: String, title: String, marks: String }, { collection: "subjects" }));

        const users = await User.find({ role: { $regex: /^student$/i } });
        const validUserIds = new Set(users.map(u => u._id.toString()));

        const subjects = await Subject.find({ name: "Physics" });
        
        console.log("--- ANALYSIS ---");
        subjects.forEach(s => {
            const isValid = validUserIds.has(s.userId);
            if (!isValid) {
                console.log(`MISMATCH: UserID: ${s.userId}, Unit: ${s.title}, Marks: ${s.marks}`);
            } else {
                console.log(`MATCH: UserID: ${s.userId}, Unit: ${s.title}, Marks: ${s.marks}`);
            }
        });

        await mongoose.connection.close();
    } catch (err) { console.error(err); }
}
debug();
