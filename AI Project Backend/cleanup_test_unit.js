const mongoose = require("mongoose");
const Topic = require("./AI-backend/Topics");
const Material = require("./AI-backend/Materials");
const Subject = require("./AI-backend/Subject");

async function cleanupTestUnit() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        const testTitle = "Unit 1: Test";
        const subject = "Physics";

        const res1 = await Topic.deleteMany({ topicName: testTitle, subject: subject });
        const res2 = await Material.deleteMany({ topic: testTitle, subject: subject });
        const res3 = await Subject.deleteMany({ title: testTitle, name: subject });

        console.log(`Deleted from Topics: ${res1.deletedCount}`);
        console.log(`Deleted from Materials: ${res2.deletedCount}`);
        console.log(`Deleted from Subjects: ${res3.deletedCount}`);

        console.log("Cleanup completed!");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
cleanupTestUnit();
