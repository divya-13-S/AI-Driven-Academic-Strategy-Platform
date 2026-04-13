const mongoose = require("mongoose");
const Material = require("./AI-backend/Materials");
const Topic = require("./AI-backend/Topics");
const Subject = require("./AI-backend/Subject");

async function investigate() {
    try {
        await mongoose.connect("mongodb://localhost:27017/AIuser");
        console.log("Connected to MongoDB");

        console.log("\n--- Material Collection ---");
        const allMaterials = await Material.find({});
        console.log(`Total Materials: ${allMaterials.length}`);
        allMaterials.forEach(m => {
            console.log(`Subject: "${m.subject}", Topic: "${m.topic}", Content: "${m.content.substring(0, 20)}..."`);
        });

        console.log("\n--- Topic Collection ---");
        const allTopics = await Topic.find({});
        console.log(`Total Topics: ${allTopics.length}`);
        allTopics.forEach(t => {
            console.log(`Subject: "${t.subject}", TopicName: "${t.topicName}"`);
        });

        console.log("\n--- Subject (Student) Collection ---");
        const allStudentSubs = await Subject.find({});
        console.log(`Total Student Sub entries: ${allStudentSubs.length}`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
investigate();
