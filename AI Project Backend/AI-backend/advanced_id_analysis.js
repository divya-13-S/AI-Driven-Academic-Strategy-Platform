const mongoose = require("mongoose");

async function debug() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        const User = mongoose.model("User", new mongoose.Schema({}, { collection: "users", strict: false }));
        const Subject = mongoose.model("Subject", new mongoose.Schema({}, { collection: "subjects", strict: false }));

        const subjects = await Subject.find({ name: "Physics" });
        const userIdsInSubjects = subjects.map(s => s.userId);
        
        console.log("Subjects found:", subjects.length);

        for (const s of subjects) {
            const user = await User.findById(s.userId);
            if (user) {
                console.log(`MATCH: ID: '${s.userId}', Name: ${user.name}, Unit: ${s.title}`);
            } else {
                console.log(`MISMATCH: ID: '${s.userId}', Unit: ${s.title}`);
                // Try to see if it's there but as ObjectId or String
                const userAlt = await User.findOne({ _id: s.userId });
                if (userAlt) {
                     console.log(`  (Found via findOne: ${userAlt.name})`);
                } else {
                     console.log(`  (Not found via findOne)`);
                }
            }
        }

        await mongoose.connection.close();
    } catch (err) { console.error(err); }
}
debug();
